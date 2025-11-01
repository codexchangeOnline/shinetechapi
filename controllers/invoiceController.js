const asyncHandler = require('express-async-handler')
const Invoice = require('../models/invoiceModel')
const User = require('../models/userModel')


// Get all invoices
const getInvoices = asyncHandler(async (req, res) => {
    const userId = req.params.createdBy; // Get userId from request query
        if (!userId) {
          return res.status(400).json({ message: 'Invalid or missing userId' });
        }

        // Fetch the user by ID
                const user = await User.findById(userId);
        
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                let invoices;
                 if (user.roleName.toLowerCase() === 'admin') {
                            // Admin can view all reports
                            invoices = await Invoice.find().sort({ createdAt: -1 })
                        } else {
                            // Clients can only see their own reports
                            invoices = await Invoice.find({createdBy: user._id}).sort({ createdAt: -1 })
                            
                        }
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
    //console.log("Invoice data:", req.body)
    
    const {
        clientName, customerName, date, reportNo, jobDescription, srNoRtNo,
        dieToolNo, heatNo, material, drgNo, dateOfTesting, offerNo, 
        testCarriedOutAt, poNo, procedureNo, procedureFollowed, evalStndrd,
        acptanceStndrd, coverage, shootingKetchNo, radiationSource, 
        sourceStrength, sourceSize, screen, exposureTime, filmBrandType,
        filmProcessing, processingTime, filmDensity, filmSizeSummary,
        totalFilms, totalSqInches, testRows,createdBy
    } = req.body

      const exists = await Invoice.findOne({ reportNo: reportNo });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: `Report No ${reportNo} already exists!`
    });
  }

    const invoice = await Invoice.create({
        clientName, customerName, date, reportNo, jobDescription, srNoRtNo,
        dieToolNo, heatNo, material, drgNo, dateOfTesting, offerNo, 
        testCarriedOutAt, poNo, procedureNo, procedureFollowed, evalStndrd,
        acptanceStndrd, coverage, shootingKetchNo, radiationSource, 
        sourceStrength, sourceSize, screen, exposureTime, filmBrandType,
        filmProcessing, processingTime, filmDensity, filmSizeSummary,
        totalFilms, totalSqInches, testRows,createdBy
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
// report.controller.js


const getNextReportNo = async (req, res) => {
  try {
    // Financial year range
    const start = new Date("2025-04-01");
    const end = new Date("2026-03-31");

    // Financial year में सारे reports ढूँढो
    const reports = await Invoice.find({
      createdAt: { $gte: start, $lte: end }
    }).select("reportNo");

    let maxSeq = 0;

    if (reports.length > 0) {
      reports.forEach(r => {
        const parts = r.reportNo.split("/");
        const seq = parseInt(parts[2]); // तीसरा हिस्सा number है
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      });
    }

    // Next sequence
    const nextSequence = maxSeq + 1;

    // Format sequence → 01, 02, ...
    const sequence = nextSequence.toString().padStart(2, "0");
    const nextReportNo = `STNS_R/25-26/${sequence}`;

    res.json({ reportNo: nextReportNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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
    getInvoicesByCustomer,
    getNextReportNo
}
