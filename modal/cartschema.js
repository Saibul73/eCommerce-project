const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product'
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ]
},{timestamps:true})

const cart = mongoose.model('cart',cartSchema)
module.exports=cart;