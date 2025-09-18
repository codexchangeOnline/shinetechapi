const mongoose = require("mongoose");

const stampSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StampWelding", stampSchema);
