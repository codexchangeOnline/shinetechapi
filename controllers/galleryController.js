const Gallery=require('../models/galleryModel')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: './uploads/', // Save images in 'uploads' folder
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });


const uploadGallery = async (req, res) => {
    try {
      const files = req.files;
  
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
  
      const title = req.body.title || 'Gallery Image';
      
  
      const docs = files.map(file => ({
        images: [`/uploads/${file.filename}`], // keep array for compatibility
        title
      }));
  
      const result = await Gallery.insertMany(docs);
  
      res.status(201).json({ success: true, message: "Images uploaded successfully", data: result });
  
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  


const displayGallery=async(req,res)=>{

    try {
        const galleries = await Gallery.find();
        res.json(galleries);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }

}
const deleteGallery = async (req, res) => {
  try {
    const result = await Gallery.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // If result.image is an array
    if (Array.isArray(result.images)) {
      result.images.forEach((img) => {
        const filePath = path.join(__dirname, '../uploads', path.basename(img));
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${img}:`, err.message);
          }
        });
      });
    } else {
      // Single image string
      const filePath = path.join(__dirname, '../uploads', path.basename(result.images));
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file:`, err.message);
        }
      });
    }

    res.json({ success: true, message: 'Deleted', result });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
module.exports={uploadGallery,upload,displayGallery,deleteGallery}