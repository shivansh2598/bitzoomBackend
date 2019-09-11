const mongoose =require('mongoose')

var imageschema=new mongoose.Schema({
    imageurl:{
        required:true,
        type:String
    },
    subject:{
        required:true,
        type:String
    },
    branch:{
        required:true,
        type:String
    },
    semester:{
        required:true,
        type:Number,
    },
    year:{
        type:Number
    },
    mimetype:{
        required:true,
        type:String
    }
})

var pic=mongoose.model('pic',imageschema)
module.exports=pic;