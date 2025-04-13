const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  logo: [String]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);