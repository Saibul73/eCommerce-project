const wishlistModel = require("../modal/wishlistschema");
const getwishcount = require("../util/getwishcount");
const getcartcount = require("../util/getcartcount");

module.exports = {
  viewWishlist: async (req, res, next) => {
    try {
      let user = req.session.user;
      let cartCount = await getcartcount(req, res);
      let wishCount = await getwishcount(req, res);
      let wishlistData = await wishlistModel
        .findOne({ userId: user._id })
        .populate("products.productId")
        .lean();
      if (wishlistData.products[0]) {
        res.render("user/wishlist", {
          user,
          wishlistData,
          wishCount,
          cartCount,
        });
      } else {
        res.render("user/emptyWishlist", { user, cartCount, wishCount });
      }
    } catch (error) {
      next(error);
    }
  },
  addtowishlist: async (req, res, next) => {
    try {
      let productId = req.params.id;
      let user = req.session.user;

      let wishlist = await wishlistModel.findOne({ userId: user._id }).lean();

      if (wishlist) {
        let productexist = await wishlistModel.findOne({
          userId: user._id,
          "products.productId": productId,
        });

        if (productexist) {
          res.json({ status: false });
        } else {
          await wishlistModel.findOneAndUpdate(
            { userId: user._id },
            { $push: { products: { productId: productId } } }
          );
          res.json({ status: true });
        }
      } else {
        await wishlistModel.create({
          userId: user._id,
          products: { productId: productId },
        });
        res.json({ status: true });
      }
    } catch (error) {
      next(error);
    }
  },
  removeproduct: async (req, res, next) => {
    try {
      let user = req.session.user._id;
      let wishlistdata = await wishlistModel.find({ userId: user }).lean();
      // console.log(cartdata)
      await wishlistModel.updateOne(
        { userId: user },
        { $pull: { products: { productId: req.body.product } } }
      );

      res.json({ productremoved: true });
    } catch (error) {
      next(error);
    }
  },
};
