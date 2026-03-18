const express = require('express')
const router = express.Router()
const controller = require('../controllers/idController')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
destination:'public/uploads',
filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}
})

const upload = multer({storage})

router.get('/',controller.formPage)
router.post('/preview',upload.single('photo'),controller.previewPage)
router.post('/submit',controller.generateID)

// ✅ ADD THIS LINE
router.post('/edit',controller.editForm)

router.get("/success", (req, res) => {
res.render("success");
});

module.exports = router