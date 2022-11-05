const bannerModel =require('../modal/bannerschema')
const product = require('../modal/productschema')
const productModel =require('../modal/productschema')
const fs =require('fs')

module.exports = {
    bannerTable :async(req,res)=>{
        let bannerData = await bannerModel.find().populate("product").lean()
        console.log(bannerData,"VVVVAAADDAA")
        res.render('admin/bannerTable',{layout:'admin-layout',bannerData})
    },
    renderaddbanner:async(req,res)=>{
       let productData = await productModel.find().lean()
        res.render('admin/addbanner',{layout:'admin-layout',productData})
    },
    addbanner:async(req,res)=>{
        console.log(req.body)
        req.body.image = req.file.filename;
       await bannerModel.create(req.body)
        // let bannerData = await bannerModel.find().lean()
        // console.log(bannerData)
        res.redirect('/admin/bannerTable')
    },
    vieweditbanner:async(req,res)=>{
        let bannerId = req.params.id
        let productData = await productModel.find().lean()
        let bannerData =await bannerModel.findOne({_id:bannerId}).populate('product').lean()
        res.render('admin/editbanner',{layout:'admin-layout',productData,bannerData})
    },
    editbanner:async (req, res) => {
        let bannerId = req.params.id;
        //await bannerModel.findOneAndUpdate({_id:bannerId},{$set:{heading:req.body.heading}})
        console.log("req.body from edit banenr",req.body)
        // let image = req.file
        console.log("image from edit banner:",req.file);
        if (req.file){
            imagePath= await bannerModel.findOne({ _id: req.params.id }, { _id: 0, image: 1 });
                fs.unlinkSync('public/bannerImages/'+imagePath.image);
                req.body.image = req.file.filename;
                await bannerModel.findOneAndUpdate({ _id: req.params.id }, { image: req.body.image });
            }
        if (req.body.productId) {
         
                await bannerModel.findOneAndUpdate({ _id: req.params.id }, {  productId: req.body.productId });
            }
        if(req.body.heading){
            await bannerModel.findOneAndUpdate({ _id: req.params.id }, { heading: req.body.heading });}
        if(req.body.subHeading){
            await bannerModel.findOneAndUpdate({ _id: req.params.id }, { subHeading: req.body.subHeading });       
        }
        if(req.body.product){
            await bannerModel.findOneAndUpdate({ _id: req.params.id }, { product: req.body.product });       
        }

        res.redirect('/admin/bannerTable');
    },
    deletebanner: async (req, res) => {
        let bannerId = req.params.id;
        // await bannerModel.findOneAndDelete({ productId: productId }).lean()
        imagePath= await bannerModel.findOne({ _id: bannerId }, { _id: 0, image: 1 });
        fs.unlinkSync('public/bannerImages/'+imagePath.image);
        await bannerModel.findOneAndDelete({ _id: bannerId });
        res.redirect('/admin/bannerTable');
        
    }
}