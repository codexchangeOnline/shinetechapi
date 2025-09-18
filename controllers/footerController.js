const asyncHandler = require("express-async-handler");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Footer = require("../models/footerModel");

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
    cb(null, "footer" + path.extname(file.originalname)); // Always overwrite same file
  }
});

const upload = multer({ storage }).single("footer");

// ✅ Upload / Replace stamp
const uploadFooter = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Purana record delete karo (sirf ek hi record rakhna hai)
    await Footer.deleteMany({});

    // Naya record save karo
    const newFooter = new Footer({ imageUrl });
    await newFooter.save();

    return res.status(200).json({
      message: "Footer uploaded successfully",
      file: imageUrl,
    });
  });
});

// ✅ Get current stamp
const getFooter = asyncHandler(async (req, res) => {
  const footer = await Footer.findOne().sort({ createdAt: -1 });

  if (!footer) {
    return res.status(404).json({ message: "No Footer uploaded yet" });
  }

  return res.status(200).json({
    message: "Footer found",
    file: footer.imageUrl,
  });
});

module.exports = { uploadFooter, getFooter };
