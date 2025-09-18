const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Footer", footerSchema);
