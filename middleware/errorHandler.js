const { constant } = require("../constant");

const errorHandler=(err,req, res, next)=>{
    const statusCode=res.statusCode?res.statusCode:500
    res.json({message:err.message, stackTrace:err.stack})


    switch (statusCode) {
        case constant.VALIDATION_ERROR:
            res.json({titlte:"Validation failed",message:err.message, stackTrace:err.stack})
            break;


        case constant.UNAUTHORIZED:
            res.json({titlte:"Unauthorized",message:err.message, stackTrace:err.stack})
            break;

        case constant.NOT_FOUND:
            res.json({titlte:"Not found",message:err.message, stackTrace:err.stack})
            break;
        case constant.FORBIDDEN:
            res.json({titlte:"Forbidden",message:err.message, stackTrace:err.stack})
            break;
        case constant.SERVER_ERROR:
            res.json({titlte:"Server error",message:err.message, stackTrace:err.stack})
            break;
        default:
            console.log("No error");
            
            break;
    }
}
module.exports=errorHandler