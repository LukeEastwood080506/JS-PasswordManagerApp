const express = require("express");
const router = express.Router();
// Import database
const db = require("../db/db");
const { route } = require("./users");


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
  const userId = request.session.userId;
  console.log(`GET request to /notifications${request.url}`);
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
  console.log(`POST request to /notifications${request.url}`);
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
  console.log(`POST request to /notifications${request.url}`);
  const { id } = request.body;
  const userId = request.session.userId;
  if (!id) {
    return response.status(400).send({
      success: false,
      message:
        "A notification id is required for deletion",
    });
  }
  const deleteSql = `DELETE FROM notifications WHERE id = ? AND user_id = ?`;
  db.run(deleteSql, [id, userId], function (err) {
    if (err) {
      return response.status(400).send({
        success: false,
        message:
          "Notification record could not be deleted (Database Error: " +
          err.message +
          ")",
      });
    }
    // Flags whether a row was actually deleted.
    if (this.changes === 0) {
      return response.status(401).send({
        success: false,
        message: "No notification record was found for deletion"
      });
    }
    return response.status(200).send({
      success: true,
      message: "Notification successfully deleted!",
    });
  });
});

module.exports = router;
