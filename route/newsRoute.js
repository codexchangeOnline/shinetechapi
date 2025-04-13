const express = require('express')
const router = express.Router()
const validateToken = require('../middleware/validateToken')
const { newsDetail, newsById, deleteNews, upload, addNews } = require('../controllers/newsController')

// Protected Route
// router.use(validateToken)
router.route("/",).get(newsDetail).post(upload.single('image'),addNews)
router.route("/:id",).get(newsById).delete(deleteNews)
module.exports = router