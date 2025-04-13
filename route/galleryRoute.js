const express = require('express')
const router = express.Router()
const { uploadGallery, upload, displayGallery, deleteGallery } = require('../controllers/galleryController')
router.route('/', ).get(displayGallery).post(upload.array('images'), uploadGallery);
router.route('/:id', ).delete(deleteGallery)

module.exports = router