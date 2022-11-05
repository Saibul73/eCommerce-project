const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    billingAddress:[
        {
            first_name:String,
            last_name:String,
            email:String,
            phoneNumber:Number,
            pincode:Number,
            address:String,
            city:String,
            State:String,
            landmark:String
        }
    ],
    products:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'product'
            },
            quantity:{
                type:Number,
                default:1
            },
            price:{
                type:Number,
                default:0
            }
        }
    ],
    paymentMethod:String,
    grandTotal:Number,
    status:String,
    orderId:String

},{timestamps:true})

const orderModel = mongoose.model('orders',orderSchema)
module.exports = orderModel;