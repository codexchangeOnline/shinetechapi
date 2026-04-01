const asyncHandler = require('express-async-handler')
const Invoice = require('../models/invoiceModel')
const User = require('../models/userModel');
const  UploadReport  = require('../models/uploadReportModel');

function getFinancialYearInfo(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0=Jan

  // FY starts on Apr 1. If Jan/Feb/Mar => FY started previous calendar year.
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  const start = new Date(startYear, 3, 1, 0, 0, 0, 0); // Apr 1
  const end = new Date(endYear, 2, 31, 23, 59, 59, 999); // Mar 31

  const yy1 = String(startYear).slice(-2);
  const yy2 = String(endYear).slice(-2);
  const fyLabel = `${yy1}-${yy2}`; // "25-26"

  return { start, end, fyLabel };
}

async function getMaxSequenceForFY({ Model, start, end, reportNoPrefix, fyLabel }) {
  const escapedPrefix = reportNoPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedFy = fyLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(`^${escapedPrefix}/${escapedFy}/`);

  const result = await Model.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, reportNo: { $regex: rx } } },
    {
      $project: {
        seq: {
          $convert: {
            input: { $arrayElemAt: [{ $split: ["$reportNo", "/"] }, 2] },
            to: "int",
            onError: 0,
            onNull: 0,
          },
        },
      },
    },
    { $group: { _id: null, maxSeq: { $max: "$seq" } } },
  ]);

  return result?.[0]?.maxSeq || 0;
}


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
  try {
    const invoiceId = req.params.id;

    // Pehle invoice check karo
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check if any uploaded reports exist for this invoice
    const reportExists = await UploadReport.findOne({ rtReportId: invoiceId });
    if (reportExists) {
      return res.status(400).json({
        message: "Cannot delete this report. Reports uploaded for this Casting.",
      });
    }

    // Agar report nahi hai, tab invoice delete karo
    const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);

    res.status(200).json({
      message: "Invoice deleted successfully",
      deletedInvoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting invoice" });
  }
});


// Get invoices by date range
// report.controller.js


const getNextReportNo = async (req, res) => {
  try {
    const { start, end, fyLabel } = getFinancialYearInfo(new Date());
    const reportNoPrefix = "STNS_R";

    const maxSeq = await getMaxSequenceForFY({
      Model: Invoice,
      start,
      end,
      reportNoPrefix,
      fyLabel,
    });

    const nextSequence = maxSeq + 1;
    const sequence = String(nextSequence).padStart(2, "0");
    const nextReportNo = `${reportNoPrefix}/${fyLabel}/${sequence}`;

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
