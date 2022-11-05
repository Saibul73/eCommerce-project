let mongoose =require ('mongoose')

const wishlistModel =require('../modal/wishlistschema')
const getwishcount =require('../util/getwishcount')
const getcartcount =require('../util/getcartcount')



module.exports = {
    viewWishlist:async(req,res)=>{
        let user = req.session.user
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        let wishlistData = await wishlistModel.findOne({userId:user._id}).populate("products.productId").lean()
        if(wishlistData.products[0]){
        res.render('user/wishlist',{user,wishlistData,wishCount,cartCount})
        }else{
            res.render('user/emptyWishlist',{user,cartCount,wishCount})
        }
    },
    addtowishlist:async(req,res)=>{
        console.log()
      let  productId =req.params.id;
      let  user  =req.session.user;
        console.log(user._id,"<AAAAAAAAAAAAAA>",productId)
    let wishlist = await wishlistModel.findOne({userId:user._id}).lean()
    // console.log(wishlist,"CCCCCCCCCCCCCC")
    if(wishlist){
       let productexist = await wishlistModel.findOne({userId:user._id,"products.productId":productId})
      
        if(productexist){
            console.log(productexist)
       res.json({status:false})

            
        }else{
            await wishlistModel.findOneAndUpdate({userId:user._id},{$push:{products:{productId:productId}}})
       res.json({status:true})

        }
    }else{
        await wishlistModel.create({userId:user._id, products:{productId:productId}})
       res.json({status:true})
    }
 
     },
     removeproduct: async (req,res)=>{
        console.log(req.body.product,"EnTHI KETTO")
        let  user  =req.session.user._id;
        let wishlistdata = await wishlistModel.find({userId:user}).lean()
        // console.log(cartdata)
          await wishlistModel.updateOne({userId:user},{$pull:{products:{productId:req.body.product}}})
   
    res.json({productremoved:true})
    } 
}