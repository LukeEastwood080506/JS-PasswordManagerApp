const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to database
const dbPath = path.join(__dirname, "pm_db.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
});
// Enables foreign keys in the database.
db.run("PRAGMA foreign_keys = ON");

// Create users, passwords, deletedPasswords and notifications tables.
// const createSql = `CREATE table users(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   email TEXT NOT NULL UNIQUE,
//   password TEXT NOT NULL
// )`;
// db.run(createSql, err =>{
//     if(err){
//         return console.error(err.message);
//     }
//     return console.log("Users table created successfully!");
// });

// const createSql = `CREATE table passwords(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   service TEXT NOT NULL,
//   email TEXT NOT NULL,
//   password TEXT NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
//   UNIQUE(user_id, email, service)
// )`;
// db.run(createSql, err =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Passwords table created successfully!");
// });

// const createSql = `CREATE table deletedPasswords(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   deletedService TEXT NOT NULL, 
//   deletedEmail TEXT NOT NULL, 
//   deletedPassword TEXT NOT NULL, 
//   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// )`;
// db.run(createSql, err =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("deletedPasswords table created successfully!");
// });

// const createSql = `CREATE table notifications(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   title TEXT NOT NULL, 
//   content TEXT NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// )`;
// db.run(createSql, err => {
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("notifications table created successfully!");
// });

// Add data to table
// const insertSql = `INSERT INTO users(email, password) VALUES (?,?)`;
// db.run(insertSql, ["carltbaines@hotmail.co.uk", "Christmastree24123"], function(err){
//    if(err){
//     return console.error(err.message);
//    }
//    return console.log("Data added to the database table successfully!");
// });

// const insertSql = `INSERT INTO notifications(title, content) VALUES (?,?)`;
// db.run(insertSql, ["Test notification", "testing"], function(err){
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Data added to notifications table successfully!");
// });

// Query Database tables
// const selectSql = `SELECT * FROM users`;
// db.all(selectSql, [], (err, rows) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   return console.log(rows);
// });

// const selectSql = `SELECT * FROM passwords`;
// db.all(selectSql, [], (err, rows) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   return console.log(rows);
// });

// const selectSql = `SELECT * FROM deletedPasswords`;
// db.all(selectSql, [], (err, rows) => {
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log(rows);
// })

// const selectSql = `SELECT * FROM notifications`;
// db.all(selectSql, [], (err, rows) => {
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log(rows);
// })

db.all("SELECT * FROM users", [], (err, userRows) => {
  if (err) {
    return console.error(err.message);
  }
  db.all("SELECT * FROM passwords", [], (err, passwordRows) => {
    if (err) {
      return console.error(err.message);
    }
    db.all("SELECT * FROM deletedPasswords", [], (err, deletedPasswordRows) => {
      if (err) {
        return console.error(err.message);
      }
      db.all("SELECT * FROM notifications", [], (err, notificationRows) => {
        if (err) {
          return console.error(err.message);
        }
      });
    });
  });
});

// db.all(
//   `SELECT * FROM passwords WHERE user_id = ?`,
//   [1],
//   (err, rows) => {
//     if(err){
//       console.error(err.message);
//       console.log(rows);
//     }
//   }
// );

// Drop table
// const dropSql = `DROP TABLE users`;
// db.run(dropSql, (err) =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Users table dropped successfully!");
// });

// const dropSql = `DROP TABLE passwords`;
// db.run(dropSql, (err) =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Passwords table dropped successfully!");
// });

// const dropSql = `DROP TABLE deletedPasswords`;
// db.run(dropSql, (err) =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("deletedPasswords table dropped succesfully!");
// });

// const dropSql = `DROP TABLE notifications`;
// db.run(dropSql, (err) => {
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Notifications table dropped successfully!");
// }); 

// Exports the db object
module.exports = db;
