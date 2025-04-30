const express = require('express');
const { uploadCertification, displayCertificate, deleteCertificate, upload } = require('../controllers/certificationController');
const router = express.Router()
router.route('/', ).post(uploadCertification).get(displayCertificate);
router.route('/:id', ).delete(deleteCertificate);

module.exports=router