const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  experience: { type: String, required: true },
  location: { type: String, required: true }
});

module.exports=mongoose.model("CareerOpening",CareerSchema)