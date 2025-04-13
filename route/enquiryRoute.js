const express = require('express');
const { addEnquiry } = require('../controllers/enquiryController');
const router = express.Router()
router.route('/', ).post(addEnquiry);

module.exports = router