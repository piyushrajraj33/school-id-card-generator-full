const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/', adminController.dashboard)
router.get('/download-all', adminController.downloadAll)
router.get('/edit/:id', adminController.editPage)
router.post('/update/:id', adminController.updateStudent)
router.get('/delete/:id', adminController.deleteStudent)
router.post('/bulk-delete', adminController.bulkDelete)
router.get('/export/csv', adminController.exportCSV)
router.get('/export/excel', adminController.exportExcel)
router.get('/stats', adminController.getStats)

module.exports = router