const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./data/students.db')

// =======================
// DASHBOARD (LIST)
// =======================
exports.dashboard = (req, res) => {
  const { search, class: cls, section } = req.query

  let query = "SELECT * FROM students WHERE 1=1"
  let params = []

  if (search) {
    query += " AND name LIKE ?"
    params.push(`%${search}%`)
  }

  if (cls) {
    query += " AND class = ?"
    params.push(cls)
  }

  if (section) {
    query += " AND section = ?"
    params.push(section)
  }

  query += " ORDER BY id DESC"

  db.all(query, params, (err, rows) => {
    if (err) return res.send("DB Error")

    res.render('admin', {
      students: rows,
      filters: { search, class: cls, section }
    })
  })
}

// =======================
// DOWNLOAD ALL PDFs
// =======================
exports.downloadAll = (req, res) => {
  const folderPath = path.join(__dirname, '../idcards')

  res.attachment('all-id-cards.zip')

  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.pipe(res)
  archive.directory(folderPath, false)
  archive.finalize()
}

// =======================
// EDIT PAGE
// =======================
exports.editPage = (req, res) => {
  const id = req.params.id

  db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
    if (err) return res.send("Error")
    res.render('form', { data: row })
  })
}

// =======================
// UPDATE
// =======================
exports.updateStudent = (req, res) => {
  const id = req.params.id
  const data = req.body

  const sql = `
  UPDATE students SET
  name=?, class=?, section=?, roll=?, blood=?, father=?, mother=?, contact=?, address=?
  WHERE id=?
  `

  db.run(sql, [
    data.name,
    data.class,
    data.section,
    data.roll,
    data.blood,
    data.father,
    data.mother,
    data.contact,
    data.address,
    id
  ], (err) => {
    if (err) return res.send("Update Error")
    res.redirect('/admin')
  })
}

// =======================
// DELETE
// =======================
exports.deleteStudent = (req, res) => {
  const id = req.params.id

  db.get("SELECT pdf FROM students WHERE id=?", [id], (err, row) => {

    if (row && row.pdf && fs.existsSync(row.pdf)) {
      fs.unlinkSync(row.pdf) // delete PDF file
    }

    db.run("DELETE FROM students WHERE id=?", [id], () => {
      res.redirect('/admin')
    })
  })
}