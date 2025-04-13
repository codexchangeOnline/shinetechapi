const mongoose=require('mongoose');

const roleSchema=mongoose.Schema({

    roleId:{
        type:String,
        required:[true]
    },
    roleName:{
        type:String,
    },

},
{
    timestamps:true
}
)
module.exports=mongoose.model("RoleMaster",roleSchema)