const bannerModel = require("../modal/bannerschema");
const productModel = require("../modal/productschema");
const fs = require("fs");

module.exports = {
  bannerTable: async (req, res, next) => {
    try {
      let bannerData = await bannerModel.find().populate("product").lean();
      res.render("admin/bannerTable", { layout: "admin-layout", bannerData });
    } catch (error) {
      next(error);
    }
  },
  renderaddbanner: async (req, res, next) => {
    try {
      let productData = await productModel.find().lean();
      res.render("admin/addbanner", { layout: "admin-layout", productData });
    } catch (error) {
      next(error);
    }
  },
  addbanner: async (req, res, next) => {
    try {
      req.body.image = req.file.filename;
      await bannerModel.create(req.body);
      res.redirect("/admin/bannerTable");
    } catch (error) {
      next(error);
    }
  },
  vieweditbanner: async (req, res, next) => {
    try {
      let bannerId = req.params.id;
      let productData = await productModel.find().lean();
      let bannerData = await bannerModel
        .findOne({ _id: bannerId })
        .populate("product")
        .lean();
      res.render("admin/editbanner", {
        layout: "admin-layout",
        productData,
        bannerData,
      });
    } catch (error) {
      next(error);
    }
  },
  editbanner: async (req, res, next) => {
    try {
      let bannerId = req.params.id;
      console.log("req.body from edit banenr", req.body);
      console.log("image from edit banner:", req.file);
      if (req.file) {
        imagePath = await bannerModel.findOne(
          { _id: req.params.id },
          { _id: 0, image: 1 }
        );
        fs.unlinkSync("public/bannerImages/" + imagePath.image);
        req.body.image = req.file.filename;
        await bannerModel.findOneAndUpdate(
          { _id: req.params.id },
          { image: req.body.image }
        );
      }
      if (req.body.productId) {
        await bannerModel.findOneAndUpdate(
          { _id: req.params.id },
          { productId: req.body.productId }
        );
      }
      if (req.body.heading) {
        await bannerModel.findOneAndUpdate(
          { _id: req.params.id },
          { heading: req.body.heading }
        );
      }
      if (req.body.subHeading) {
        await bannerModel.findOneAndUpdate(
          { _id: req.params.id },
          { subHeading: req.body.subHeading }
        );
      }
      if (req.body.product) {
        await bannerModel.findOneAndUpdate(
          { _id: req.params.id },
          { product: req.body.product }
        );
      }

      res.redirect("/admin/bannerTable");
    } catch (error) {
      next(error);
    }
  },
  deletebanner: async (req, res, next) => {
    try {
      let bannerId = req.params.id;
      imagePath = await bannerModel.findOne(
        { _id: bannerId },
        { _id: 0, image: 1 }
      );
      fs.unlinkSync("public/bannerImages/" + imagePath.image);
      await bannerModel.findOneAndDelete({ _id: bannerId });
      res.redirect("/admin/bannerTable");
    } catch (error) {
      next(error);
    }
  },
};
