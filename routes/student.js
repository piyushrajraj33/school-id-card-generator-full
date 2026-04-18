const express = require('express')
const router = express.Router()
const controller = require('../controllers/idController')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

// ✅ UPDATED MULTER
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

router.get('/', controller.formPage)

// ✅ UPDATED PREVIEW ROUTE
router.post('/preview', (req, res, next) => {

  upload.single('photo')(req, res, function (err) {

    if (err) {
      console.log("UPLOAD ERROR:", err.message)
      return res.send("⚠️ Image too large. Please upload image below 2MB.")
    }

    next()
  })

}, controller.previewPage)

router.post('/submit', controller.generateID)

// EDIT
router.post('/edit', controller.editForm)

router.get("/success", (req, res) => {
  res.render("success");
});

module.exports = router