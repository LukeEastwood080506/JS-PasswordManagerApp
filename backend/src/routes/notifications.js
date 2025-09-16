const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");


// Reusable route check handler method.
function routeCheckHandler() {
  // Health check handler for /notifications routes
  return (request, response) => {
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
  // Return all notifications for the logged-in user
  const userId = request.session.userId;
  db.all("SELECT id, title, content FROM notifications WHERE user_id = ?", [userId], (err, rows) => {
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
  // Add a new notification for the logged-in user
  const userId = request.session.userId;
  if (!userId) {
    return response.status(401).send({
      success: false,
      message: "Unauthorised - Notifications"
    });
  }
  const { title, content } = request.body;
  if (!title || !content) {
    return response.status(400).send({
      success: false,
      message: "A notification title is required as well as content",
    });
  }
  const insertSql = `INSERT INTO notifications(user_id, title, content) VALUES (?,?,?)`;
  db.run(insertSql, [userId, title, content], function (err) {
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
  // Delete a notification by id
  const { id } = request.body;
  if (!id) {
    return response.status(400).send({
      success: false,
      message: "A notification id is required for deletion"
    });
  }
  // Check if notification exists
  db.get(`SELECT * FROM notifications WHERE id = ?`, [id], function (err, row) {
    if (err) {
      return response.status(500).send({
        success: false,
        message: "Database Error: " + err.message
      });
    }
    if (!row) {
      return response.status(401).send({
        success: false,
        message: "Notification does not exist for deletion!"
      });
    }
    // Delete the notification
    db.run(`DELETE FROM notifications WHERE id = ?`, [id], function (err) {
      if (err) {
        return response.status(400).send({
          success: false,
          message: "Notification record could not be deleted (Database Error: " + err.message + ")",
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
