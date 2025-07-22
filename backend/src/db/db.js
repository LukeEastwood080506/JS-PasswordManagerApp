const sqlite3 = require("sqlite3").verbose();
const path = require("path");
let sql;

// Connect to database
const dbPath = path.join(__dirname, "pm_db.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  return console.log("Backend Database Operational!");
});

// Create users and passwords table.
// sql = `CREATE table users(id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL)`;
// db.run(sql, err =>{
//     if(err){
//         return console.error(err.message);
//     }
//     return console.log("Users table created successfully!");
// });

// sql = `CREATE table passwords(id INTEGER PRIMARY KEY,service TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL)`;
// db.run(sql, err =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Passwords table created successfully!");
// });

// Add data to table
// sql = `INSERT INTO users(email, password) VALUES (?,?)`;
// db.run(sql, ["carltbaines@hotmail.co.uk", "Christmastree24123"], function(err){
//    if(err){
//     return console.error(err.message);
//    }
//    return console.log("Data added to the database table successfully!");
// });

// Query Database
// sql = `SELECT * FROM users`;
// db.all(sql, [], (err, rows) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   return console.log(rows);
// });

// sql = `SELECT * FROM passwords`;
// db.all(sql, [], (err, rows) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   return console.log(rows);
// });

db.all("SELECT * FROM users", [], (err, userRows) =>{
  if(err){
    return console.error(err.message);
  }
  db.all("SELECT * FROM passwords", [], (err, passwordRows) =>{
    if(err){
      return console.error(err.message);
    }
    return console.log("Users:", userRows, "\nPasswords:", passwordRows)
  })
});

// Drop table
// sql = `DROP TABLE users`;
// db.run(sql, (err) =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Users table dropped successfully!");
// });

// sql = `DROP TABLE passwords`;
// db.run(sql, (err) =>{
//   if(err){
//     return console.error(err.message);
//   }
//   return console.log("Passwords table dropped successfully!");
// });

// Exports the db object
module.exports = db;
