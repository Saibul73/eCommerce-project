
var express = require("express");
const session = require("../middlewares/sesseion_middlewares");
var router = express.Router();
const userController = require("../controller/user-controller");
const cartController = require('../controller/cart-controller');
const wishlistController = require("../controller/wishlist-controller");
const checkoutController = require('../controller/checkout-controller')
const userProfileController=require('../controller/userProfile-controller');
const orderController = require("../controller/order-controller");
const couponController =require('../controller/coupon-controller')

/* GET home page. */

router.get("/",userController.home);
router.get('/user-login',userController.login)
router.post('/user-login',userController.userLogin)
router.get('/logout',userController.logout)

router.get("/user-signup",userController.signup);
router.post('/user-signup',userController.doSignup)
router.post('/otpverify/:id',userController.otpVerify)

router.get('/shop',userController.shop)
router.get('/product_detail/:id',userController.viewProduct)

// cart routes;
router.get('/addtocart/:id',session.userSession,cartController.addtocart)
router.get('/view_cart',session.userSession,cartController.viewCart)
router.post('/remove-product',session.userSession,cartController.removeproduct)
router.post('/changeQuantity',session.userSession,cartController.changequantity)

// checkout routes;
router.get('/checkout',session.userSession,checkoutController.renderCheckOut);
router.post('/billingAddress',session.userSession,checkoutController.billingAddress)

router.post('/confirmOrderButton',session.userSession,orderController.confirmOrder)
router.post('/verifyRazorpay',session.userSession, orderController.verifyPay);
router.get('/renderConfirmation',session.userSession,orderController.confirmationPage)

// coupon;
router.post('/couponValidation',session.userSession,couponController.validateCoupon)

//userprofile routes;
router.get('/useraccount',session.userSession,userProfileController.renderUserprofile);
router.get('/addAddress',session.userSession,userProfileController.renderaddAddress)
router.post('/submitAddress',userProfileController.addAddress)
router.post('/editAddress/:id',userProfileController.editaddress)
router.post('/deleteAddress',userProfileController.deleteAddress)
router.get('/myOrders',session.userSession,userProfileController.myOrders)
router.post('/cancelOrder',session.userSession,orderController.cancelOrder)
router.patch('/changeUsername',session.userSession,userProfileController.changeUsername)
router.patch('/changePassword',session.userSession,userProfileController.changePassword)

//wishlist

router.get('/view-wishlist',session.userSession,wishlistController.viewWishlist)
router.get('/add-wishlist/:id',session.userSession,wishlistController.addtowishlist)
router.post('/remove-wishlist',session.userSession,wishlistController.removeproduct)


module.exports = router;


