var db=require('../configuration/connection')
const bcrypt=require('bcrypt');
var express = require('express');
const usersModel = require("../modal/userschema")
const productModel =require('../modal/productschema')
const adminModel=require('../modal/adminschema')
const categoryModel =require('../modal/categoryschema')
const cartModel =require('../modal/cartschema')
const getwishcount =require('../util/getwishcount')
const bannerModel =require('../modal/bannerschema')
const otp=require('./otp-controller');
const { response } = require('express');
const { populate } = require('../modal/userschema');
const cartFunctions=require('../controller/cartFunctions')
// const otpController = require('./otp-controller');

async function getcartcount(req,res){
    let user = req.session.user
    let cartCount = 0;
    if(user){
        let cart= await cartModel.findOne({userId:user._id}).lean()
        if(cart){
            cartCount = cart.products.length;
        }
    }
    return cartCount;
}


module.exports={

    home: async (req,res)=>{
        let categorydata = await categoryModel.find().lean()
        let products= await productModel.find().populate('category').lean()
        let user = req.session.user
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        let bannerData = await bannerModel.find().populate('product').lean()
        let newseason =await productModel.findOne({_id:'6361f5466f3d5eea2144850a'}).populate('category').lean()
        res.render('user/index',{user,products,categorydata,cartCount,wishCount,bannerData,newseason})
    },
    login:(req,res)=>{
        if(req.session.userLogin){
            return res.redirect('/')
        }
        res.render('user/user-login',{layout:false})
    },
    userLogin:async(req,res)=>{
        
        const {email,password} = req.body;

        if(!email || !password) return res.render('user/user-login',{msg:"field empty"});
        const user = await usersModel.findOne({email:email});
    if(!user){
       return res.render('user/user-login',{msg: "Email not exist"}) 
    }
    // let otp = await usersModel.findOne({_id:user._id},{otpVerified:1,_id:0})
    // console.log(otp,'TTTTT')

if(user.otpVerified==false)return res.render('user/user-login',{msg:'otp not verified'})
            var correct = await bcrypt.compare(password, user.password)
 
            if(!correct)
            return res.render('user/user-login',{msg: "password incorrect"})
        
        // console.log("error bypassed");
        if (!user || !correct) return res.json({ msg: "name or pass invalid" });

        block = await usersModel.findOne({email:email},{_id:0,block:1})
        console.log(block,"aAAAAAAAAa")
        if(user.block){
            var userBlock = true;
            return res.render('user/user-login',{ msg: "sorry user is blocked try contacting customer helpline number" });
        }
        // block = await usersModel.findOne({ email: email }, { _id: 0, block: 1 })
        // console.log(block.block);
        // if(block.block) return res.json({ msg: "sorry user is blocked try contacting customer helpline number" });
        console.log("teststart", correct, "testend");
        req.session.userLogin = true;
        req.session.user = user
        req.session.userId = await usersModel.findOne({ email: email }, { _id: 1 }).lean();
        res.redirect("/");
    },
    signup:(req,res)=>{
        res.render('user/user-signup')
    },
    doSignup:async(req,res)=>{
     let emailexist = await usersModel.findOne({email:req.body.email});
     
     if(emailexist){
     
        console.log("user already exits");
        return res.render('user/user-signup',{msg:"user already exist"});
     }
     req.body.block = false;
     const newuser = await usersModel.create(req.body);
     console.log(newuser);
     otp.doSms(newuser)
     const id = newuser._id;
     res.render('user/otp',{id})
    //  res.redirect("/user-login");
    },
    otpVerify: async(req, res, next) => {
        // console.log('ethiii');
        // console.log(req.params.id);
        const userdata = await usersModel.findOne({ _id: req.params.id }).lean();
        console.log(userdata);
        console.log(req.body.otp);
       const otps = req.body.otp;
        otpVerified = await otp.otpVerify(otps, userdata);
        if (otpVerified) {
          req.session.userLogin = true;
        req.session.user = userdata
        req.session.userId = await usersModel.findOne({ email: userdata.email }, { _id: 1 }).lean();
        await usersModel.findOneAndUpdate({_id:req.session.userId},{$set:{'otpVerified':true}})
        res.redirect("/");
        //   console.log(req.session.user)
        //   res.redirect('/');
        }
        else {
              await usersModel.deleteOne({_id: req.params.id})
          res.redirect('/')
        }
      },
    shop: async (req,res)=>{
        let categorydata = await categoryModel.find().lean()
        let user = req.session.user
        let products= await productModel.find().populate('category').lean()
        console.log(products)
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        res.render('user/viewProducts',{products,user,categorydata,cartCount,wishCount})
    },
    viewProduct: async (req,res)=>{
        let user = req.session.user
        let product = await productModel.findOne({_id: req.params.id}).lean()
        console.log(product);
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        res.render('user/product_detail',{product,user,cartCount,wishCount})
    },
    logout:(req,res)=>{
        req.session.destroy()
        res.redirect('/')
    }    
}
   