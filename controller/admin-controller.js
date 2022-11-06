
const adminModel=require('../modal/adminschema')
const productModel=require('../modal/productschema');
const usersModel =require('../modal/userschema')
const categoryModel=require('../modal/categoryschema')
const orderModel=require('../modal/orderSchema')
const fs =require('fs');
const path =require('path');
const bcrypt=require('bcrypt');



module.exports={

    loginPage: async(req,res,next)=>{
     if(req.session.adminLogin)
     return res.redirect('/admin/dash')
        res.render('admin/login',{layout:false})
    },

    dashboard: async(req,res,next)=>{
        let delivered = await orderModel.find({ status: 'delivered' }, { status: 1, _id: 0 }).lean()
    let deliveredCount = delivered.length
    let shipped = await orderModel.find({ status: 'shipped' }, { status: 1, _id: 0 }).lean()
    let shippedCount = shipped.length
    let cancelled = await orderModel.find({ status: 'cancelled' }, { status: 1, _id: 0 }).lean()
    let cancelledCount = cancelled.length
    let placed = await orderModel.find({ status: 'placed' }, { status: 1, _id: 0 }).lean()
    let placedCount = placed.length

    let orderData = await orderModel.find().populate('products.productId').lean()
    const deliveredOrder = orderData.filter(e => e.status == 'delivered')
    const TotalRevenue = deliveredOrder.reduce((accr, crr) => accr + crr.grandTotal, 0)
    const eachDaySale = await orderModel.aggregate([{ $match: { status: "delivered" } }, { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, total: { $sum: "$grandTotal" } } }]).sort({ _id: 1 })
    let today = new Date()
    
        res.render('admin/dashboard',{layout:'admin-layout',deliveredCount,shippedCount,cancelledCount,placedCount,today,TotalRevenue,eachDaySale})
    },

    adminLogin: async (req, res, next) => {
        const { email, password } = req.body;
        console.log(email+password);
        const admin = await adminModel.findOne({ "email": email }).lean();
        var correct = await bcrypt.compare(password, admin.password)
        if (email == 'admin@gmail.com' && correct) {
            req.session.adminLogin = true;
            console.log(req.session.adminLogin);
            res.redirect('/admin/dash');
        }
    },

    getProduct: async (req,res)=>{
        const productData = await productModel.find().populate('category').lean();
        // console.log(productData);
        res.render('admin/products',{layout:'admin-layout',productData})
    },

 
    
    renderaddProduct: async (req,res)=>{
        const categorydata =await categoryModel.find().lean()
        res.render('admin/add-product',{layout:'admin-layout',categorydata})
    },

    addProduct:async (req,res)=>{
        console.log('ehtiii')
        console.log(req.body)
        const productnames = await productModel.findOne({ name: req.body.name }).lean();
            console.log(productnames);
            if (productnames) 
            return res.send('product already exists');   
        console.log(req.files)
        const arrImages = req.files.map((value)=>value.filename) ;
        console.log(arrImages);
        req.body.imagepath = arrImages;
        console.log(req.body);
        await productModel.create(req.body);
        res.redirect('/admin/products')

    },
    deleteProduct: async (req, res, next) => {
        console.log(req.body,'YEHHH')
        imagepath = await productModel.findOne({ "_id": req.body.product }, { imagepath: 1, _id: 0 });
        imagepath.imagepath.map((i) => fs.unlinkSync(path.join(__dirname, '..', 'public', 'product_uploads', i)));
        await productModel.findOneAndDelete({ "_id": req.body.product}, { $set: { "name": req.body.name , "brandName": req.body.brandName,'description':req.body.description,'category':req.body.category,'stock':req.body.stock,'amount':req.body.amount,'discount':req.body.discount,'imagepath':req.body.imagepath} });
        res.json({}); 
    },
    rendereditProduct:async(req,res)=>{
        let productId = req.params.id;
        let productData = await productModel.findOne({_id:productId}).populate('category').lean()
        console.log(productData,"koooou")
        let categoryData = await categoryModel.find().lean()
        res.render('admin/editproduct',{layout:'admin-layout',productData,categoryData})
    },
    editproduct: async (req,res)=>{
        let arrImages = req.files.map((value) => value.filename);
        if (arrImages[0]) {
            imagepath = await productModel.findOne({ "_id": req.params.id }, { imagepath: 1, _id: 0 }).lean();
            console.log(imagepath,"AAAAAAAAAAAAAAAAAAAA");
            imagepath.imagepath.map(( i) => fs.unlinkSync(path.join(__dirname, '..', 'public', 'product_uploads', i)))
            req.body.imagepath = arrImages;
            await productModel.findOneAndUpdate({ "_id": req.params.id }, { $set: { "name": req.body.name , "brandName": req.body.brandName,'description':req.body.description,'category':req.body.category,'stock':req.body.stock,'price':req.body.price,'discount':req.body.discount,'imagepath':req.body.imagepath} });
        }
        else {
            await productModel.findOneAndUpdate({ "_id": req.params.id }, { $set: { "name": req.body.name , "brandName": req.body.brandName,'description':req.body.description,'category':req.body.category,'stock':req.body.stock,'price':req.body.price,'discount':req.body.discount} });
        }
        console.log()
        res.redirect('/admin/products');
    },
    userdata: async(req,res,next) => {
        
        const userdetails = await usersModel.find().lean();
        res.render('admin/users',{layout:'admin-layout',userdetails})
        // console.log(userdetails);
    },
    userBlock:async(req,res)=>{
        let userId= req.params.id;
        await usersModel.updateOne({_id:userId},{block:true});
        console.log('AAAAAAAAAAAa')
        res.redirect('/admin/users')
    },
    userUnblock:async(req,res)=>{
        let userId = req.params.id;
        await usersModel.updateOne({_id:userId},{block:false})
        res.redirect('/admin/users')
    },
    renderaddcategory:(req,res)=>{
        res.render('admin/add_category',{layout:'admin-layout'})
    },
    createcategory: async(req,res,next)=>{
        let categoryexist = await categoryModel.findOne({category: req.body.category}).lean();
        console.log('category already exist')
        if(categoryexist){
            return res.send('category already exist')
        }
        await categoryModel.create(req.body);
        res.redirect('/admin/categorytable');
    },
    categorytable: async (req,res)=>{
        let categorydata = await categoryModel.find().lean()
        res.render('admin/categorytable',{layout:"admin-layout",categorydata})
    },
    rendereditcategory: (req,res)=>{
        const categoryId = req.params.id;
        console.log(categoryId)
        res.render('admin/editcategory',{layout:'admin-layout',categoryId})
    },
    editcategory: async (req, res, next) => {
        // const categoryIds = req.params.id;
        // console.log("cataegory id is",categoryIds);
        await categoryModel.findOneAndUpdate({ "_id": req.params.id }, { $set: { "category": req.body.category  } });
        res.redirect('/admin/categorytable');
   },
   deleteCategory: async (req,res)=>{
    await categoryModel.deleteOne({_id:req.params.id})
    res.redirect('/admin/categorytable')
   },
   salesReport:async(req,res)=>{
    let data =await orderModel.find({status:"delivered"}).populate('products.productId').lean()
   // console.log(data,"1111")
    res.render('admin/SalesReport',{data,layout:false})
   },
   logout:(req,res)=>{
    req.session.destroy()
    res.redirect('/admin')
   }
}
   
    