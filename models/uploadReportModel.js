const mongoose = require('mongoose');

// Define the schema for file metadata
const fileSchema = new mongoose.Schema({
   clientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    reportNo:{
      type:String,
      required:true
    },
      rtReportId:{
        type:String,
default:''
    },
      isCastingReport:{
        type:Boolean,
default:true
    },
  // originalName: {
  //   type: String,
  //   required: true,
  // },
  // uploadedName: {
  //   type: String,
  //   required: true,
  // },
  // filePath: {
  //   type: String,
  //   required: true,
  // },
  // fileType: {
  //   type: String,
  //   required: true,
  // },
  // fileSize: {
  //   type: Number,
  //   required: true,
  // },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
    appName: {
    type: String,
    default: 'stns'  // or whatever default you want
  },
});

module.exports = mongoose.model('UPLOADREPORT', fileSchema);
