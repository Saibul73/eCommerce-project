const getwishcount =require('../util/getwishcount')
const getcartcount =require('../util/getcartcount');
const addressModel = require('../modal/addressSchema');
const orderModel = require('../modal/orderSchema');
const usersModel =require('../modal/userschema')
const bcrypt =require('bcrypt')
module.exports ={

    renderUserprofile:async(req,res)=>{
        // let user =req.session.user
        let cartCount=await getcartcount(req,res);
        let wishCount=await getwishcount(req,res);
        let userId =req.session.userId
        let user = await usersModel.findOne({_id:userId}).lean()
        let addressData = await addressModel.find({userId:userId}).lean()
        res.render('user/userProfile',{user,cartCount,wishCount,addressData})
    },
    renderaddAddress:async(req,res)=>{
        let user=req.session.user
        let cartCount=await getcartcount(req,res)
        let wishCount=await getwishcount(req,res)

        res.render('user/addAddress',{user,cartCount,wishCount})
    },
    addAddress:async(req,res)=>{
        let userId =req.session.userId;
        req.body.userId=userId;
        await addressModel.create(req.body)

        res.redirect('/userAccount')
    },
    editaddress:async(req,res)=>{
        let userId= req.session.userId;
        let addressId= req.params.id;
        await addressModel.findOneAndUpdate({_id:addressId},{$set:{"first_name":req.body.first_name,"last_name":req.body.last_name,"phoneNumber":req.body.phoneNumber,"email":req.body.email,"pincode":req.body.pincode,"address":req.body.address,"city":req.body.city,"state":req.body.state,"landmark":req.body.landmark}})
        res.redirect('/userAccount')
    },
    deleteAddress:async(req,res)=>{
        let addressId = req.body.addressId
        let userId =req.session.userId
        await addressModel.findOneAndDelete({_id:addressId})
        res.json({delete:true})
    },
    myOrders:async(req,res)=>{
        let wishCount= await getwishcount(req,res);
        let cartCount= await getcartcount(req,res);
        let userId = req.session.userId
        let orderData =await orderModel.find({userId:userId}).sort({createdAt:-1}).populate('products.productId').lean()
        for (let i = 0; i < orderData.length; i++) {
            if (orderData[i].status == "cancelled") {
                orderData[i].cancelled = true;
            }
            else if (orderData[i].status == "delivered") {
                orderData[i].delivered = true;
            }
        }


        res.render('user/myOrders',{wishCount,cartCount,orderData})
    },
    changeUsername:async(req,res)=>{
        userId =req.session.userId
        await usersModel.findOneAndUpdate({_id:userId},{$set:{'first_name':req.body.name}})
        res.json({})
    },
    changePassword:async(req,res)=>{
        let oldpassword = req.body.oldpass
        let userId = req.session.userId
        let user = await usersModel.findOne({_id:userId}).lean()
        var correct = await  bcrypt.compare(oldpassword,user.password)
        console.log(correct,'TTTTTT')
        
        if(correct==true){ 
            let newpassword = await bcrypt.hash(req.body.newpass,12)
            await usersModel.findOneAndUpdate({_id:userId},{$set:{'password':newpassword}})
            res.json({status:true})
        }else{
        res.json({status:false})
        }
       
        
    }
}