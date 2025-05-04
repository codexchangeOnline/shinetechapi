const asyncHandler=require('express-async-handler')
const multer = require('multer');
const path = require('path');
const UploadReport=require('../models/uploadReportModel')
const User = require('../models/userModel')
const mongoose=require('mongoose');
const sendMail = require('../emailService');
require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
// const sendEmail=require('../emailService')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
      const filetypes = /pdf|doc|docx|xls|xlsx/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
  
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and XLS files are allowed.'));
      }
    },
  }).array('files', 10); // Allow up to 10 files at a time
  
  const uploadReport = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { clientId, reportNo } = req.body;
            if (!clientId) {
                return res.status(400).json({ message: "Client ID is required" });
            }

            // Check if the user (client) exists
            const user = await User.findById(clientId);
            
            if (!user) {
                return res.status(404).json({ message: "Client not found" });
            }
// console.log("originalPassword",user.originalPassword);

           
            // Save file metadata to MongoDB
            const uploadedFiles = req.files.map((file) => ({
                clientId: clientId,
                reportNo:reportNo,
                originalName: file.originalname,
                uploadedName: file.filename,
                filePath: file.path,
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedAt: new Date(),
            }));

            // Insert file metadata into MongoDB
            const savedFiles = await UploadReport.insertMany(uploadedFiles);

            // Email content
            const emailContent = `
                <h3>Hello ${user.username},</h3>
                <p>Your report has been uploaded successfully. Below are your login credentials:</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Password:</strong> ${user.originalPassword} (Use your original password)</p>
                <p>You can log in to view your report.</p>
                <p><a href="${process.env.FRONTEND_BASE_URL}/login">Click here to login</a></p>
                
                <p>Thank you!</p>
            `;

            // Send email
            await sendMail(user.email, "Your Report is Uploaded", emailContent);

            res.status(200).json({
                message: "Files uploaded and email sent successfully!",
                files: savedFiles,
            });
            
        } catch (error) {
            res.status(500).json({ message: "Error processing request", error });
        }
    });
};
  
    
  
  const viewReport=(async(req,res)=>{
  
    const { userId } = req.query; // Get userId from request query

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }

    try {
        // Fetch the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let reports;
        if (user.roleName.toLowerCase() === 'admin') {
            // Admin can view all reports
            reports = await UploadReport.find().sort({ uploadedAt: -1 }).populate('clientId', 'username');
        } else {
            // Clients can only see their own reports
            reports = await UploadReport.find({ clientId: user._id }).sort({ uploadedAt: -1 }).populate('clientId', 'username');
        }

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: 'No reports found' });
        }

        res.json({
            reports: reports.map(report => ({
                id: report._id,
                reportNo:report.reportNo,
                fileName: report.uploadedName, // ✅ Corrected field name
                filePath: `/uploads/${report.uploadedName}`,
                clientName: report.clientId ? report.clientId.username : 'Unknown',
                updateAt:report.uploadedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Find the report
    const report = await UploadReport.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Delete the file from the folder
    const filePath = path.join(__dirname, '..', report.filePath); // assuming filePath is stored like: 'uploads/filename.pdf'
    
    fs.unlink(filePath, async (err) => {
      if (err && err.code !== 'ENOENT') {
        // Don't fail if file not found, but log error
        console.error("Error deleting file:", err);
        return res.status(500).json({ message: 'Failed to delete file from folder' });
      }

      // Delete document from DB
      await UploadReport.findByIdAndDelete(reportId);

      res.json({ success: true, message: "Report and file deleted successfully" });
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: "Server error" });
  }
};



  module.exports = {uploadReport,viewReport,deleteReport};