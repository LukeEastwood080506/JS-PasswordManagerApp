const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const bcrypt = require("bcrypt");
const { route } = require("./users");
let sql;

// Reusable route check handler method.
function routeCheckHandler(routeName) {
  return (request, response) => {
    console.log("GET request to", request.url);
    db.get("SELECT 1", [], (err) => {
      if (err) {
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message,
        });
      }
      response.status(401).json({
        message: `The /${routeName} route and the password manager backend database are operational!`,
      });
    });
  };
}

// GET, POST, PUT, DELETE requests etc.
router.get("/", routeCheckHandler("passwords"));
router.get("/new", routeCheckHandler("passwords/new"));
router.get("/edit", routeCheckHandler("passwords/edit"));
router.get("/delete", routeCheckHandler("passwords/delete"));

router.post("/new", (request, response) => {
  console.log("POST request to", request.url);
  // console.log(request.body);
  const { service, email, password } = request.body;
  if (!service || !email || !password) {
    return response.status(400).send({
      success: false,
      message: "A service, email and password is required to store a password",
    });
  }
  sql = `INSERT INTO passwords(service,email,password) VALUES (?,?,?)`;
  const salt = bcrypt.genSaltSync(13);
  const hashedPassword = bcrypt.hashSync(password, salt);
  db.all(sql, [service, email, hashedPassword], (err) => {
    if (err) {
      console.log(err);
      return response.status(400).send({
        success: false,
        message: "Database Error",
      });
    }
    return response.status(200).send({
      success: true,
      message: "Password successfully added to the password manager database",
    });
  });
});

router.post("/edit", (request, response) => {
  console.log("POST request to", request.url);
});

router.post("/delete", (request, response) => {
  console.log("POST request to", request.url);
  const { service, email, password } = request.body;
  // console.log(service, email, password);
  // Check if the service, email, password exist for deletion.
  if (!service || !email || !password) {
    return response.status(400).send({
      success: false,
      message: "An id, service, email and password is required for deletion",
    });
  }
  // Retrieve the hashed password from the database
  // Compare that hashed password with the plain text password.
  // Then if a match is found we can then delete the record.
  sql = `SELECT * FROM passwords WHERE email = ?`;
  db.get(sql, [email], (err, row) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error",
      });
    }
    if (!row) {
      return response.status(400).json({
        success: false,
        message: "Error! Password could not be deleted",
      });
    }
    // Retrieve the hashed password
    const hashedPassword = row.password;
    const isMatch = bcrypt.compareSync(password, hashedPassword);
    if (!isMatch) {
      return response.status(401).json({
        success: false,
        message: "Error! Password could not be deleted",
      });
    }
    // Delete record under the hashed password since it matches with the plain text password stored in the body.
    sql = `DELETE FROM passwords WHERE password = ?`;
    db.run(sql, [hashedPassword], (err) => {
      if (err) {
        return response.status(400).send({
          success: false,
          message: "Database Error!",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Password successfully deleted from the vault!",
      });
    });
  });
});

// Export values and functions from the router object.
module.exports = router;
