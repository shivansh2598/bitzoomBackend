const mongoose=require('mongoose')

var feedbackschema=new mongoose.Schema({
    name:{
        type:String
    },
    branch:{
        type:String
    },
    suggestion:{
        type:String,
        required:true
    },
    email:{
        type:String
    }
})

var feedback=mongoose.model('feed',feedbackschema)
module.exports=feedback;