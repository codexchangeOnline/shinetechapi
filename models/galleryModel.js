const mongoose=require('mongoose')

const GallerySchema = new mongoose.Schema({
    images: [String], // Store image filenames
    title: String,
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Gallery", GallerySchema);