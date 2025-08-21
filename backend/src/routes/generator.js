const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require("bcrypt");

// Reusable route check handler method.
function routeCheckHandler() {
  return (request, response) => {
    console.log(`GET request to /generator${request.url}`);
    db.get("SELECT 1", [], (err) => {
      if (err) {
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message,
        });
      }
      response.status(401).json({
        message: `The /generator${request.url} route and the password manager backend database are operational!`,
      });
    });
  };
}

// GET, POST, PUT, DELETE requests etc.
router.get("/", routeCheckHandler());
router.get("/new", routeCheckHandler());

router.post("/new", (request, response) => {
   console.log(`POST request to /generator${request.url}`);
   const { generatedPassword, vaultService } = request.body;
   if(!generatedPassword || !vaultService){
    return response.status(400).send({
        success: false,
        message: "A generated password and a vault service is required for adding the generated password to the vault!"
    });
   }
   const selectSql = `SELECT * FROM passwords WHERE service = ?`;
   db.get(selectSql, [vaultService], function(err, row){
    if(err){
        return response.status(401).send({
            success: false,
            message: "Database Error: " + err.message
        });
    }
    // Record not found
    if(!row){
        return response.status(500).send({
            success: false,
            message: "No password record was found for the vault service inputted"
        });
    }
    // Record found - retrieve ID.
    const id = row.id;
    const updateSql = `UPDATE passwords SET password = ? WHERE id = ?`;
    const salt = bcrypt.genSaltSync(13);
    const hashedGeneratedPassword = bcrypt.hashSync(generatedPassword, salt);
    // Hash the generated password before storing it in the vault.
    db.run(updateSql, [hashedGeneratedPassword, id], function(err){
        if(err){
            return response.status(401).send({
                success: false,
                message: "Database Error: " + err.message
            });
        }
        return response.status(200).send({
            success: true,
            message: "The generated password has successfully been added to the vault and attached to an existing record"
        });
    });
   });
});



module.exports = router;