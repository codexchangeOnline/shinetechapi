const express = require('express')
const router = express.Router()

const validateToken = require('../middleware/validateToken');
const { uploadReport, viewReport, deleteReport } = require('../controllers/uploadReportController');

router.post("/",uploadReport);

router.get("/viewReport",viewReport);
router.delete("/viewReport/:id",deleteReport);

module.exports = router