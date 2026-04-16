const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const sqlite3 = require('sqlite3').verbose()
const ExcelJS = require('exceljs')

const db = new sqlite3.Database('./data/students.db')

// =======================
// DASHBOARD (LIST) - ADVANCED
// =======================
exports.dashboard = (req, res) => {
  const { search, class: cls, section, house, roll, blood, dateFrom, dateTo, sortBy } = req.query

  let query = "SELECT * FROM students WHERE 1=1"
  let params = []

  if (search) {
    query += " AND (name LIKE ? OR father LIKE ? OR mother LIKE ?)"
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  if (cls) {
    query += " AND class = ?"
    params.push(cls)
  }

  if (section) {
    query += " AND section = ?"
    params.push(section)
  }

  if (house) {
    query += " AND house = ?"
    params.push(house)
  }

  if (roll) {
    query += " AND roll LIKE ?"
    params.push(`%${roll}%`)
  }

  if (blood) {
    query += " AND blood = ?"
    params.push(blood)
  }

  if (dateFrom) {
    query += " AND date >= ?"
    params.push(dateFrom)
  }

  if (dateTo) {
    query += " AND date <= ?"
    params.push(dateTo)
  }

  const sortOrder = sortBy === 'asc' ? 'ASC' : 'DESC'
  query += ` ORDER BY id ${sortOrder}`

  db.all(query, params, (err, rows) => {
    if (err) return res.send("DB Error")

    res.render('admin', {
      students: rows || [],
      filters: { search, class: cls, section, house, roll, blood, dateFrom, dateTo, sortBy },
      totalRecords: rows ? rows.length : 0
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
  name=?, class=?, section=?, roll=?, house=?, blood=?, father=?, mother=?, contact=?, address=?
  WHERE id=?
  `

  db.run(sql, [
    data.name,
    data.class,
    data.section,
    data.roll,
    data.house,
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

// =======================
// BULK DELETE
// =======================
exports.bulkDelete = (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No IDs provided' })
  }

  db.all("SELECT pdf FROM students WHERE id IN (" + ids.map(() => '?').join(',') + ")", ids, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB Error' })

    rows.forEach(row => {
      if (row && row.pdf && fs.existsSync(row.pdf)) {
        try {
          fs.unlinkSync(row.pdf)
        } catch (e) {
          console.log('Error deleting PDF:', e)
        }
      }
    })

    db.run("DELETE FROM students WHERE id IN (" + ids.map(() => '?').join(',') + ")", ids, (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Delete Error' })
      res.json({ success: true, message: `${ids.length} records deleted` })
    })
  })
}

// =======================
// EXPORT TO CSV
// =======================
exports.exportCSV = (req, res) => {
  const { search, class: cls, section, house, roll, blood, dateFrom, dateTo } = req.query

  let query = "SELECT * FROM students WHERE 1=1"
  let params = []

  if (search) {
    query += " AND (name LIKE ? OR father LIKE ? OR mother LIKE ?)"
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (cls) {
    query += " AND class = ?"
    params.push(cls)
  }
  if (section) {
    query += " AND section = ?"
    params.push(section)
  }
  if (house) {
    query += " AND house = ?"
    params.push(house)
  }
  if (roll) {
    query += " AND roll LIKE ?"
    params.push(`%${roll}%`)
  }
  if (blood) {
    query += " AND blood = ?"
    params.push(blood)
  }
  if (dateFrom) {
    query += " AND date >= ?"
    params.push(dateFrom)
  }
  if (dateTo) {
    query += " AND date <= ?"
    params.push(dateTo)
  }

  query += " ORDER BY id DESC"

  db.all(query, params, (err, rows) => {
    if (err) return res.send("DB Error")

    if (!rows || rows.length === 0) {
      return res.send("No records to export")
    }

    try {
      // Convert JSON to CSV
      const headers = ['id', 'name', 'class', 'section', 'roll', 'house', 'blood', 'father', 'mother', 'contact', 'address', 'date']
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(header => {
            const value = row[header] || ''
            return `"${String(value).replace(/"/g, '""')}"` // Escape quotes in values
          }).join(',')
        )
      ].join('\n')

      res.header('Content-Type', 'text/csv')
      res.header('Content-Disposition', `attachment; filename="students-${Date.now()}.csv"`)
      res.send(csvContent)
    } catch (err) {
      res.send("Export Error")
    }
  })
}

// =======================
// EXPORT TO EXCEL
// =======================
exports.exportExcel = (req, res) => {
  const { search, class: cls, section, house, roll, blood, dateFrom, dateTo } = req.query

  let query = "SELECT * FROM students WHERE 1=1"
  let params = []

  if (search) {
    query += " AND (name LIKE ? OR father LIKE ? OR mother LIKE ?)"
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (cls) {
    query += " AND class = ?"
    params.push(cls)
  }
  if (section) {
    query += " AND section = ?"
    params.push(section)
  }
  if (house) {
    query += " AND house = ?"
    params.push(house)
  }
  if (roll) {
    query += " AND roll LIKE ?"
    params.push(`%${roll}%`)
  }
  if (blood) {
    query += " AND blood = ?"
    params.push(blood)
  }
  if (dateFrom) {
    query += " AND date >= ?"
    params.push(dateFrom)
  }
  if (dateTo) {
    query += " AND date <= ?"
    params.push(dateTo)
  }

  query += " ORDER BY id DESC"

  db.all(query, params, async (err, rows) => {
    if (err) return res.send("DB Error")

    if (!rows || rows.length === 0) {
      return res.send("No records to export")
    }

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Students')

      worksheet.columns = [
        { header: 'ID', key: 'id' },
        { header: 'Name', key: 'name' },
        { header: 'Class', key: 'class' },
        { header: 'Section', key: 'section' },
        { header: 'Roll', key: 'roll' },
        { header: 'House', key: 'house' },
        { header: 'Blood Type', key: 'blood' },
        { header: 'Father', key: 'father' },
        { header: 'Mother', key: 'mother' },
        { header: 'Contact', key: 'contact' },
        { header: 'Address', key: 'address' },
        { header: 'Date', key: 'date' }
      ]

      worksheet.addRows(rows)
      worksheet.columns.forEach(column => {
        column.width = 15
      })

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="students-${Date.now()}.xlsx"`)

      await workbook.xlsx.write(res)
      res.end()
    } catch (err) {
      res.send("Export Error")
    }
  })
}

// =======================
// GET STATISTICS
// =======================
exports.getStats = (req, res) => {
  db.get("SELECT COUNT(*) as total FROM students", (err, totalRow) => {
    if (err) return res.json({ error: 'DB Error' })

    db.all("SELECT class, COUNT(*) as count FROM students GROUP BY class", (err, classCounts) => {
      if (err) return res.json({ error: 'DB Error' })

      db.all("SELECT house, COUNT(*) as count FROM students GROUP BY house", (err, houseCounts) => {
        if (err) return res.json({ error: 'DB Error' })

        res.json({
          total: totalRow.total,
          byClass: classCounts || [],
          byHouse: houseCounts || []
        })
      })
    })
  })
}