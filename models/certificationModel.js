const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  title: String,
  certificates: [
    {
      imagePath: String,
      pdfPath: String
    }
  ],
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CERTIFICATION', certificationSchema);
