const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const bcrypt = require("bcrypt");
const { route } = require("./users");
const requireLogin = require("../middleware/auth");


// Reusable route check handler method.
function routeCheckHandler() {
  return (request, response) => {
    console.log(`GET request to /passwords${request.url}`);
    db.get("SELECT 1", [], (err) => {
      if (err) {
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message,
        });
      }
      response.status(401).json({
        message: `The /passwords${request.url} route and the password manager backend database are operational!`,
      });
    });
  };
}

router.get("/all", (request, response) => {
  console.log(`GET request to /passwords${request.url}`);
  db.all("SELECT service, email, password FROM passwords", [], (err, rows) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    return response.status(200).send({
      success: true,
      data: rows,
    });
  });
});

// GET, POST, PUT, DELETE requests etc.
router.get("/", routeCheckHandler());
router.get("/show", routeCheckHandler());
router.get("/new", routeCheckHandler());
router.get("/edit", routeCheckHandler());
router.get("/edit/master", routeCheckHandler());
router.get("/delete", routeCheckHandler());

router.post("/show", (request, response) => {
  console.log(`POST request to /passwords${request.url}`);
  const { service, email, password } = request.body;
  if (!service || !email || !password) {
    return response.status(400).send({
      success: false,
      message:
        "A service, email and password is required to make the password visible",
    });
  }
  const selectSql = `SELECT password FROM passwords WHERE service = ? AND email = ?`;
  db.get(selectSql, [service, email], (err, row) => {
    if (err) {
      console.error(err.message);
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    if (!row) {
      // No password record found to display.
      return response.status(401).send({
        success: false,
        message: "Password record not found for display",
      });
    }
    // Password record found.
    return response.status(200).send({
      success: true,
      message: row.password,
    });
  });
});

router.post("/new", requireLogin, (request, response) => {
  console.log(`POST request to /passwords${request.url}`);
  // console.log(request.body);
  const { service, email, password } = request.body;
  const userId = request.session.userId;
  // console.log("userId: ", userId);
  if (!userId || !service || !email || !password) {
    return response.status(400).send({
      success: false,
      message: "A userId, service, email and password is required to store a password",
    });
  }
  const insertSql = `INSERT INTO passwords(user_id, service, email, password) VALUES (?,?,?,?)`;
  const salt = bcrypt.genSaltSync(13);
  const hashedPassword = bcrypt.hashSync(password, salt);
  db.all(insertSql, [userId, service, email, hashedPassword], (err) => {
    if (err) {
      console.error(err.message);
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    return response.status(200).send({
      success: true,
      message: "Password successfully added to the password manager database",
    });
  });
});

router.post("/edit", (request, response) => {
  console.log(`POST request to /passwords${request.url}`);
  const {
    originalService,
    originalEmail,
    originalPassword,
    newService,
    newEmail,
    newPassword,
  } = request.body;
  if (
    !originalService ||
    !originalEmail ||
    !originalPassword ||
    !newService ||
    !newEmail ||
    !newPassword
  ) {
    return response.status(400).json({
      success: false,
      message: "All fields are required for editing",
    });
  }
  // Use the original service and the original email to fetch the correct password record for editing.
  // Removes the need to query via ID.
  const selectSql = `SELECT * FROM passwords WHERE service = ? AND email = ?`;
  db.get(selectSql, [originalService, originalEmail], (err, row) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    if (!row) {
      return response.status(401).json({
        success: false,
        message: "Original password record not found",
      });
    }
    // Confirm its the right record by comparing the hash of the originalPassword with the hashed password stored in the database.
    // console.log("Original Password: ", originalPassword);
    // console.log("Password in database: ", row.password);
    const isRecord = bcrypt.compareSync(originalPassword, row.password);
    if (!isRecord) {
      return response.status(401).json({
        success: false,
        message: "Original password did not match",
      });
    }
    // Store new hashed password in variable
    const salt = bcrypt.genSaltSync(13);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);
    const updateSql = `UPDATE passwords SET service = ?, email = ?, password = ? WHERE service = ? AND email = ?`;
    db.run(
      updateSql,
      [newService, newEmail, hashedNewPassword, originalService, originalEmail],
      function (err) {
        if (err) {
          return response.status(400).json({
            success: false,
            message: "Database Error: " + err.message,
          });
        }
        // Password record edited successfully.
        response.status(200).json({
          success: true,
          message: "Password record edited successfully",
        });
      }
    );
  });
});

router.post("/edit/master", (request, response) => {
  console.log(`POST request to /passwords${request.url}`);
  const { originalPassword, newPassword } = request.body;
  const userId = request.session.userId;
  // console.log("Original password: ", originalPassword);
  // console.log("New password: ", newPassword);
  // console.log("userId: ", userId);
  if(!userId || !originalPassword || !newPassword){
    return response.status(400).send({
      success: false,
      message: "A userId, original password and new password is required to edit the master password"
    });
  }
  // Find record in users that contains the original password under the userId.
  const selectSql = `SELECT * FROM users WHERE id = ?`;
  db.get(selectSql, [userId], function(err, row){
    if(err){
      return response.status(401).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if(!row){
      return response.status(500).send({
        success: false,
        message: "Record not found for editing!"
      });
    }
    // Compare the plain text originalPassword with the hash of the password.
    const isMatch = bcrypt.compareSync(originalPassword, row.password);
    if(!isMatch){
      return response.status(501).send({
        success: false,
        message: "Original password doesnt match!"
      });
    }
    // If original password matches, update the user record to store the new password.
    // Hash the new password before storing it in the database.
    const salt = bcrypt.genSaltSync(13);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);
    const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
    db.run(updateSql, [hashedNewPassword, userId], function(err){
      if(err){
        return response.status(401).send({
          success: false,
          message: "Database Error: " + err.message
        });
      }
      return response.status(200).send({
        success: true,
        message: "Master password successfully updated!"
      });
    });
  });
});

router.post("/delete", async (request, response) => {
  console.log(`DELETE request to /passwords${request.url}`);
  const { service, email, password } = request.body;
  // Check if the service, email, password exist for deletion.
  if (!service || !email || !password) {
    return response.status(400).send({
      success: false,
      message: "A service, email and password is required for deletion",
    });
  }

  try {
    // Wrap db.get in a promise.
    const row = await new Promise((resolve, reject) => {
      const selectSql = `SELECT * FROM passwords WHERE email = ? AND service = ?`;
      db.get(selectSql, [email, service], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!row) {
      return response.status(400).json({
        success: false,
        message: "Error! Password could not be deleted",
      });
    }

    // Retrieve the hashed password
    const hashedPassword = row.password;
    // console.log(password);
    // console.log(hashedPassword);
    if (password !== hashedPassword) {
      return response.status(401).json({
        success: false,
        message: "Error! Password record has not been matched for deletion",
      });
    }

    // Wrap db.run in a promise.
    await new Promise((resolve, reject) => {
      const deleteSql = `DELETE FROM passwords WHERE service = ? AND email = ?`;
      db.run(deleteSql, [service, email], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return response.status(200).json({
      success: true,
      message: "Password successfully deleted from the vault!"
    });
  } catch (err) {
    return response.status(400).json({
      success: false,
      message: "Database Error: " + err.message
    });
  }
});
// Export values and functions from the router object.
module.exports = router;
