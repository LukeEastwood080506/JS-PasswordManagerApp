const sqlite3 = require("sqlite3").verbose();
const { table } = require("console");
const path = require("path");
let sql;

// Connect to database
const dbPath = path.join(__dirname, "pm_db.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  return console.log("Database Setup Successful");
});

// Create table
// sql = `CREATE table users(id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL)`;
// db.run(sql, err =>{
//     if(err){
//         return console.error(err.message);
//     }
//     return console.log("Table created successfully!");
// });

// Add data to table
// sql = `INSERT INTO users(email, password) VALUES (?,?)`;
// db.run(sql, ["carltbaines@hotmail.co.uk", "Christmastree24123"], function(err){
//    if(err){
//     return console.error(err.message);
//    }
//    return console.log("Data added to the database table successfully!");
// });

// Query table
sql = `SELECT * FROM users`;
db.all(sql, [], (err, rows) => {
  if (err) {
    return console.error(err.message);
  }
  return console.log(rows);
});

// Drop table
// sql = `DROP TABLE users`;
// db.run(sql);

// Exports the db object
module.exports = db;
