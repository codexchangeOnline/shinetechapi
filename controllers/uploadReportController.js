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
const cron = require('node-cron');

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
            const { clientId, reportNo,appName } = req.body;
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
                appName:appName
            }));
 
            let credentialsSection = '';
            let SavedReports =await UploadReport.find({ clientId: clientId }).sort({ uploadedAt: -1 }).populate('clientId', 'username');
            // Insert file metadata into MongoDB
            const savedFiles = await UploadReport.insertMany(uploadedFiles);

            // Email content
            if (!SavedReports || SavedReports.length === 0){
              credentialsSection = `
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Password:</strong> ${user.originalPassword} (Use your original password)</p>
              `;
            }
            
            const emailContent = `
              <h3>Hello ${user.username},</h3>
              <p>Your report has been uploaded successfully.</p>
              ${credentialsSection}
              <p>You can login to view your report.</p>
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
  
    const { userId,appName } = req.query; // Get userId from request query


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
            reports = await UploadReport.find({appName:appName === undefined ? "stns" : appName}).sort({ uploadedAt: -1 }).populate('clientId', 'username');
        } else {
            // Clients can only see their own reports
            reports = await UploadReport.find({ clientId: user._id, appName:appName === undefined ? "stns" : appName}).sort({ uploadedAt: -1 }).populate('clientId', 'username');
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

// Run every 5 minutes
// cron.schedule('*/5 * * * *', async () => {
//   const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

//   try {
//     const reportsToDelete = await UploadReport.find({ uploadedAt: { $lt: sevenDaysAgo } });

//     for (const report of reportsToDelete) {
//       const filePath = path.join(__dirname, '..', report.filePath);

//       fs.unlink(filePath, async (err) => {
//         if (err && err.code !== 'ENOENT') {
//           console.error(`Failed to delete file for report ${report._id}:`, err);
//         } else {
//           console.log(`File deleted: ${filePath}`);
//         }

//         // Delete from DB regardless of file deletion success
//         await UploadReport.findByIdAndDelete(report._id);
//         console.log(`Report deleted: ${report._id}`);
//       });
//     }
//   } catch (err) {
//     console.error('Auto delete error:', err);
//   }
// });


// Run once daily at midnight
cron.schedule('0 0 * * *', async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  try {
    const reportsToDelete = await UploadReport.find({ uploadedAt: { $lt: sevenDaysAgo } });

    for (const report of reportsToDelete) {
      const filePath = path.join(__dirname, '..', report.filePath);

      fs.unlink(filePath, async (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`Failed to delete file for report ${report._id}:`, err);
        } else {
          console.log(`File deleted: ${filePath}`);
        }

        // Delete from DB regardless of file deletion success
        await UploadReport.findByIdAndDelete(report._id);
        console.log(`Report deleted: ${report._id}`);
      });
    }
  } catch (err) {
    console.error('Auto delete error:', err);
  }
});

const express = require('express');
const { exec } = require('child_process');

const app = express();

// === Configuration ===
const backupBasePath = '/root/mongodb_backups'; // main backup directory
const mongoUri = 'mongodb+srv://relevantengg:Repl_2025_secure@cluster0.gakaqen.mongodb.net/shinetech';

// === Ensure base directory exists ===
if (!fs.existsSync(backupBasePath)) {
  fs.mkdirSync(backupBasePath, { recursive: true });
  console.log(`✅ Created backup directory: ${backupBasePath}`);
}

// === Utility: Format date ===
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// === Backup Function (Reusable) ===
function runMongoBackup(isManual = false) {
  const today = new Date();
  const folderName = `backup-${formatDate(today)}`;
  const outputPath = path.join(backupBasePath, folderName);
  const logFilePath = path.join(outputPath, 'backup-log.txt');

  // Ensure today's folder exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const command = `mongodump --uri="${mongoUri}" --out="${outputPath}"`;
  const startMsg = `[${new Date().toLocaleString()}] ${isManual ? '[Manual]' : '[Scheduled]'} Starting backup...\nCommand: ${command}\n`;
  console.log(startMsg);
  fs.appendFileSync(logFilePath, startMsg);

  // Run backup
  exec(command, (error, stdout, stderr) => {
    if (error) {
      const errMsg = `❌ Error: ${error.message}\n`;
      console.error(errMsg);
      fs.appendFileSync(logFilePath, errMsg);
      return;
    }

    if (stderr) {
      const warnMsg = `⚠️ stderr: ${stderr}\n`;
      console.warn(warnMsg);
      fs.appendFileSync(logFilePath, warnMsg);
    }

    const successMsg = `✅ Backup completed successfully at ${new Date().toLocaleString()}\nSaved to: ${outputPath}\n\n`;
    console.log(successMsg);
    fs.appendFileSync(logFilePath, successMsg);

    // Delete backups older than 7 days
    fs.readdirSync(backupBasePath).forEach(folder => {
      const folderPath = path.join(backupBasePath, folder);
      fs.stat(folderPath, (err, stats) => {
        if (err) return;
        const age = Date.now() - stats.mtimeMs;
        if (age > 7 * 24 * 60 * 60 * 1000) { // older than 7 days
          fs.rmSync(folderPath, { recursive: true, force: true });
          const deleteMsg = `[${new Date().toLocaleString()}] 🧹 Deleted old backup: ${folderPath}\n`;
          console.log(deleteMsg);
          fs.appendFileSync(logFilePath, deleteMsg);
        }
      });
    });
  });
}

// === Scheduler: Run daily at midnight ===
cron.schedule('0 0 * * *', () => {
  console.log('🕛 Scheduled backup started...');
  runMongoBackup(false);
});

// === API Endpoint: Manual Backup ===
// app.get('/api/manual-backup', (req, res) => {
//   try {
//     runMongoBackup(true);
//     res.status(200).json({
//       message: 'Manual backup started successfully. Check backup-log.txt for details.',
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error('Manual backup error:', err);
//     res.status(500).json({
//       message: 'Failed to start manual backup.',
//       error: err.message,
//     });
//   }
// });

// // === Start Express server ===
// const PORT = 4000; // or your API port
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   console.log('✅ MongoDB backup scheduler initialized.');
// });


  module.exports = {uploadReport,viewReport,deleteReport};