const express = require('express')
const router = express.Router()
const { careerCreate, upload, addOpening, openingDetails, deleteOpening } = require('../controllers/careerController')
router.route('/', ).post(upload.single('resume'), careerCreate);
router.route('/addOpening', ).post(addOpening);
router.route('/openingDetails', ).get(openingDetails);
router.route('/openingDetails/:id', ).delete(deleteOpening);

module.exports = router