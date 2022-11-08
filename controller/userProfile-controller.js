const getwishcount = require("../util/getwishcount");
const getcartcount = require("../util/getcartcount");
const addressModel = require("../modal/addressSchema");
const orderModel = require("../modal/orderSchema");
const usersModel = require("../modal/userschema");
const bcrypt = require("bcrypt");
module.exports = {
  renderUserprofile: async (req, res, next) => {
    try {
      let cartCount = await getcartcount(req, res);
      let wishCount = await getwishcount(req, res);
      let userId = req.session.userId;
      let user = await usersModel.findOne({ _id: userId }).lean();
      let addressData = await addressModel.find({ userId: userId }).lean();
      res.render("user/userProfile", {
        user,
        cartCount,
        wishCount,
        addressData,
      });
    } catch (error) {
      next(error);
    }
  },
  renderaddAddress: async (req, res, next) => {
    try {
      let user = req.session.user;
      let cartCount = await getcartcount(req, res);
      let wishCount = await getwishcount(req, res);

      res.render("user/addAddress", { user, cartCount, wishCount });
    } catch (error) {
      next(error);
    }
  },
  addAddress: async (req, res, next) => {
    try {
      let userId = req.session.userId;
      req.body.userId = userId;
      await addressModel.create(req.body);

      res.redirect("/userAccount");
    } catch (error) {
      next(error);
    }
  },
  editaddress: async (req, res, next) => {
    try {
      let userId = req.session.userId;
      let addressId = req.params.id;
      await addressModel.findOneAndUpdate(
        { _id: addressId },
        {
          $set: {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            pincode: req.body.pincode,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            landmark: req.body.landmark,
          },
        }
      );
      res.redirect("/userAccount");
    } catch (error) {
      next(error);
    }
  },
  deleteAddress: async (req, res, next) => {
    try {
      let addressId = req.body.addressId;
      let userId = req.session.userId;
      await addressModel.findOneAndDelete({ _id: addressId });
      res.json({ delete: true });
    } catch (error) {
      next(error);
    }
  },
  myOrders: async (req, res, next) => {
    try {
      let wishCount = await getwishcount(req, res);
      let cartCount = await getcartcount(req, res);
      let userId = req.session.userId;
      let orderData = await orderModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .populate("products.productId")
        .lean();
      for (let i = 0; i < orderData.length; i++) {
        if (orderData[i].status == "cancelled") {
          orderData[i].cancelled = true;
        } else if (orderData[i].status == "delivered") {
          orderData[i].delivered = true;
        }
      }

      res.render("user/myOrders", { wishCount, cartCount, orderData });
    } catch (error) {
      next(error);
    }
  },
  changeUsername: async (req, res, next) => {
    try {
      userId = req.session.userId;
      await usersModel.findOneAndUpdate(
        { _id: userId },
        { $set: { first_name: req.body.name } }
      );
      res.json({});
    } catch (error) {
      next(error);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      let oldpassword = req.body.oldpass;
      let userId = req.session.userId;
      let user = await usersModel.findOne({ _id: userId }).lean();
      var correct = await bcrypt.compare(oldpassword, user.password);

      if (correct == true) {
        let newpassword = await bcrypt.hash(req.body.newpass, 12);
        await usersModel.findOneAndUpdate(
          { _id: userId },
          { $set: { password: newpassword } }
        );
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      next(error);
    }
  },
};
