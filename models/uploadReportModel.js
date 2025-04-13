const mongoose = require('mongoose');

// Define the schema for file metadata
const fileSchema = new mongoose.Schema({
   clientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
  originalName: {
    type: String,
    required: true,
  },
  uploadedName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UPLOADREPORT', fileSchema);
