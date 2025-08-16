const express = require('express')
const router = express.Router()
const {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByDateRange,
    getInvoicesByCustomer
} = require('../controllers/invoiceController')
const validateToken = require('../middleware/validateToken')

// Public routes (can be made protected later if needed)
router.route("/").get(getInvoices).post(createInvoice)
router.route("/:id").get(getInvoice).put(updateInvoice).delete(deleteInvoice)

// Additional routes
router.route("/date-range").get(getInvoicesByDateRange)
router.route("/customer/:customerName").get(getInvoicesByCustomer)

module.exports = router
