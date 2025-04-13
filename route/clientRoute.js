const express = require('express')
const router = express.Router()
const { getClient, deleteClient, addClient, upload } = require('../controllers/clientController')

// Protected Route
// router.use(validateToken)
router.route("/",).get(getClient).post(upload.array('logo'),addClient)
router.route("/:id",).delete(deleteClient)
module.exports = router