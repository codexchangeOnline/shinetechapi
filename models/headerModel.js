const mongoose = require("mongoose");

const headerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Header", headerSchema);
