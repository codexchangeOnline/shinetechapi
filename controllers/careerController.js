const asyncHandler=require('express-async-handler')
const multer = require('multer');
const Career=require('../models/careerModel')
const CareerOpening=require('../models/careerOpening')
const path = require('path');
const { sendApplicationEmail } = require('../applyMailService');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Save file with a unique name
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|doc|docx/; // Allow only specific file types
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Only .pdf, .doc, and .docx files are allowed"));
        }
    }
});
const careerCreate=asyncHandler(async(req, res) => {
    try{
    console.log("data",req.body);
   const {designation,name,email,resume,experience,phone,appName}=req.body
   const resumePath = req.file ? req.file.path : null;
    if(!designation||!name || !email || !phone || !experience ||!resumePath){
        res.status(400)
        throw new Error("All field are mandatory")
    }
    const career=await Career.create({
        designation,name,email,resume: resumePath,experience,phone,appName
    })
    await career.save();

    // **Send Email to Recruiter**
    await sendApplicationEmail({ designation, name, email, phone, experience, resumePath});

    res.status(201).json({ message: 'Application submitted successfully & email sent!' });

  } catch (error) {
    res.status(500).json({ message: 'Error submitting application', error });
  }
})

const addOpening=async(req,res)=>{

    try {
        const { designation, experience, location, appName } = req.body;
        
        if (!designation || !experience || !location) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        const newCareer = new CareerOpening({ designation, experience, location, appName});
        await newCareer.save();
    
        res.status(201).json({ message: "Career opportunity added successfully", career: newCareer });
      } catch (error) {
        res.status(500).json({ message: "Server error", error });
      }   

}

const  openingDetails=async(req,res)=>{
    try {
        const careers = await CareerOpening.find({appName:req.query.appName || 'stns'});
        res.status(200).json(careers);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching career details', error });
      }
  }

 const deleteOpening=async(req,res)=>{
    try {
        const jobId = req.params.id;
        const deletedJob = await CareerOpening.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
  }
  //testing code
module.exports={careerCreate,addOpening,openingDetails,deleteOpening,upload}