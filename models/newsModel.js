const mongoose=require('mongoose')

const NewsSchema = new mongoose.Schema({
    title: String,
    description: String,
    fullContent: String,
    image: String
  }, { timestamps: true });


  module.exports=mongoose.model('News',NewsSchema)

