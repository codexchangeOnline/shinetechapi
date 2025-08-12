const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  logo: [String],
  appName: {
    type: String,
    default: 'stns'  // or whatever default you want
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);