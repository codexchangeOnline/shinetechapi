const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  experience: { type: String, required: true },
  location: { type: String, required: true },
    appName: {
    type: String,
    default: 'stns'  // or whatever default you want
  },
});

module.exports=mongoose.model("CareerOpening",CareerSchema)