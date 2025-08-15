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
router.get("/show", routeCheckHandler());
router.get("/add", routeCheckHandler());
router.get("/delete", routeCheckHandler());
router.get("/restore", routeCheckHandler());

router.get("/all", (request, response) => {
  console.log(`GET request to /deletedPasswords${request.url}`);
  db.all(
    "SELECT deletedService, deletedEmail, deletedPassword FROM deletedPasswords",
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
  const { deletedService, deletedEmail, deletedPassword } = request.body;
  // console.log("Deleted service: ", deletedService);
  // console.log("Deleted email: ", deletedEmail);
  if(!deletedService || !deletedEmail || !deletedPassword){
    return response.status(400).send({
      success: false,
      message: "A deleted service, email and password is required"
    });
  }
  // The deletedPassword needs to be hashed before being inserted into the database.
  const salt = bcrypt.genSaltSync(13);
  const hashedDeletedPassword = bcrypt.hashSync(deletedPassword, salt);
  sql = `INSERT INTO deletedPasswords (deletedService, deletedEmail, deletedPassword) VALUES (?,?,?)`;
  db.run(sql, [deletedService, deletedEmail, hashedDeletedPassword], function(err){
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

router.post("/show", (request, response) => {
  console.log(`POST request to /deletedPasswords${request.url}`);
  const { deletedService, deletedEmail, deletedPassword } = request.body;
  if(!deletedService || !deletedEmail || !deletedPassword){
    return response.status(400).send({
      success: false,
      message: "A deleted service, email and password is required to make the password visible"
    });
  }
  sql = `SELECT deletedPassword FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
  db.get(sql, [deletedService, deletedEmail], (err, row) => {
    if(err){
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if(!row){
      return response.status(401).send({
        success: false,
        message: "Deleted password not found for display"
      });
    }
    return response.status(200).send({
      success: true,
      message: row.deletedPassword
    });
  });
});

router.post("/delete", (request, response) => {
  console.log(`POST request to /deletedPasswords${request.url}`);
  const { deletedService, deletedEmail, deletedPassword } = request.body;
  if(!deletedService || !deletedEmail || !deletedPassword){
    return response.status(400).send({
      success: false,
      message: "A service, email and password is required for permenant deletion"
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

router.post("/restore", (request, response) =>{
  console.log(`POST request to /deletedPasswords${request.url}`);
  // Need the deletedPassword if I am to restore the password record to the vault.
  const { deletedService, deletedEmail, deletedPassword } = request.body;
  if(!deletedService || !deletedEmail || !deletedPassword){
    return response.status(400).send({
      success: false,
      message: "A service, email and password is required for restoration"
    });
  }
  // Restore the password record by adding it to the passwords table (the vault)
  sql = `INSERT INTO passwords (service, email, password) VALUES (?,?,?)`;
  db.run(sql, [deletedService, deletedEmail, deletedPassword], function(err){
    if(err){
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    return response.status(200).send({
      success: true,
      message: "Password successfully restored to the vault!"
    });
  });
  // Delete the recycle bin record permenantly after restoring the record to the vault.
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
