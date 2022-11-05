const mongoose =require('mongoose')
const bcrypt =require('bcrypt')

const UserSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    phone_number:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
        default:false
    },
    otpVerified:{
        type:Boolean,
        default:false
    }
})


UserSchema.pre("save",async function (next){
    this.password = await bcrypt.hash(this.password,12);
    next();
})

const user =mongoose.model("user",UserSchema);

module.exports = user