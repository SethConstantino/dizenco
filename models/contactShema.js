const mongoose=require('mongoose');

const contactSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    company:{
        type:String,
        default:null
    },
    state:{
        type:String,
        required:true
    },
    families:{
        type:Array,
        required:false
    },
    products:{
        type: Array
    },
    distributionChannel:{
        type:String,
        required:true
    },
    registerDate:{
        type:Date,
        default:Date.now()
    },
    attendanceDate:{
        type:Date,
        default:null
    },
    status:{
        type:Boolean,
        default:true
    }
});

module.exports=mongoose.model('contact', contactSchema);