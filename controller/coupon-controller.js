const mongoose = require('mongoose');
const admin = require('../modal/adminschema');
const couponModel=require('../modal/couponSchema')

module.exports={
    couponTable:async(req,res)=>{
       userId= req.session.userId
        let couponData = await couponModel.find().lean()
        res.render('admin/coupon-Table',{layout:'admin-layout',couponData})
    },
    renderaddcoupon:(req,res)=>{
        res.render('admin/addCoupon',{layout:'admin-layout'})
    },
    addcoupon:async(req,res)=>{
        // console.log(req.body) 
        let couponData = await couponModel.create(req.body)
    console.log(couponData)
        res.redirect('/admin/viewCoupon')
    },
    renderEditcoupon:async(req,res)=>{
        id = req.params.id
        let couponData = await couponModel.find({_id:id}).lean()
        couponData[0].expiryDate = couponData[0].expiryDate.toISOString().substring(0, 10);
         couponData = couponData[0];
      res.render('admin/editCoupon',{layout:'admin-layout',couponData})
    },
    editcoupon:async(req,res)=>{
        id=req.params.id
        await couponModel.findOneAndUpdate({_id:id},{ $set: {couponName:req.body.couponName,discountAmount:req.body.discountAmount,minAmount:req.body.minAmount,expiryDate:req.body.expiryDate,couponCode:req.body.couponCode}})
        res.redirect('/admin/viewCoupon')
    },
    deleteCoupon:async(req,res)=>{
        id= req.params.id
        await couponModel.findOneAndDelete({_id:id})
        res.redirect('/admin/viewCoupon')
    },
    validateCoupon: async (req, res, next) => {
            userId = req.session.userId;
            couponExist = await couponModel.findOne({ couponCode: req.body.couponId, users: userId }).lean();
            coupons = await couponModel.findOne({ couponCode: req.body.couponId }).lean();
            currentDate = new Date();

            if (coupons) {
                if (couponExist) {

                    return res.json({ message: 'used already' });
                }
                if (currentDate > coupons.expiryDate)
                    return res.json({ message: "coupon expired" });

                if (Number(req.body.total) < Number(coupons.minAmount)) {
                    return res.json({ message: "less than minimum" });
                }

                couponTotal = req.body.total - coupons.discountAmount;
                req.session.coupon = coupons;
                return res.json({ message: "succesfull", coupons, couponTotal });
            }
            return res.json({ message: "invalid coupon" });
    }
}