const couponModel = require("../modal/couponSchema");

module.exports = {
  couponTable: async (req, res, next) => {
    try {
      userId = req.session.userId;
      let couponData = await couponModel.find().lean();
      res.render("admin/coupon-Table", { layout: "admin-layout", couponData });
    } catch (error) {
      next(error);
    }
  },
  renderaddcoupon: (req, res, next) => {
    try {
      res.render("admin/addCoupon", { layout: "admin-layout" });
    } catch (error) {
      next(error);
    }
  },
  addcoupon: async (req, res, next) => {
    try {
      let couponData = await couponModel.create(req.body);
      console.log(couponData);
      res.redirect("/admin/viewCoupon");
    } catch (error) {
      next(error);
    }
  },
  renderEditcoupon: async (req, res, next) => {
    try {
      id = req.params.id;
      let couponData = await couponModel.find({ _id: id }).lean();
      couponData[0].expiryDate = couponData[0].expiryDate
        .toISOString()
        .substring(0, 10);
      couponData = couponData[0];
      res.render("admin/editCoupon", { layout: "admin-layout", couponData });
    } catch (error) {
      next(error);
    }
  },
  editcoupon: async (req, res, next) => {
    try {
      id = req.params.id;
      await couponModel.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            couponName: req.body.couponName,
            discountAmount: req.body.discountAmount,
            minAmount: req.body.minAmount,
            expiryDate: req.body.expiryDate,
            couponCode: req.body.couponCode,
          },
        }
      );
      res.redirect("/admin/viewCoupon");
    } catch (error) {
      next(error);
    }
  },
  deleteCoupon: async (req, res, next) => {
    try {
      id = req.params.id;
      await couponModel.findOneAndDelete({ _id: id });
      res.redirect("/admin/viewCoupon");
    } catch (error) {
      next(error);
    }
  },
  validateCoupon: async (req, res, next) => {
    try {
      userId = req.session.userId;
      couponExist = await couponModel
        .findOne({ couponCode: req.body.couponId, users: userId })
        .lean();
      coupons = await couponModel
        .findOne({ couponCode: req.body.couponId })
        .lean();
      currentDate = new Date();

      if (coupons) {
        if (couponExist) {
          return res.json({ message: "used already" });
        }
        if (currentDate > coupons.expiryDate)
          return res.json({ message: "coupon expired" });

        if (Number(req.body.total) < Number(coupons.minAmount)) {
          return res.json({ message: "less than minimum" });
        }

        couponTotal = req.body.total - coupons.discountAmount;
        req.session.coupon = coupons;
        return res.json({ message: "succesfull", coupons, couponTotal });
      }
      return res.json({ message: "invalid coupon" });
    } catch (error) {
      next(error);
    }
  },
};
