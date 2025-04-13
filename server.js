const express=require('express');
const dotenv=require('dotenv').config();
const cors=require('cors')
const connectDB = require('./config/dbConnection');
const path = require('path');
connectDB()

const app=express()
const port=process.env.PORT;
const contactRoutes=require('./route/contactRoutes');
const careerRoutes=require('./route/careerRoute')
const userRoutes=require('./route/userRoutes')
const uploadReport=require('./route/uploadReportRoute')
const uploadGallery=require('./route/galleryRoute')
const newsRoutes=require('./route/newsRoute')
const clientRoutes=require('./route/clientRoute')
const enquiry=require('./route/enquiryRoute')
const errorHandler = require('./middleware/errorHandler');
app.use(cors({
    origin: 'http://localhost:4200',      // Allow only the frontend on localhost:4200
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow the specified HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],    // Allow specific headers
  }));
app.use(express.json())
app.use(errorHandler)
app.use("/api/contacts",contactRoutes)
app.use("/api/news",newsRoutes)
app.use("/api/client",clientRoutes)
app.use("/api/career",careerRoutes)
app.use("/api/enquiry",enquiry)

app.use("/api/user",userRoutes)
app.use("/api/uploadReport",uploadReport)
app.use("/api/gallery",uploadGallery)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(port,()=>{
    console.log("Server is running");
    
})
