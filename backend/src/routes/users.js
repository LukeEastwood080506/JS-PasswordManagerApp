const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
let sql;

// Reusable route check handler method.
function routeCheckHandler(routeName){
  return (request, response) =>{
    console.log("GET request to", request.url);
    db.get("SELECT 1", [], (err) =>{
      if(err){
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message
        });
      }
      response.status(401).json({
        message: `The users/${routeName} route and the password manager backend database are running`
      });
    });
  }
}

// GET, POST, PUT, DELETE requests etc.
router.get("/login", routeCheckHandler("login"));
router.get("/signup", routeCheckHandler("signup"));

// POST request for login
router.post("/login", (request, response) => {
  console.log("POST request to", request.url);
  const { email, password } = request.body;
  // Check if an email and password exist in the request body.
  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: "An email and password must be entered for sign-in",
    });
  }
  // Check if the email and password exist in the database.
  sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error",
      });
    }
    if (!row) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    return response.status(200).json({
      success: true,
      message: "Login successful!",
    });
  });
});

// POST request for sign-up
router.post("/signup", (request, response) => {
  console.log("POST request for", request.url);
  const { email, password } = request.body;
  // Check if an email and password exist in the request body.
  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: "An email and password are required for sign up",
    });
  }
  // Check if the user already exists within the database.
  sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], (err, row) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error!",
      });
    }
    if (row) {
      // User already exists
      return response.status(400).json({
        success: false,
        message: "Email is registered under an account!",
      });
    }
    // Add the email and the password into the database using an INSERT statement.
    // Executes the INSERT statement by passing the SQL query, the email and password
    // and a function to handle errors all as parameters.
    sql = `INSERT INTO users (email, password) VALUES (?,?)`;
    db.run(sql, [email, password], function (err) {
      if (err) {
        return response.status(400).json({
          message: "Database Error",
        });
      }
      return response.status(200).json({
        success: true,
        message: "User added successfully",
      });
    });
  });
});
// Export values and functions from the router object.
module.exports = router;
