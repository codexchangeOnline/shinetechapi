const express = require('express')
const router = express.Router()

const validateToken = require('../middleware/validateToken');
const { uploadReport, viewReport } = require('../controllers/uploadReportController');

router.post("/",uploadReport);

router.get("/viewReport",viewReport);

module.exports = router