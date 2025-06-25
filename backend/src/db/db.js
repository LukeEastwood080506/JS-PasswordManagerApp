const sqlite3 = require("sqlite3").verbose();
const path = require("path");
let sql;

// Connect to database
const dbPath = path.join(__dirname, "pm_db.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE,(err) =>{
    if(err){
        return console.error(err.message);
    }
    console.log("Database Setup Successful");
});



// Exports the db object
module.exports = db;