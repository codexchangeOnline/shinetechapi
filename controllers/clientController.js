const express = require('express');
const multer = require('multer');
const path = require('path');
const Client = require('../models/clientModel');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads/', // Save images in 'uploads' folder
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

const addClient = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    // Map only once for each file
    const docs = files.map(file => ({ logo: '/uploads/' + file.filename }));

    // Save all documents at once
    const result = await Client.insertMany(docs);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getClient=async(req,res)=>{
    try {
        const companies = await Client.find().sort({ createdAt: -1 });
        res.json(companies);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

const deleteClient = async (req, res) => {
  try {
    const result = await Client.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    // Construct the full path to the file
  if (Array.isArray(result.logo)) {
        result.logo.forEach((img) => {
          const filePath = path.join(__dirname, '../uploads', path.basename(img));
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${img}:`, err.message);
            }
          });
        });
      } else {
        // Single image string
        const filePath = path.join(__dirname, '../uploads', path.basename(result.logo));
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
//comment
module.exports={addClient,upload,getClient,deleteClient}