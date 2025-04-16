const asyncHandler=require('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt=require('jsonwebtoken')
const dotenv=require('dotenv').config();
const sendResetEmail = require("../forgetPasswordService");
const registerUser=asyncHandler(async(req, res) => {
    const {username,email,password,roleName}=req.body
    
    if(!username || !email || !password || !roleName){
        res.status(400)
        throw new Error("All field are mandatory")
    }
    const userAailable=await User.findOne({email})
    if(userAailable){
        res.status(200).json({
            message:"User already exist"})  
    }
    const hashpassword=await bcrypt.hash(password,10)
    const user= await User.create({
        username,email,password:hashpassword,roleName,originalPassword:password
    })
    if(user){
        res.status(201).json({
            message:"Register Successfull!",
            _id:user.id,email:user.email,roleName:user.roleName})   
    }else{

        res.status(400)
        throw new Error("User is not valid")
    }
})

const loginUser=asyncHandler(async(req, res) => {
    const {email, password}=req.body
    if(!email || !password){
       res.status(400) 
       throw new Error("All field are mandatory");
       
    }
    const user=await User.findOne({email})
    if(user && (await bcrypt.compare(password,user.password))){
    //    const accessToken=jwt.sign({
    //     user:{
    //         username:user.username,
    //         email:user.email,
    //         id:user.id
    //     },
       
    //    }, process.env.ACCESS_TOKEN_SECRET,
    // {expiresIn:"30m"})
    //     res.status(200).json({accessToken})


        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roleName:user.roleName
            },
        });
    }
    else{
        res.status(200).json({
            message: "Login failed.Incorrect Crendential",
            user: {
                id: 0
            },
        })
    }
    
})

const currentUser=asyncHandler(async(req, res) => {
    
    res.status(200).json(req.user)
})

const getUser=asyncHandler(async(req, res) => {
    
    try {
        const clients = await User.find({ roleName: 'Client' }).select('username _id');
        res.status(200).json({ data: clients });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching clients' });
      }
})


const changePassword=async(req,res)=>{
    try {
        const { email,currentPassword, newPassword, retypeNewPassword } = req.body;
    
        if (!currentPassword || !newPassword || !retypeNewPassword) {
          return res.status(400).json({ error: "All fields are required" });
        }
    
        if (newPassword !== retypeNewPassword) {
          return res.status(400).json({ error: "New passwords do not match" });
        }
    
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: "Incorrect current password" });
        }
    
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
    
        res.json({ message: "Password updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
  
    
    
}

const forgetPassword=async(req,res)=>{
  try {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // ✅ Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // ✅ Save token and expiration time (15 minutes)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    await user.save();

    // ✅ Create reset password link
    const resetLink = `${process.env.FRONTEND_BASE_URL}/resetpassword?resetCode=${resetToken}`;

    // ✅ Send email
    const emailResponse = await sendResetEmail(user.email, resetLink);
    if (!emailResponse.success) {
        return res.status(500).json({ error: emailResponse.error });
    }

    res.json({ message: "Password reset link sent to your email." });

} catch (error) {
    res.status(500).json({ error: "Server error" });
}
  
    
    
}

const resetPassword = async (req, res) => {
  try {
    const { resetCode, newPassword } = req.body;

    if (!resetCode || !newPassword) {
        return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    const user = await User.findOne({ resetPasswordToken: resetCode });

    if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    // Check expiration (15 min limit)
    const expirationTime = 15 * 60 * 1000;
    if (Date.now() - user.resetPasswordExpires > expirationTime) {
        return res.status(400).json({ error: "Reset code expired. Request a new one." });
    }

    // Update password and clear reset code
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully!" });

} catch (error) {
    res.status(500).json({ error: "Server error" });
}
};

module.exports={registerUser,loginUser,currentUser,getUser,changePassword,forgetPassword,resetPassword}