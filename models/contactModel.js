const mongoose=require('mongoose')

const contactSchema=mongoose.Schema({
    // user_id:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     required:true,
    //     ref:"User"
    // },
    name:{
        type:String,
        required:[true, "Please add the contact name"]
    },
    email:{
        type:String,
        required:[true, "Please add the contact address"]
    },
    phone:{
        type:String,
        required:[true, "Please add the contact number"]
    },
    companyName:{
        type:String,
        required:[true, "Please add the companyName"]
    },
    service:{
        type:String,
        required:[true, "Please add the contact number"]
    }
},{
    timestamps:true,
})

module.exports=mongoose.model("Contact",contactSchema)