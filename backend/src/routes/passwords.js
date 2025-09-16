const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const bcrypt = require("bcrypt");
const { route } = require("./users");
const requireLogin = require("../middleware/auth");
const e = require("express");


// Reusable route check handler method.
function routeCheckHandler() {
  // Health check handler for /passwords routes
  return (request, response) => {
    // console.log(`GET request to /passwords${request.url}`);
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
  // Return all password records for the logged-in user
  const userId = request.session.userId;
  db.all("SELECT * FROM passwords WHERE user_id = ?", [userId], (err, rows) => {
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
  // Decrypt and return a password for a given service/email/pin
  const { service, email, password, pin } = request.body;
  if (!service || !email || !password || !pin) {
    return response.status(400).send({
      success: false,
      message:
        "A service, email, password and pin is required to make the password visible",
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
    // Decrypt password stored in database for viewing.
    let newPassword = "";
    let intPin = parseInt(pin);
    row.password.split(";").forEach((x) => {
      let y = parseInt(x) / intPin;
      newPassword += String.fromCharCode(y);
    });
    // Password record found.
    return response.status(200).send({
      success: true,
      message: newPassword,
    });
  });
});

router.post("/new", requireLogin, (request, response) => {
  // Add a new password record for the logged-in user (with encryption)
  const { service, email, password, pin } = request.body;
  const userId = request.session.userId;
  if (!userId || !service || !email || !password || !pin) {
    return response.status(400).send({
      success: false,
      message: "A userId, service, email, password and pin is required to store a password",
    });
  }
  const insertSql = `INSERT INTO passwords(user_id, service, email, password) VALUES (?,?,?,?)`;
  // Encryption
  let intPin = parseInt(pin);
  let newPassword = "";
  // Loops through the password character array
  Array.from(password).forEach((x) => {
    // Gets the character code of each character and multiplies by the pin.
    let y = x.charCodeAt(0) * intPin;
    if (newPassword.length != 0) {
      // Seperate each character with a semi colon.
      newPassword += ";"
    }
    // Builds the newPassword for database storage.
    newPassword += `${y}`;
  });
  db.all(insertSql, [userId, service, email, newPassword], (err) => {
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
  // Edit an existing password record (with encryption)
  const {
    originalService,
    originalEmail,
    originalPassword,
    newService,
    newEmail,
    newPassword,
    pin
  } = request.body;
  if (
    !originalService ||
    !originalEmail ||
    !originalPassword ||
    !newService ||
    !newEmail ||
    !newPassword ||
    !pin
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
    
    // Encryption   
    let encryptionPin = parseInt(pin);
    let encryptedPassword = "";
    Array.from(newPassword).forEach((x) => {
      let y = x.charCodeAt(0) * encryptionPin;
      if (encryptedPassword.length != 0) {
        encryptedPassword += ";";
      }
      encryptedPassword += `${y}`;
    });

    // Store new encoded password in database.
    const updateSql = `UPDATE passwords SET service = ?, email = ?, password = ? WHERE service = ? AND email = ?`;
    db.run(
      updateSql,
      [newService, newEmail, encryptedPassword, originalService, originalEmail],
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
  // Change the master password for the logged-in user
  const { originalPassword, newPassword } = request.body;
  const userId = request.session.userId;
  if (!userId || !originalPassword || !newPassword) {
    return response.status(400).send({
      success: false,
      message: "A userId, original password and new password is required to edit the master password"
    });
  }
  // Find record in users that contains the original password under the userId.
  const selectSql = `SELECT * FROM users WHERE id = ?`;
  db.get(selectSql, [userId], function (err, row) {
    if (err) {
      return response.status(401).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if (!row) {
      return response.status(500).send({
        success: false,
        message: "Record not found for editing!"
      });
    }
    // Compare the plain text originalPassword with the hash of the password.
    const isMatch = bcrypt.compareSync(originalPassword, row.password);
    if (!isMatch) {
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
    db.run(updateSql, [hashedNewPassword, userId], function (err) {
      if (err) {
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
  // Delete a password record for a given service/email/pin
  const { service, email, password, pin } = request.body;
  // Check if the service, email, password exist for deletion.
  if (!service || !email || !password || !pin) {
    return response.status(400).send({
      success: false,
      message: "A service, email, password and pin is required for deletion",
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
