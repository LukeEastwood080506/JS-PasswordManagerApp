const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const bcrypt = require('bcrypt');


// Reusable route check handler method for health checks
function routeCheckHandler(routeName) {
  return (request, response) => {
    // console.log(`GET request to /users${request.url}`);
    db.get("SELECT 1", [], (err) => {
      if (err) {
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message
        });
      }
      response.status(401).json({
        message: `The users/${routeName} route and the password manager backend database are operational!`
      });
    });
  }
}

// GET, POST, PUT, DELETE requests etc.
router.get("/login", routeCheckHandler("login"));
router.get("/signup", routeCheckHandler("signup"));
router.get("/forgotpassword", routeCheckHandler("forgotpassword"));
router.get("/forgotpassword/new", routeCheckHandler("forgotpassword/new"));
router.get("/emails", routeCheckHandler("emails"));
router.get("/emails/change", routeCheckHandler("emails/change"));
router.get("/delete", routeCheckHandler("delete"));
router.get("/logout", routeCheckHandler("logout"));
// router.get("/check", routeCheckHandler("check"));

router.get("/all", (request, response) => {
  // Return all user records (for admin/debugging)
  const selectSql = `SELECT * FROM users`;
  db.get(selectSql, [], (err, row) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error"
      });
    }
    if (!row) {
      // No records in database
      return response.status(401).json({
        success: false,
        message: "No user records stored in database"
      });
    }
    return response.status(200).json({
      success: true,
      message: row
    });
  });
});

router.get("/check", (request, response) => {
  // Check if a session exists and if a userId is associated with the session.
  if (request.session && request.session.userId) {
    return response.status(200).json({
      success: true,
      userId: request.session.userId
    });
  } else {
    return response.status(200).json({
      success: false
    });
  }
});

// POST request for login
router.post("/login", (request, response) => {
  const { email, password } = request.body;
  // Check if an email and password exist in the request body.
  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: "An email and password must be entered for sign-in",
    });
  }
  // Look up user by email and compare hashed password
  const selectSql = `SELECT * FROM users WHERE email = ?`;
  db.get(selectSql, [email], (err, row) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Database Error"
      });
    }
    if (!row) {
      // Email not found.
      return response.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    // Retrieve the hashed password
    const hashedPassword = row.password;
    // Compare the hashed password with the user-inputted password.
    const isMatch = bcrypt.compareSync(password, hashedPassword);
    if (!isMatch) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    // Saves userId in session.
    request.session.userId = row.id;
    request.session.save(err => {
      if (err) {
        console.error("Session save error: ", error);
        return response.status(500).json({
          success: false,
          message: "Session Error"
        });
      }
      return response.status(200).json({
        success: true,
        message: "User Log-in Successful!"
      });
    })
  });
});

// POST request for sign-up
router.post("/signup", (request, response) => {
  const { email, password } = request.body;
  // Check if an email and password exist in the request body.
  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: "An email and password are required for sign up",
    });
  }
  // Check if the user already exists within the database.
  const selectSql = `SELECT * FROM users WHERE email = ?`;
  db.get(selectSql, [email], (err, row) => {
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
    // The password is hashed using bcrypt before being stored in the database.
    // An INSERT statement is ran which passes the SQL query, the email and password
    // and a function to handle errors, all as parameters.
    const insertSql = `INSERT INTO users (email, password) VALUES (?,?)`;
    const salt = bcrypt.genSaltSync(13);
    const hashedPassword = bcrypt.hashSync(password, salt);
    db.run(insertSql, [email, hashedPassword], function (err) {
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

router.post("/emails", (request, response) => {
  // Return the email for the currently logged-in user
  const userId = request.session.userId;
  if (!userId) {
    return response.status(401).send({
      success: false,
      message: "A userId is required to display an email"
    });
  }
  const selectSql = `SELECT email FROM users WHERE id = ?`;
  db.get(selectSql, [userId], function (err, row) {
    if (err) {
      return response.status(500).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "Email not found!"
      });
    }
    return response.status(200).send({
      success: true,
      message: row.email
    });
  });
});

router.post("/emails/change", (request, response) => {
  // Change the email for the currently logged-in user
  const { originalEmail, newEmail } = request.body;
  const userId = request.session.userId;
  if (!userId || !originalEmail || !newEmail) {
    return response.status(401).send({
      success: false,
      message: "A userId, original email and new email is required to change the account email"
    });
  }
  // Check if the new email is equal to the original email.
  if (originalEmail === newEmail) {
    return response.status(401).send({
      success: false,
      message: "The email entered cannot be the same as the original!"
    });
  }
  // Locate record that has the original email (check if it is equal to the userid)
  const selectSql = `SELECT * FROM users WHERE id = ? AND email = ?`;
  db.get(selectSql, [userId, originalEmail], function (err, row) {
    if (err) {
      return response.status(500).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    // Record not found.
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "User record with the entered email not found!"
      });
    }
    const updateSql = `UPDATE users SET email = ? WHERE id = ?`;
    db.run(updateSql, [newEmail, userId], function (err) {
      if (err) {
        return response.status(500).send({
          success: false,
          message: "Database Error: " + err.message
        });
      }
      return response.status(200).send({
        success: true,
        message: "Email updated successfully!"
      });
    });
  });
});

