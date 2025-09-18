const asyncHandler = require("express-async-handler");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const StampCasting = require("../models/stampCastingModel");

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

    // Purana record delete karo (sirf ek hi record rakhna hai)
    await StampCasting.deleteMany({});

    // Naya record save karo
    const newStamp = new StampCasting({ imageUrl: relativePath });
    await newStamp.save();

    return res.status(201).json({
      success: true,
      message: "Stamp uploaded successfully",
      file: relativePath,
    });
  });
});

// ✅ Get current stamp
const getStamp = asyncHandler(async (req, res) => {
  const stamp = await StampCasting.findOne().sort({ createdAt: -1 });

  if (!stamp) {
    return res.status(404).json({ success: false, message: "No stamp uploaded yet" });
  }

  return res.status(200).json({
    success: true,
    message: "Stamp found",
    file: stamp.imageUrl, // e.g. /uploads/stamp.jpg
  });
});

module.exports = { uploadStamp, getStamp };
