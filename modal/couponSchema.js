const mongoose =require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String,
    },
    discountAmount:{
        type:Number
    },
    minAmount:{
        type:Number
    },
    expiryDate:{
        type:Date
    },
    couponCode:{
        type:String
    },
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ]
},{timestamps:true})
const couponModel = mongoose.model("coupon",couponSchema);
module.exports = couponModel;