router.post("/delete", (request, response) => {
  // Delete the user account and all associated data (cascade)
  const { password } = request.body;
  const userId = request.session.userId;
  if (!password || !userId) {
    return response.status(500).send({
      success: false,
      message: "The password to the account and the userId is required for account deletion"
    });
  }
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
        message: "A user record was not found for deletion with the inputted password"
      });
    }
    // Compare password
    const isMatch = bcrypt.compareSync(password, row.password);
    if (!isMatch) {
      return response.status(401).send({
        success: false,
        message: "Account could not be deleted - incorrect password"
      });
    }
    // Delete user (cascade deletes all related data)
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
      if (err) {
        return response.status(500).send({
          success: false,
          message: "Database Error deleting user: " + err.message
        });
      }
      return response.status(200).send({
        success: true,
        message: "Account and all associated data deleted successfully!"
      });
    });
  });
});

router.post("/logout", (request, response) => {
  // Destroy the session and log out the user
  request.session.destroy((err) => {
    if (err) {
      return response.status(500).send({
        success: false,
        message: "Logout Failed!"
      });
    }
    response.clearCookie("connect.sid"); // express-session cookie.
    return response.status(200).send({
      success: true,
      message: "Log Out successful!"
    });
  });
});

router.post("/forgotpassword", (request, response) => {
  // Check if the email exists for password reset
  const { email } = request.body;
  if (!email) {
    return response.status(401).send({
      success: false,
      message: "An email is required for forgot password!"
    });
  }
  const selectSql = "SELECT * FROM users WHERE email = ?";
  db.get(selectSql, [email], function (err, row) {
    if (err) {
      return response.status(500).send({
        success: false,
        message: "Database Error" + err.message
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "Email does not exist in database!"
      });
    }
    return response.status(200).send({
      success: true,
      message: "Email exists in database! Proceeding to forgot password!"
    });
  });
});

router.post("/forgotpassword/new", (request, response) => {
  // Update the user's password after verifying email and new password
  const { email, confirmedPassword } = request.body;
  if (!email || !confirmedPassword) {
    return response.status(401).send({
      success: false,
      message: "An email and confirmed password is required to change the password"
    });
  }
  // Select the user record that contains the email.
  const selectSql = `SELECT * FROM users WHERE email = ?`;
  db.get(selectSql, [email], function (err, row) {
    if (err) {
      return response.status(500).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "A user record under the email was not found!"
      });
    }
    // Record found - update the password - store as hash in database.
    // Check if confirmedPassword is the same as the original password.
    const originalHashedPassword = row.password;
    const isSame = bcrypt.compareSync(confirmedPassword, originalHashedPassword);
    if (isSame) {
      return response.status(401).send({
        success: false,
        message: "The new password is the same as the original password"
      });
    }
    const salt = bcrypt.genSaltSync(13);
    const hashedPassword = bcrypt.hashSync(confirmedPassword, salt);
    const updateSql = `UPDATE users SET password = ? WHERE email = ?`;
    db.run(updateSql, [hashedPassword, email], function (err) {
      if (err) {
        return response.status(500).send({
          success: false,
          message: "Database Error: " + err.message
        });
      }
      return response.status(200).send({
        success: true,
        message: "Password has been successfully changed!"
      });
    });
  });
});

// Export values and functions from the router object.
module.exports = router;
