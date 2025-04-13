const multer = require('multer');
const path = require('path');
const News=require('../models/newsModel')

const storage = multer.diskStorage({
    destination: './uploads/', // Save images in 'uploads' folder
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });
const addNews=async(req,res)=>{
    try {
        const { title, description, fullContent } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    
        const newsItem = new News({
          title,
          description,
          fullContent,
          image: imageUrl
        });
    
        await newsItem.save();
        res.status(201).json({ message: 'News added successfully', newsItem });
      } catch (err) {
        console.error('Error adding news:', err);
        res.status(500).json({ error: 'Failed to add news' });
      }
}

const newsDetail=async(req,res)=>{
    try {
        const newsList = await News.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: newsList });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch news', error: error.message });
      }
}

const newsById=async(req,res)=>{
    try {
        const newsItem = await News.findById(req.params.id);
        if (!newsItem) {
          return res.status(404).json({ success: false, message: 'News not found' });
        }
        res.status(200).json({ success: true, data: newsItem });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching news detail', error: error.message });
      }


     
}
const deleteNews=async(req,res)=>{
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
    
        if (!deletedNews) {
          return res.status(404).json({
            success: false,
            message: 'News not found or already deleted.',
          });
        }
    
        res.status(200).json({
          success: true,
          message: 'News deleted successfully.',
          data: deletedNews,
        });
      } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete news.',
          error: error.message,
        });
      }
  }
module.exports={addNews,upload,newsDetail,newsById,deleteNews}