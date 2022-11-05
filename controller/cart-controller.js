

const cartModel =require('../modal/cartschema')
const getwishcount =require('../util/getwishcount')
const getcartcount =require('../util/getcartcount')
const cartFunctions = require('../controller/cartFunctions');


// async function getcartcount(req,res){
//     let user = req.session.user
//     let cartCount = 0;
//     if(user){
//         let cart= await cartModel.findOne({userId:user._id}).lean()
//         if(cart){
//             cartCount = cart.products.length;
//         }
//     }
//     return cartCount;
// }

module.exports ={
    viewCart: async(req,res)=>{
        let user = req.session.user
        let cartCount = await getcartcount(req,res)
        let wishCount = await getwishcount(req,res)
        let productsData = await cartModel.findOne({userId:user._id}).populate("products.productId").lean()
        // console.log(productsData,"cart view")
        if(productsData.products[0]){
            totalAmount = await cartFunctions.totalAmount(productsData);
            res.render('user/cart',{user,productsData,cartCount,wishCount,totalAmount})

        }else{

            res.render('user/emptyCart',{user,cartCount,wishCount})
        }
        
    },
    addtocart:async(req,res)=>{
        console.log()
      let  productId =req.params.id;
      let  user  =req.session.user;
        console.log(user._id,"<AAAAABBBBBAAAAA>",productId)
    let userCart = await cartModel.findOne({userId:user._id}).lean()
    // console.log(userCart,"CCCCCCCCCCCCCC")
    if(userCart){
        productexist = await cartModel.findOne({userId:user._id,"products.productId":productId})
      
        if(productexist){
            await cartModel.updateOne({ userId: user._id, "products.productId": productId }, { $inc: { "products.$.quantity": 1 } });
        }else{
            await cartModel.findOneAndUpdate({userId:user._id},{$push:{products:{productId:productId,quantity:1}}})
        }
    }else{
        await cartModel.create({userId:user._id, products:{productId:productId,quantity:1}})
    }
    
    // let cartData = await cartModel.find({userId:user._id}).populate("products.productId").lean()
    // console.log(cartData)
       res.json({status:true})
     },
     removeproduct: async (req,res)=>{
        console.log(req.body,"EnTHI KETTO")
        let  user  =req.session.user._id;
        let cartdata = await cartModel.find({userId:user}).lean()
        console.log(cartdata)
          await cartModel.updateOne({userId:user},{$pull:{products:{productId:req.body.product}}})
   
    res.json({productremoved:true})
    },
     changequantity:async(req,res)=>{
         if(req.body.count == -1 && req.body.quantity == 1){

            //  await cartModel.updateOne({_id:req.body.cartId},{$pull:{products:{productId:req.body.proId}}})

            //  let cartdata = await cartModel.findOne({_id:req.body.cartId}).populate('products.productId').lean()
            //  console.log(cartdata,'DECRSD')
              res.json({minquantity:true})
         }else{
            if(req.body.count== -1 && req.body.quantity<=5){
             await cartModel.updateOne(
             { _id: req.body.cartId, "products.productId": req.body.proId },
                 { $inc: { "products.$.quantity": req.body.count } }
               );
               let cartData = await cartModel.findOne({_id:req.body.cartId}).populate('products.productId').lean()
               console.log(cartData.products,':UPDATED')
               let singleTotal =
               cartData.products[req.body.index].productId.price *
               cartData.products[req.body.index].quantity;

            //    let totalAmount = await cartTotalAmount.totalAmount(cartData)
            let totalAmount = await cartFunctions.totalAmount(cartData);
               console.log(totalAmount,singleTotal,'KURANJU GOOYS')

               res.json({status:true,singleTotal,totalAmount})
            }
            if(req.body.count ==1 && req.body.quantity<5){
                await cartModel.updateOne(
                    { _id: req.body.cartId, "products.productId": req.body.proId },
                        { $inc: { "products.$.quantity": req.body.count } }
                      );
                      let cartData = await cartModel.findOne({_id:req.body.cartId}).populate('products.productId').lean()
                      console.log(cartData,':UPDATED')
                      let singleTotal =
                      cartData.products[req.body.index].productId.price *
                      cartData.products[req.body.index].quantity;

                      let totalAmount = await cartFunctions.totalAmount(cartData);
                      console.log("TOTALAMOUNT==",totalAmount,'SINGLETOTAL==',singleTotal)

                    //   let totalAmount = await cartTotalAmount.totalAmount(cartData)
                    //   console.log(totalAmount,singleTotal,'VANNALLO')

       
                      res.json({status:true,singleTotal,totalAmount})
                }

         }
     } 
}
