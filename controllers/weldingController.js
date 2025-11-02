const asyncHandler = require('express-async-handler')
const Welding = require('../models/weldingModel')
const User = require('../models/userModel')
const  UploadReport  = require('../models/uploadReportModel');

// Get all welding
const getWelding = asyncHandler(async (req, res) => {
    const userId = req.params.createdBy; // Get userId from request query
     if (!userId) {
          return res.status(400).json({ message: 'Invalid or missing userId' });
        }
        
                // Fetch the user by ID
                        const user = await User.findById(userId);
                
                        if (!user) {
                            return res.status(404).json({ message: 'User not found' });
                        }
                        let welding;
                                         if (user.roleName.toLowerCase() === 'admin') {
                                                    // Admin can view all reports
                                                    welding = await Welding.find().sort({ createdAt: -1 })
                                                } else {
                                                    // Clients can only see their own reports
                                                    welding = await Welding.find({createdBy: user._id}).sort({ createdAt: -1 })
                                                    
                                                }
    res.status(200).json(welding)
})

// Get single welding by ID
const getWeldingById = asyncHandler(async (req, res) => {
    const welding = await Welding.findById(req.params.id)
    if (!welding) {
        res.status(404)
        throw new Error("welding not found")
    }
    res.status(200).json(welding)
})

// Create new welding
const createWelding = asyncHandler(async (req, res) => {
    //console.log("welding data:", req.body)
    
    const {
        clientName, dateOfRt, reportNo, project, inspectionAgen,
        dateOfSubnm, materialNthick, source, strength, rtTechq, filmUsed, 
        screen, jointType, expoTime, devTime, atTemp,
        cDensity, ug, weldingProcess, acceptOnCriteria,sensitivity, testRows,createdBy
    } = req.body

   const exists = await Welding.findOne({ reportNo: reportNo });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: `Report No ${reportNo} already exists!`
    });
  }

    const welding = await Welding.create({
        clientName, dateOfRt, reportNo, project, inspectionAgen,
        dateOfSubnm, materialNthick, source, strength, rtTechq, filmUsed, 
        screen, jointType, expoTime, devTime, atTemp,
        cDensity, ug, weldingProcess, acceptOnCriteria,sensitivity, testRows,createdBy
    })

    res.status(201).json(welding)
})

// Update welding
const updateWelding = asyncHandler(async (req, res) => {
    const welding = await Welding.findById(req.params.id)
    
    if (!welding) {
        res.status(404)
        throw new Error("Welding not found")
    }

    const updatedWelding = await Welding.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )
    
    res.status(200).json(updatedWelding)
})

// Delete welding
const deleteWelding = asyncHandler(async (req, res) => {
    
  try {
    const weldingId = req.params.id;

    // Pehle invoice check karo
    const welding = await Welding.findById(weldingId);
    if (!welding) {
      return res.status(404).json({ message: "welding not found" });
    }

    // Check if any uploaded reports exist for this invoice
    const reportExists = await UploadReport.findOne({ rtReportId: weldingId });
    if (reportExists) {
      return res.status(400).json({
        message: "Cannot delete this report. Reports uploaded for this Casting.",
      });
    }

    // Agar report nahi hai, tab invoice delete karo
    const deletedwelding = await Welding.findByIdAndDelete(weldingId);

    res.status(200).json({
      message: "welding deleted successfully",
      deletedwelding
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting welding" });
  }
});

// Get welding by date range
// report.controller.js


const getNextReportNo = async (req, res) => {
  try {
    // Financial year range
    const start = new Date("2025-04-01");
    const end = new Date("2026-03-31");

    // Financial year में सारे reports ढूँढो
    const reports = await Welding.find({
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
    const nextReportNo = `STNS/25-26/${sequence}`;

    res.json({ reportNo: nextReportNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWeldingByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query
    
    if (!startDate || !endDate) {
        res.status(400)
        throw new Error("Start date and end date are required")
    }

    const welding = await Welding.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ date: -1 })

    res.status(200).json(welding)
})

// Get welding by customer name
const getWeldingByCustomer = asyncHandler(async (req, res) => {
    const { clientName } = req.params
    
    const welding = await Welding.find({
        clientName: { $regex: clientName, $options: 'i' }
    }).sort({ createdAt: -1 })

    res.status(200).json(welding)
})

module.exports = {
    getWelding,
    getWeldingById,
    createWelding,
    updateWelding,
    deleteWelding,
    getWeldingByDateRange,
    getWeldingByCustomer,
    getNextReportNo
}
