const asyncHandler=require('express-async-handler')
const nodemailer = require('nodemailer');
require('dotenv').config();
const Contact=require('../models/contactModel')
const getContacts=asyncHandler(async(req, res) => {
    const contacts=await Contact.find()

    // Protected Route
    // const contacts=await Contact.find({user_id:req.user.id})
    res.status(200).json(contacts)
})

const getContact=asyncHandler(async(req, res) => {
    const contact=await Contact.findById(req.params.id)
    if(!contact){
        res.status(404)
        throw new Error("Contact not found")
    }
    res.status(200).json(contact)
})

const createContact=asyncHandler(async(req, res) => {
    console.log("data",req.body);
   const {name,email,phone,companyName,service}=req.body
   try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_SUPPORT,
      to: process.env.EMAIL_SUPPORT, // Change this to your recruiter/admin email
      bcc: process.env.EMAIL_BCC ,
      subject: 'New Contact Us Message',
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCompane Name: ${companyName}\nService: ${service}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }



    // if(!name || !email || !phone || !companyName ||!service){
    //     res.status(400)
    //     throw new Error("All field are mandatory")
    // }
    // const contact=await Contact.create({
        // Protected Route
        // user_id:req.user.id, 
//         name,email,phone,companyName,service
//     })
//    res.status(201).json(contact)
})

const updateContact=asyncHandler(async(req, res) => {
    const contact=await Contact.findById(req.params.id)
//    Protected Route
    // if(contact.user_id.toString() !== req.user.id){
    //    res.status(403);
    //    throw new Error("User don't have permission to update other user contacts")
    // }
    if(!contact){
        res.status(404)
        throw new Error("Contact not found")
    }
    const updatedContact=await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}
    )
    
    res.status(200).json(updatedContact)
})

const deleteContact=asyncHandler(async(req, res) => {
    const contact=await Contact.findById(req.params.id)
    // Protectedt Route
    // if(contact.user_id.toString() !== req.user.id){
    //     res.status(403);
    //     throw new Error("User don't have permission to update other user contacts")
    //  }
    if(!contact){
        res.status(404)
        throw new Error("Contact not found")
    }
  const deleteContact= await Contact.deleteOne({_id:req.params.id})
    res.status(200).json(deleteContact)
})


module.exports={getContacts,getContact,createContact,updateContact,deleteContact}