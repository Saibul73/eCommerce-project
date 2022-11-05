
const multer = require('multer')
const express =require('express')
const router = express.Router();

const adminController = require('../controller/admin-controller')
const session = require('../middlewares/sesseion_middlewares');
const bannerController = require('../controller/banner-controller');
const orderController = require('../controller/order-controller');
const couponController =require('../controller/coupon-controller')

// multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/product_uploads');
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      ;
      cb(null,uniqueSuffix + '-' +file.originalname   )
  }
});
const upload = multer({ storage: storage });
//-------------------------------------------------------------------------------------------------------
const bannerstorage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/bannerImages');
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      ;
      cb(null,uniqueSuffix + '-' +file.originalname   )
  }
});
const uploads = multer({ storage: bannerstorage });



/* GET home page. */
router.get('/',adminController.loginPage);
router.get('/dash',session.adminSession,adminController.dashboard);
router.post('/dash',adminController.adminLogin);

/*  category  */

router.get('/add-category',session.adminSession,adminController.renderaddcategory)
router.post('/createcategory',session.adminSession,adminController.createcategory)
router.get('/categorytable',session.adminSession,adminController.categorytable)
router.get('/editcategory/:id',session.adminSession,adminController.rendereditcategory)
router.post('/editcategory/:id',session.adminSession,adminController.editcategory);
router.get('/delete-category/:id',session.adminSession,adminController.deleteCategory)

/*  product  */
router.get('/products',session.adminSession,adminController.getProduct);
router.get('/add-Product',session.adminSession,adminController.renderaddProduct);
router.post('/add-Product',session.adminSession,upload.array('photos', 4),adminController.addProduct);
router.get('/delete-product/:id',session.adminSession,adminController.deleteProduct)
router.get('/edit-product/:id',session.adminSession,adminController.rendereditProduct)
router.post('/edit-product/:id',session.adminSession,upload.array('photos', 4),adminController.editproduct)

/* users  */
router.get('/users',session.adminSession,adminController.userdata)
router.get('/block/:id',session.adminSession,adminController.userBlock)
router.get('/unblock/:id',session.adminSession,adminController.userUnblock)

/* banner mgt */
router.get('/bannertable',session.adminSession,bannerController.bannerTable)
router.get('/addBanner',session.adminSession,bannerController.renderaddbanner)
router.post('/addBanner',session.adminSession,uploads.single('image'),bannerController.addbanner)
router.get('/viewEditBanner/:id',session.adminSession,bannerController.vieweditbanner)
router.post('/editBanner/:id',session.adminSession,uploads.single('image'),bannerController.editbanner)
router.get('/deleteBanner/:id',session.adminSession,bannerController.deletebanner)

/* order mgt */
router.get('/orders',session.adminSession,orderController.adminView)
router.get('/editStatus/:id',session.adminSession,orderController.orderStatus)
router.post('/editStatusButton/:id',session.adminSession,orderController.statusButton)

/* coupon */
router.get('/viewCoupon',session.adminSession,couponController.couponTable)
router.get('/addCoupon',session.adminSession,couponController.renderaddcoupon)
router.post('/addCoupon',session.adminSession,couponController.addcoupon)
router.get('/editCoupon/:id',session.adminSession,couponController.renderEditcoupon)
router.post('/editCoupon/:id',session.adminSession,couponController.editcoupon)
router.get('/deleteCoupon/:id',session.adminSession,couponController.deleteCoupon)

router.get('/salesReport',session.adminSession,adminController.salesReport);

/*  logout */
router.get('/logout',adminController.logout)

// catch 404 and forward to error handler
router.use(function (req, res, next) {
  next(createError(404));
});

// error handler
router.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("admin/error",{layout:false});
});

module.exports = router;
 
 