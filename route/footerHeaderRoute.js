const express = require("express");
const { uploadStamp, getStamp } = require("../controllers/stampCastingController");
const { uploadHeader, getHeader } = require("../controllers/headerController");
const { uploadFooter, getFooter } = require("../controllers/footerController");

const router = express.Router();

router.post("/upload-header", uploadHeader);
router.get("/get-header", getHeader);
router.post("/upload-footer", uploadFooter);
router.get("/get-footer", getFooter);

module.exports = router;