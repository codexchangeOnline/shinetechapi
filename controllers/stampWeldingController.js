const asyncHandler = require("express-async-handler");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const StampWelding = require("../models/stampWeldingModel");

// Upload folder
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "stamp" + path.extname(file.originalname)); // Always overwrite same file
  }
});

const upload = multer({ storage }).single("stamp");

// ✅ Upload / Replace stamp
const uploadStamp = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Upload failed", error: err });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    // Delete old record (keep only one)
    await StampWelding.deleteMany({});

    const newStamp = new StampWelding({ imageUrl: relativePath });
    await newStamp.save();

    res.status(201).json({
      success: true,
      message: "Stamp uploaded successfully",
      file: relativePath
    });
  });
});

// ✅ Get current stamp
const getStamp = asyncHandler(async (req, res) => {
  const stamp = await StampWelding.findOne().sort({ createdAt: -1 });

  if (!stamp) {
    return res.status(404).json({ success: false, message: "No stamp uploaded yet" });
  }

  res.status(200).json({
    success: true,
    message: "Stamp found",
    file: stamp.imageUrl // like /uploads/stamp.jpg
  });
});

module.exports = { uploadStamp, getStamp };
