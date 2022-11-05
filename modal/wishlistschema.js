const mongoose = require('mongoose');
const wishlistSchema = new mongoose.Schema({
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
            // quantity:{
            //     type:Number,
            //     default:1
            // }
        }
    ]
},{timestamps:true})

const wishlist = mongoose.model('wishlist',wishlistSchema)
module.exports= wishlist;