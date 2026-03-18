const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "students.db")

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database error:", err.message)
  } else {
    console.log("SQLite database connected")
  }
})

db.run(`
CREATE TABLE IF NOT EXISTS students (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
class TEXT,
section TEXT,
roll TEXT,
blood TEXT,
father TEXT,
mother TEXT,
contact TEXT,
address TEXT,
pdf TEXT,
date TEXT
)
`)

module.exports = db