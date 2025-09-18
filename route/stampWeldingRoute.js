const express = require("express");
const { uploadStamp, getStamp } = require("../controllers/stampWeldingController");

const router = express.Router();

router.post("/upload-stamp", uploadStamp);
router.get("/get-stamp", getStamp);

module.exports = router;
