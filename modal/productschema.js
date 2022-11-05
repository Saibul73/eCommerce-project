const mongoose =require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String
    },
    brandName:{
        type:String
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'category'
    },
    description:{
        type:String
    },
    stock:{
        type:Number
    },
    price:{
        type:Number
    },
    discount:{
        type:Number
    },
    imagepath:{
        type:Array
    }


},
{timestamps:true})

const product =  mongoose.model("product", productSchema )

module.exports = product;