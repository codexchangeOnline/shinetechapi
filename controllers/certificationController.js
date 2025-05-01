const asyncHandler=require('express-async-handler')
const multer = require('multer');
const path = require('path');
const mongoose=require('mongoose');
const fs = require('fs');
const CERTIFICATION=require('../models/certificationModel');
const { log } = require('console');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const imageTypes = /jpg|jpeg|png/;
    const pdfTypes = /pdf/;
  
    if (file.fieldname === 'images') {
      if (imageTypes.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, JPEG, or PNG files are allowed for images.'));
      }
    } else if (file.fieldname === 'pdfs') {
      if (pdfTypes.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for certificates.'));
      }
    } else {
      cb(new Error('Invalid field name.'));
    }
  };
  
  
  const upload = multer({
    storage,
    fileFilter
  }).any(); // max 10 files

  const uploadCertification = async (req, res) => {
    upload(req, res, async function (err) {
      try {
        if (err) return res.status(400).json({ message: err.message });
  
        const { title } = req.body;
        const images = req.files.filter(f => f.fieldname === 'images');
        const pdfs = req.files.filter(f => f.fieldname === 'pdfs');
  
        if (!title || pdfs.length === 0) {
          return res.status(400).json({ message: 'Title and at least one PDF are required.' });
        }
  
        const certificates = [];
  
        // Loop through max length of pdfs or images
        const maxLength = Math.max(pdfs.length, images.length);
        for (let i = 0; i < maxLength; i++) {
          certificates.push({
            imagePath: images[i] ? images[i].path : null,
            pdfPath: pdfs[i] ? pdfs[i].path : null
          });
        }
  
        const saved = await CERTIFICATION.create({ title, certificates });
        res.status(201).json({ message: "Data added successfully", saved });
      } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ message: 'Server error while uploading.' });
      }
    });
  };
  
  const displayCertificate=async(req,res)=>{
    try {
      const allFiles = await CERTIFICATION.find().sort({ uploadedAt: -1 });
      res.status(200).json({message:"Data Listed", allFiles});
    } catch (error) {
      console.error('Failed to fetch files:', error.message);
      res.status(500).json({ message: 'Something went wrong while fetching files.' });
    }
  }
  const deleteCertificate=async(req,res)=>{
    try {
      const certificate = await CERTIFICATION.findById(req.params.id);
  
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }
  
      certificate.certificates.forEach(cert => {
        console.log(cert);

        // Correct path resolution: go up one directory to reach root
        const imagePath = cert.imagePath != null ? (path.join(__dirname, '..', cert.imagePath)):null;
        const pdfPath = path.join(__dirname, '..', cert.pdfPath);
        
        // Delete image
        if(imagePath!=null){
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting image file: ${err.message}`);
          }
        });}
  
        // Delete PDF
        fs.unlink(pdfPath, (err) => {
          if (err) {
            console.error(`Error deleting pdf file: ${err.message}`);
          }
        });
      });
  
      await CERTIFICATION.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Certificate and associated files deleted successfully' });
  
    } catch (error) {
      console.error('Delete error:', error.message);
      res.status(500).json({ message: 'Server error while deleting.' });
    }
  }
  module.exports={uploadCertification, upload, displayCertificate,deleteCertificate}