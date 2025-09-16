const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const bcrypt = require("bcrypt");

// Reusable route check handler method.
function routeCheckHandler() {
  // Health check handler for /deletedPasswords routes
  return (request, response) => {
    // console.log(`GET request to /deletedPasswords${request.url}`);
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
  // Return all deleted password records for the logged-in user
  const userId = request.session.userId;
  db.all(
    "SELECT * FROM deletedPasswords WHERE user_id = ?",
    [userId],
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
router.post("/add", (request, response) => {
  // Add a deleted password record to the recycle bin (with encryption)
  const { deletedService, deletedEmail, deletedPassword, pin } = request.body;
  const userId = request.session.userId;
  if (!userId || !deletedService || !deletedEmail || !deletedPassword || !pin) {
    return response.status(400).send({
      success: false,
      message: "A userId, a deleted service, email, password and pin is required",
    });
  }
  // Encryption
  // Convert pin to integer.
  let intPin = parseInt(pin);
  let newPassword = "";
  // Iterates through the deletedPassword converted array.
  Array.from(deletedPassword).forEach(x => {
    // Gets the character code of each character and multiplies it by the pin - encryption.
    let y = x.charCodeAt(0) * intPin;
    if (newPassword.length != 0) {
      newPassword += ";"
    }
    // Builds newPassword - semicolon-seperated string of numbers
    newPassword += `${y}`;
  });
  // The deletedPassword needs to be hashed before being inserted into the database.
  const insertSql = `INSERT INTO deletedPasswords (user_id, deletedService, deletedEmail, deletedPassword) VALUES (?,?,?,?)`;
  db.run(
    insertSql,
    [userId, deletedService, deletedEmail, newPassword],
    function (err) {
      if (err) {
        return response.status(401).send({
          success: false,
          message: "Database Error: " + err.message,
        });
      }
      return response.status(200).send({
        success: true,
        message: "Deleted Password record added to recycle bin successfully!",
      });
    }
  );
});

router.post("/show", (request, response) => {
  // Decrypt and return a deleted password for a given service/email/pin
  const { deletedService, deletedEmail, deletedPassword, pin } = request.body;
  if (!deletedService || !deletedEmail || !deletedPassword || !pin) {
    return response.status(400).send({
      success: false,
      message:
        "A deleted service, email, password and pin is required to make the password visible",
    });
  }
  const selectSql = `SELECT deletedPassword FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
  db.get(selectSql, [deletedService, deletedEmail], (err, row) => {
    if (err) {
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "Deleted password not found for display",
      });
    }
    // Decrypt the recycle bin password stored in the database for viewing.
    let deletedPassword = "";
    let intPin = parseInt(pin);
    // Takes the encoded semi-colon seperated string and turns into an array of strings without the semi-colon.
    // It is then iterated over.
    row.deletedPassword.split(";").forEach((x) => {
      // Undos the encryption by getting the character code of each character.
      let y = parseInt(x) / intPin;
      // The decrypted deleted password is built by turning the character codes into the original characters.
      deletedPassword += String.fromCharCode(y);
    });
    return response.status(200).send({
      success: true,
      message: deletedPassword,
    });
  });
});

router.post("/delete", (request, response) => {
  // Permanently delete a deleted password record from the recycle bin
  const { deletedService, deletedEmail, deletedPassword } = request.body;
  if (!deletedService || !deletedEmail || !deletedPassword) {
    return response.status(400).send({
      success: false,
      message:
        "A service, email and password is required for permenant deletion",
    });
  }
  const selectSql = `SELECT * FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
  // Find recycle bin record for deletion
  db.get(selectSql, [deletedService, deletedEmail], function (err, row) {
    if (err) {
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "No recycle bin record was found for deletion",
      });
    }
    // Delete the record.
    const deleteSql = `DELETE FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
    db.run(deleteSql, [deletedService, deletedEmail], function (err) {
      if (err) {
        return response.status(500).send({
          success: false,
          message: "Failed to delete recycle bin record: " + err.message,
        });
      }
      return response.status(200).send({
        success: true,
        message: "Password record permanently deleted from recycle bin!",
      });
    });
  });
});

router.post("/restore", (request, response) => {
  // Restore a deleted password record from the recycle bin to the vault
  const { deletedService, deletedEmail, deletedPassword } = request.body;
  const userId = request.session.userId;
  if (!userId || !deletedService || !deletedEmail || !deletedPassword) {
    return response.status(400).send({
      success: false,
      message: "A service, email and password is required for restoration",
    });
  }
  // Delete the recycle bin record permenantly after restoring the record to the vault.
  const sqlSelect = `SELECT * FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
  // Find recycle bin record for deletion
  db.get(sqlSelect, [deletedService, deletedEmail], function (err, row) {
    if (err) {
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "No recycle bin record was found for deletion",
      });
    }
    // Restore the password record by adding it to the passwords table (the vault)
    const sqlInsert = `INSERT INTO passwords (user_id, service, email, password) VALUES (?,?,?,?)`;
    db.run(
      sqlInsert,
      [userId, deletedService, deletedEmail, deletedPassword],
      function (err) {
        if (err) {
          return response.status(400).send({
            success: false,
            message: "Database Error: " + err.message,
          });
        }
        // Delete the record.
        const sqlDelete = `DELETE FROM deletedPasswords WHERE deletedService = ? AND deletedEmail = ?`;
        db.run(sqlDelete, [deletedService, deletedEmail], function (err) {
          if (err) {
            return response.status(500).send({
              success: false,
              message: "Failed to delete recycle bin record: " + err.message,
            });
          }
          // Send one final response.
          return response.status(200).send({
            success: true,
            message: "Password record permanently deleted from recycle bin!",
          });
        });
      }
    );
  });
});

module.exports = router;
