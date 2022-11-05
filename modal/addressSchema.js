const mongoose = require('mongoose')


const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    first_name:{
    type:String,
    required:true
    },
    last_name:{
    type:String,
    required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    landmark:{
        type:String
    },


},{timestamps:true});

const addressModel = mongoose.model('address',addressSchema)

module.exports=addressModel;