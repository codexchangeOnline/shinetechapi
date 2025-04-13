const express = require('express');
const multer = require('multer');
const path = require('path');
const Client = require('../models/clientModel');

const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads/', // Save images in 'uploads' folder
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

const addClient=async(req,res)=>{
    try {
        const files = req.files;
        const docs = files.map(file => ({ logo: '/uploads/' + file.filename }));
        const result = await Client.insertMany(docs);
        res.status(201).json({ success: true, data: result });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
}

const getClient=async(req,res)=>{
    try {
        const companies = await Client.find().sort({ createdAt: -1 });
        res.json(companies);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

const deleteClient=async(req,res)=>{
    try {
        const result = await Client.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted', result });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

module.exports={addClient,upload,getClient,deleteClient}