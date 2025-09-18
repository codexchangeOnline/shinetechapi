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

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "header" + path.extname(file.originalname)); // Always overwrite same file
  }
});

const upload = multer({ storage }).single("header");

// ✅ Upload / Replace header
const uploadHeader = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err });
    }

    // Purana record delete karo (sirf ek hi record rakhna hai)
    await Header.deleteMany({});

    // Sirf relative path store karo (gallery jaisa)
    const imagePath = `/uploads/${req.file.filename}`;

    // Naya record save karo
    const newHeader = new Header({ imageUrl: imagePath });
    await newHeader.save();

    return res.status(200).json({
      message: "Header uploaded successfully",
      file: imagePath,
    });
  });
});

// ✅ Get current header
const getHeader = asyncHandler(async (req, res) => {
  const header = await Header.findOne().sort({ createdAt: -1 });

  if (!header) {
    return res.status(404).json({ message: "No Header uploaded yet" });
  }

  return res.status(200).json({
    message: "Header found",
    file: header.imageUrl,
  });
});

module.exports = { uploadHeader, getHeader };
