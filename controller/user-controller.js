
const bcrypt=require('bcrypt');
const usersModel = require("../modal/userschema")
const productModel =require('../modal/productschema')
const categoryModel =require('../modal/categoryschema')
const cartModel =require('../modal/cartschema')
const getwishcount =require('../util/getwishcount')
const getcartcount =require('../util/getcartcount')
const bannerModel =require('../modal/bannerschema')
const otp=require('./otp-controller');




module.exports={

    home: async (req,res,next)=>{
        try {
            let categorydata = await categoryModel.find().lean()
        let products= await productModel.find().populate('category').lean()
        let user = req.session.user
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        let bannerData = await bannerModel.find().populate('product').lean()
        let newseason =await productModel.findOne({_id:'6361f5466f3d5eea2144850a'}).populate('category').lean()
        res.render('user/index',{user,products,categorydata,cartCount,wishCount,bannerData,newseason})
        } catch (error) {
            next(error)
        }
    },
    login:(req,res,next)=>{
        try {
            if(req.session.userLogin){
                return res.redirect('/')
            }
            res.render('user/user-login',{layout:false})
        } catch (error) {
            next(error)
        }
    },
    userLogin:async(req,res,next)=>{
        try {
            const {email,password} = req.body;

        if(!email || !password) return res.render('user/user-login',{msg:"field empty"});
        const user = await usersModel.findOne({email:email});
    if(!user){
       return res.render('user/user-login',{msg: "Email not exist"}) 
    }

if(user.otpVerified==false)return res.render('user/user-login',{msg:'otp not verified'})
            var correct = await bcrypt.compare(password, user.password)
 
            if(!correct)
            return res.render('user/user-login',{msg: "password incorrect"})
        
        if (!user || !correct) return res.json({ msg: "name or pass invalid" });

        block = await usersModel.findOne({email:email},{_id:0,block:1})
        if(user.block){
            var userBlock = true;
            return res.render('user/user-login',{ msg: "sorry user is blocked try contacting customer helpline number" });
        }
        req.session.userLogin = true;
        req.session.user = user
        req.session.userId = await usersModel.findOne({ email: email }, { _id: 1 }).lean();
        res.redirect("/");
        } catch (error) {
            next(error)
        }        
    },
    signup:(req,res,next)=>{
        try {
            res.render('user/user-signup')
        } catch (error) {
            next(error)
        }
    },
    doSignup:async(req,res,next)=>{
        try {
            let emailexist = await usersModel.findOne({email:req.body.email});
     
     if(emailexist){
        return res.render('user/user-signup',{msg:"user already exist"});
     }
     req.body.block = false;
     const newuser = await usersModel.create(req.body);
     otp.doSms(newuser)
     const id = newuser._id;
     res.render('user/otp',{id})
        } catch (error) {
            next(error)
        }
    },
    otpVerify: async(req, res, next) => {
        try {
            const userdata = await usersModel.findOne({ _id: req.params.id }).lean();
            const otps = req.body.otp;
             otpVerified = await otp.otpVerify(otps, userdata);
             if (otpVerified) {
               req.session.userLogin = true;
             req.session.user = userdata
             req.session.userId = await usersModel.findOne({ email: userdata.email }, { _id: 1 }).lean();
             await usersModel.findOneAndUpdate({_id:req.session.userId},{$set:{'otpVerified':true}})
             res.redirect("/");
             }
             else {
                   await usersModel.deleteOne({_id: req.params.id})
               res.redirect('/')
             }
        } catch (error) {
            next(error)
        }
       
      },
    shop: async (req,res,next)=>{
        try {
            let categorydata = await categoryModel.find().lean()
        let user = req.session.user
        let products= await productModel.find().populate('category').lean()
        console.log(products)
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        res.render('user/viewProducts',{products,user,categorydata,cartCount,wishCount})
        } catch (error) {
            next(error)
        }
        
    },
    viewProduct: async (req,res,next)=>{
        try {
            let user = req.session.user
        let product = await productModel.findOne({_id: req.params.id}).lean()
        console.log(product);
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        res.render('user/product_detail',{product,user,cartCount,wishCount})
        } catch (error) {
            next(error)
        }
        
    },
    logout:(req,res,next)=>{
        try {
            req.session.destroy()
        res.redirect('/')
        } catch (error) {
            next(error)
        }
        
    }    
}
   