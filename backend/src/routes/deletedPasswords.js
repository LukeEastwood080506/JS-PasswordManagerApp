const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const bcrypt = require("bcrypt");

let sql;

// Reusable route check handler method.
function routeCheckHandler() {
  return (request, response) => {
    console.log(`GET request to /deletedPasswords${request.url}`);
    db.get("SELECT 1", [], (err) => {
      if (err) {
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message,
        });
      }
      response.status(401).json({
        message: `The /deletedPasswords${request.url} route and the password manager backend database are operational!`,
      });
    });
  };
}

// GET, POST, PUT requests etc.
router.get("/", routeCheckHandler());
router.get("/add", routeCheckHandler());
router.get("/delete", routeCheckHandler());

router.get("/all", (request, response) => {
  console.log(`GET request to /deletedPasswords${request.url}`);
  db.all(
    "SELECT deletedService, deletedEmail FROM deletedPasswords",
    [],
    (err, rows) => {
      if (err) {
        return response.status(400).send({
          success: false,
          message: "Database Error: " + err.message,
        });
      }
      return response.status(200).send({
        success: true,
        data: rows,
      });
    }
  );
});

// POST request to retrieve a deleted password record and add it to the deletedPasswords table in the database.
router.post("/add", (request, response) =>{
  console.log(`POST request to /deletedPasswords${request.url}`);
  const { deletedService, deletedEmail } = request.body;
  // console.log("Deleted service: ", deletedService);
  // console.log("Deleted email: ", deletedEmail);
  if(!deletedService || !deletedEmail){
    return response.status(400).send({
      success: false,
      message: "A deleted service and deleted email is required"
    });
  }
  sql = `INSERT INTO deletedPasswords (deletedService, deletedEmail) VALUES (?,?)`;
  db.run(sql, [deletedService, deletedEmail], function(err){
    if(err){
      return response.status(401).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    return response.status(200).send({
      success: true,
      message: "Deleted Password record added to recycle bin successfully!"
    });
  });
});

router.post("/delete", (request, response) => {
  console.log(`POST request to /deletedPasswords${request.url}`);
  const { deletedService, deletedEmail } = request.body;
  if(!deletedService || !deletedEmail){
    return response.status(400).send({
      success: false,
      message: "A service and an email is required for permenant deletion"
    });
  }
  sql = `SELECT * FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
  // Find recycle bin record for deletion
  db.get(sql, [deletedService, deletedEmail], function(err, row){
    if(err){
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if(!row){
      return response.status(401).send({
        success: false,
        message: "No recycle bin record was found for deletion"
      });
    }
    // Delete the record.
    sql = `DELETE FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
    db.run(sql, [deletedService, deletedEmail], function(err){
      if(err){
        return response.status(500).send({
          success: false,
          message: "Failed to delete recycle bin record: " + err.message
        });
      }
      return response.status(200).send({
        success: true,
        message: "Password record permanently deleted from recycle bin!"
      });
    })
  });
});

module.exports = router;
