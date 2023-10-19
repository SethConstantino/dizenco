const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:false
    },
    birthDate:{
        type:Date,
        required:false
    },
    admissionDate:{
        type:Date,
        required:false
    },
    objective:{
        type:String,
        required:true
    },
    role:{
        type:Boolean,
        default:false
    },
    status:{
        type:Boolean,
        default:true
    }
});

module.exports=mongoose.model('user', userSchema);