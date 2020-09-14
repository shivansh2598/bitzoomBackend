const mongoose = require('mongoose')

var subjectLst = new mongoose.Schema({
    Subject : {
        required : true,
        type : String
    },
    Branch : {
        requried : true,
        type : String
    },
    Semester : {
        required : true,
        type : Number
    }
})

var subjectList = mongoose.model('subjectlist', subjectLst);
module.exports = subjectList;