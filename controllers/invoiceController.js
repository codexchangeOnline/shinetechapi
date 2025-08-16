const asyncHandler = require('express-async-handler')
const Invoice = require('../models/invoiceModel')

// Get all invoices
const getInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find().sort({ createdAt: -1 })
    res.status(200).json(invoices)
})

// Get single invoice by ID
const getInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) {
        res.status(404)
        throw new Error("Invoice not found")
    }
    res.status(200).json(invoice)
})

// Create new invoice
const createInvoice = asyncHandler(async (req, res) => {
    console.log("Invoice data:", req.body)
    
    const {
        clientName, customerName, date, reportNo, jobDescription, srNoRtNo,
        dieToolNo, heatNo, material, drgNo, dateOfTesting, offerNo, 
        testCarriedOutAt, poNo, procedureNo, procedureFollowed, evalStndrd,
        acptanceStndrd, coverage, shootingKetchNo, radiationSource, 
        sourceStrength, sourceSize, screen, exposureTime, filmBrandType,
        filmProcessing, processingTime, filmDensity, filmSizeSummary,
        totalFilms, totalSqInches, testRows
    } = req.body

    const invoice = await Invoice.create({
        clientName, customerName, date, reportNo, jobDescription, srNoRtNo,
        dieToolNo, heatNo, material, drgNo, dateOfTesting, offerNo, 
        testCarriedOutAt, poNo, procedureNo, procedureFollowed, evalStndrd,
        acptanceStndrd, coverage, shootingKetchNo, radiationSource, 
        sourceStrength, sourceSize, screen, exposureTime, filmBrandType,
        filmProcessing, processingTime, filmDensity, filmSizeSummary,
        totalFilms, totalSqInches, testRows
    })

    res.status(201).json(invoice)
})

// Update invoice
const updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
    
    if (!invoice) {
        res.status(404)
        throw new Error("Invoice not found")
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )
    
    res.status(200).json(updatedInvoice)
})

// Delete invoice
const deleteInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
    
    if (!invoice) {
        res.status(404)
        throw new Error("Invoice not found")
    }

    const deletedInvoice = await Invoice.deleteOne({ _id: req.params.id })
    res.status(200).json(deletedInvoice)
})

// Get invoices by date range
const getInvoicesByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query
    
    if (!startDate || !endDate) {
        res.status(400)
        throw new Error("Start date and end date are required")
    }

    const invoices = await Invoice.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ date: -1 })

    res.status(200).json(invoices)
})

// Get invoices by customer name
const getInvoicesByCustomer = asyncHandler(async (req, res) => {
    const { customerName } = req.params
    
    const invoices = await Invoice.find({
        customerName: { $regex: customerName, $options: 'i' }
    }).sort({ createdAt: -1 })

    res.status(200).json(invoices)
})

module.exports = {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByDateRange,
    getInvoicesByCustomer
}
