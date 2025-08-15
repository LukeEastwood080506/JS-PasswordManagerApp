const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const { route } = require("./users");
let sql;

// Reusable route check handler method.
function routeCheckHandler() {
  return (request, response) => {
    console.log(`GET request to /notifications${request.url}`);
    db.get("SELECT 1", [], (err) => {
      if (err) {
        console.error("Database is not working (", err.message, ")");
        return response.status(401).json({
          message: "Database is not working",
          error: err.message,
        });
      }
      response.status(401).json({
        message: `The /notifications${request.url} route and the password manager backend database are operational!`,
      });
    });
  };
}

router.get("/all", (request, response) => {
  console.log(`GET request to /notifications${request.url}`);
  db.all("SELECT title, content FROM notifications", [], (err, rows) => {
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
router.get("/new", routeCheckHandler());
router.get("/delete", routeCheckHandler());

router.post("/new", (request, response) => {
  console.log(`POST request to /notifications${request.url}`);
  const { title, content } = request.body;
  if (!title || !content) {
    return response.status(400).send({
      success: false,
      message: "A notification title is required as well as content",
    });
  }
  sql = `INSERT INTO notifications(title, content) VALUES (?,?)`;
  db.run(sql, [title, content], function (err) {
    if (err) {
      return response.status(401).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    return response.status(200).send({
      success: true,
      message: "Notification added to notifications",
    });
  });
});

router.post("/delete", (request, response) => {
  console.log(`POST request to /notifications${request.url}`);
  const { title, content } = request.body;
  if (!title || !content) {
    return response.status(400).send({
      success: false,
      message:
        "A notification title is required as well as content for deletion",
    });
  }
  // Find notification record for deletion.
  sql = `SELECT * FROM notifications WHERE title = ? AND content = ?`;
  db.get(sql, [title, content], function (err, row) {
    if (err) {
      return response.status(400).send({
        success: false,
        message: "Database Error: " + err.message,
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "No notification record was found for deletion",
      });
    }
    sql = `DELETE FROM notifications WHERE title = ? AND content = ?`;
    db.run(sql, [title, content], function (err) {
      if (err) {
        return response.status(400).send({
          success: false,
          message:
            "Notification record could not be deleted (Database Error: " +
            err.message +
            ")",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Notification successfully deleted!",
      });
    });
  });
});

module.exports = router;
