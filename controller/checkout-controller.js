const getcartcount = require('../util/getcartcount')
const getwishcount = require('../util/getwishcount')
const addressModel = require('../modal/addressSchema')
const cartModel = require('../modal/cartschema')
const cartFunctions= require('../controller/cartFunctions')
const couponModel =require('../modal/couponSchema')


module.exports={
    renderCheckOut:async(req,res)=>{
        let user =req.session.user
        let cartCount= await getcartcount(req,res)
        let wishCount =await getwishcount(req,res)
        let userId = req.session.userId
        let addressData =await addressModel.find({userId:userId}).lean()
        let cartData= await cartModel.findOne({userId:userId}).populate('products.productId').lean()
        let totalAmount= await cartFunctions.totalAmount(cartData)
        let couponData = await couponModel.find().lean()
        console.log(totalAmount)
        res.render('user/checkOut',{user,cartCount,wishCount,addressData,cartData,totalAmount,couponData})
    },
    billingAddress:async(req,res)=>{
        let userId =req.session.userId
        let address = await addressModel.findOne({userId:userId,_id:req.body.address}).lean()
        // console.log(address)
        res.json({status:true,address})
}
}