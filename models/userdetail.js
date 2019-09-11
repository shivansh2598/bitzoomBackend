const mongoose=require('mongoose')


var userdetail=new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    roll:{
        required:true,
        type:String
    },
    email_id:{
        required:true,
        type:String
    },
    pass:{
        required:true,
        type:String
    },
    ip:{
        required:true,
        type:String
    },
    uploads:{
        required:true,
        type:Number,
        default:0
    }
})

var userschema=mongoose.model('userschema',userdetail)
module.exports=userschema;