const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");

// GET, POST, PUT, DELETE requests etc.
router.get("/", (request, response) => {
  db.get("SELECT 1", [], (err) =>{
    if(err){
       console.error("Database is not working (", err.message, ")");
       return response.json({
            message: "Database is not working",
            error: err.message
       }); 
    }
    response.json({
        message: "User route and database are working"
    });
  });
});

// Export values and functions from the router object.
module.exports = router;
