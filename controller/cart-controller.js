const cartModel = require("../modal/cartschema");
const getwishcount = require("../util/getwishcount");
const getcartcount = require("../util/getcartcount");
const cartFunctions = require("../controller/cartFunctions");

module.exports = {
  viewCart: async (req, res, next) => {
    try {
      let user = req.session.user;
      let cartCount = await getcartcount(req, res);
      let wishCount = await getwishcount(req, res);
      let productsData = await cartModel
        .findOne({ userId: user._id })
        .populate("products.productId")
        .lean();
      if (productsData.products[0]) {
        totalAmount = await cartFunctions.totalAmount(productsData);
        res.render("user/cart", {
          user,
          productsData,
          cartCount,
          wishCount,
          totalAmount,
        });
      } else {
        res.render("user/emptyCart", { user, cartCount, wishCount });
      }
    } catch (error) {
      next(error);
    }
  },
  addtocart: async (req, res, next) => {
    try {
      let productId = req.params.id;
      let user = req.session.user;
      let userCart = await cartModel.findOne({ userId: user._id }).lean();
      if (userCart) {
        productexist = await cartModel.findOne({
          userId: user._id,
          "products.productId": productId,
        });
        if (productexist) {
          await cartModel.updateOne(
            { userId: user._id, "products.productId": productId },
            { $inc: { "products.$.quantity": 1 } }
          );
        } else {
          await cartModel.findOneAndUpdate(
            { userId: user._id },
            { $push: { products: { productId: productId, quantity: 1 } } }
          );
        }
      } else {
        await cartModel.create({
          userId: user._id,
          products: { productId: productId, quantity: 1 },
        });
      }
      res.json({ status: true });
    } catch (error) {
      next(error);
    }
  },
  removeproduct: async (req, res, next) => {
    try {
      let user = req.session.user._id;
      let cartdata = await cartModel.find({ userId: user }).lean();
      await cartModel.updateOne(
        { userId: user },
        { $pull: { products: { productId: req.body.product } } }
      );
      res.json({ productremoved: true });
    } catch (error) {
      next(error);
    }
  },
  changequantity: async (req, res, next) => {
    try {
      if (req.body.count == -1 && req.body.quantity == 1) {
        res.json({ minquantity: true });
      } else {
        if (req.body.count == -1 && req.body.quantity <= 5) {
          await cartModel.updateOne(
            { _id: req.body.cartId, "products.productId": req.body.proId },
            { $inc: { "products.$.quantity": req.body.count } }
          );
          let cartData = await cartModel
            .findOne({ _id: req.body.cartId })
            .populate("products.productId")
            .lean();
          let singleTotal =
            cartData.products[req.body.index].productId.price *
            cartData.products[req.body.index].quantity;

          let totalAmount = await cartFunctions.totalAmount(cartData);
          res.json({ status: true, singleTotal, totalAmount });
        }
        if (req.body.count == 1 && req.body.quantity < 5) {
          await cartModel.updateOne(
            { _id: req.body.cartId, "products.productId": req.body.proId },
            { $inc: { "products.$.quantity": req.body.count } }
          );
          let cartData = await cartModel
            .findOne({ _id: req.body.cartId })
            .populate("products.productId")
            .lean();
          let singleTotal =
            cartData.products[req.body.index].productId.price *
            cartData.products[req.body.index].quantity;

          let totalAmount = await cartFunctions.totalAmount(cartData);
          res.json({ status: true, singleTotal, totalAmount });
        }
      }
    } catch (error) {
      next(error);
    }
  },
};
