const asyncHandler = require("express-async-handler");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Header = require("../models/headerModel");

// Upload folder
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config (overwrite same file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "header" + path.extname(file.originalname)); // always same name
  }
});

const upload = multer({ storage }).single("header");

// ✅ Upload / Replace header
const uploadHeader = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Upload failed", error: err });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    // Purana record delete karo (sirf ek hi record rakhna hai)
    await Header.deleteMany({});

    // Naya record save karo
    const newHeader = new Header({ imageUrl: relativePath });
    await newHeader.save();

    return res.status(201).json({
      success: true,
      message: "Header uploaded successfully",
      file: relativePath,
    });
  });
});

// ✅ Get current header
const getHeader = asyncHandler(async (req, res) => {
  const header = await Header.findOne().sort({ createdAt: -1 });

  if (!header) {
    return res.status(404).json({ success: false, message: "No header uploaded yet" });
  }

  return res.status(200).json({
    success: true,
    message: "Header found",
    file: header.imageUrl,
  });
});

module.exports = { uploadHeader, getHeader };
