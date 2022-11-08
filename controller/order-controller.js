const orderModel = require("../modal/orderSchema");
const cartModel = require("../modal/cartschema");
const cartFunctions = require("../controller/cartFunctions");
const getcartcount = require("../util/getcartcount");
const razorpayController = require("../controller/razorpay-controller");
const couponModel = require("../modal/couponSchema");

module.exports = {
  confirmOrder: async (req, res, next) => {
    try {
      let userId = req.session.userId;
      let cartData = await cartModel
        .findOne({ userId: userId })
        .populate("products.productId")
        .lean();
      var totalAmount = await cartFunctions.totalAmount(cartData);
      let totalAmounts = totalAmount * 100;

      if (req.session.coupon) {
        let discountAmount = req.session.coupon.discountAmount;

        var totalAmount = totalAmount - discountAmount;
        await couponModel.findOneAndUpdate(
          { _id: req.session.coupon._id },
          { $set: { users: userId } }
        );
      }

      let orderData = await orderModel.create({
        userId: userId,
        billingAddress: req.body,
        products: cartData.products,
        status: "placed",
        paymentMethod: req.body.paymentMethod,
        grandTotal: totalAmount,
      });
      console.log(orderData);
      orderDataPopulated = await orderModel
        .findOne({ _id: orderData._id })
        .populate("products.productId")
        .lean();
      req.session.orderData = orderData;

      if (orderData.paymentMethod == "COD") {
        req.session.orderData = null;
        req.session.confirmationData = { orderDataPopulated, totalAmount };
        res.json({ status: "COD", totalAmount, orderData });
      } else if (orderData.paymentMethod == "Online Payment") {
        let orderData = req.session.orderData;
        req.session.orderData = null;
        razorData = await razorpayController.generateRazorpy(
          orderData._id,
          totalAmount
        );

        await orderModel.findOneAndUpdate(
          { _id: orderData._id },
          { orderId: razorData.id }
        );
        razorId = process.env.RAZORPAY_ID;

        req.session.confirmationData = { orderDataPopulated, totalAmount };

        res.json({
          message: "success",
          totalAmount,
          razorData,
          orderData,
          totalAmounts,
        });
      }
    } catch (error) {
      next(error);
    }
  },
  verifyPay: async (req, res, next) => {
    try {
      success = await razorpayController.validate(req.body);
      if (success) {
        await orderModel.findOneAndUpdate(
          { orderId: req.body["razorData[id]"] },
          { paymentStatus: "success" }
        );
        return res.json({ status: "true" });
      } else {
        await orderModel.findOneAndUpdate(
          { orderId: req.body["razorData[id]"] },
          { paymentStatus: "failed" }
        );
        return res.json({ status: "failed" });
      }
    } catch (error) {
      next(error);
    }
  },
  confirmationPage: async (req, res, next) => {
    try {
      let userId = req.session.userId;
      await cartModel.findOneAndDelete({ userId: userId });
      let orderDataPopulated = req.session.confirmationData.orderDataPopulated;
      let totalAmount = req.session.confirmationData.totalAmount;
      let cartCount = await getcartcount(req, res);
      res.render("user/orderConfirmation", {
        orderDataPopulated,
        totalAmount,
        cartCount,
      });
    } catch (error) {
      next(error);
    }
  },
  cancelOrder: async (req, res, next) => {
    try {
      let userId = req.session.userId;
      let orderId = req.body.orderId;
      console.log(orderId);
      await orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: "cancelled" } }
      );
      res.json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  adminView: async (req, res, next) => {
    try {
      let orderData = await orderModel.find().populate("userId").lean();
      res.render("admin/viewOrders", { layout: "admin-layout", orderData });
    } catch (error) {
      next(error);
    }
  },
  orderStatus: async (req, res, next) => {
    try {
      let orderId = req.params.id;
      let orderData = await orderModel.findOne({ _id: orderId }).lean();
      let placed, delivered, cancelled, shipped;
      if (orderData.status == "placed") {
        placed = true;
      } else if (orderData.status == "cancelled") {
        cancelled = true;
      } else if (orderData.status == "delivered") {
        delivered = true;
      } else if (orderData.status == "shipped") {
        shipped = true;
      }
      res.render("admin/editStatus", {
        layout: "admin-layout",
        placed,
        delivered,
        cancelled,
        shipped,
        orderData,
      });
    } catch (error) {
      next(error);
    }
  },
  statusButton: async (req, res, next) => {
    try {
      let newStatus = req.body.status;
      let orderId = req.params.id;
      await orderModel
        .findOneAndUpdate({ _id: orderId }, { $set: { status: newStatus } })
        .lean();
      res.redirect("/admin/orders");
    } catch (error) {
      next(error);
    }
  },
};
