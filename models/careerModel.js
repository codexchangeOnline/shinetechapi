const mongoose=require('mongoose')

const careerSchema=mongoose.Schema({
    designation:{
        type:String,
        required:[true, "Please add the designation"]
    },
    name:{
        type:String,
        required:[true, "Please add the contact name"]
    },
    email:{
        type:String,
        required:[true, "Please add the contact address"]
    },
    experience:{
        type:String,
        required:[true, "Please add the experience"]
    },
    resume: {
        type: String, // Path to the uploaded file
        required: [true, "Resume is required"],
    },
    phone:{
        type:String,
        required:[true, "Please add the contact number"]
    },
},{
    timestamps:true,
})

module.exports=mongoose.model("Career",careerSchema)