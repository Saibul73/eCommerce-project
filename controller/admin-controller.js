const adminModel = require("../modal/adminschema");
const productModel = require("../modal/productschema");
const usersModel = require("../modal/userschema");
const categoryModel = require("../modal/categoryschema");
const orderModel = require("../modal/orderSchema");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

module.exports = {
  loginPage: async (req, res, next) => {
    try {
      if (req.session.adminLogin) return res.redirect("/admin/dash");
      res.render("admin/login", { layout: false });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  dashboard: async (req, res, next) => {
    try {
      let delivered = await orderModel
        .find({ status: "delivered" }, { status: 1, _id: 0 })
        .lean();
      let deliveredCount = delivered.length;
      let shipped = await orderModel
        .find({ status: "shipped" }, { status: 1, _id: 0 })
        .lean();
      let shippedCount = shipped.length;
      let cancelled = await orderModel
        .find({ status: "cancelled" }, { status: 1, _id: 0 })
        .lean();
      let cancelledCount = cancelled.length;
      let placed = await orderModel
        .find({ status: "placed" }, { status: 1, _id: 0 })
        .lean();
      let placedCount = placed.length;

      let orderData = await orderModel
        .find()
        .populate("products.productId")
        .lean();
      const deliveredOrder = orderData.filter((e) => e.status == "delivered");
      const TotalRevenue = deliveredOrder.reduce(
        (accr, crr) => accr + crr.grandTotal,
        0
      );
      const eachDaySale = await orderModel
        .aggregate([
          { $match: { status: "delivered" } },
          {
            $group: {
              _id: {
                day: { $dayOfMonth: "$createdAt" },
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              total: { $sum: "$grandTotal" },
            },
          },
        ])
        .sort({ _id: 1 });
      let today = new Date();

      res.render("admin/dashboard", {
        layout: "admin-layout",
        deliveredCount,
        shippedCount,
        cancelledCount,
        placedCount,
        today,
        TotalRevenue,
        eachDaySale,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  adminLogin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      console.log(email + password);
      const admin = await adminModel.findOne({ email: email }).lean();
      var correct = await bcrypt.compare(password, admin.password);
      if (email == "admin@gmail.com" && correct) {
        req.session.adminLogin = true;
        console.log(req.session.adminLogin);
        res.redirect("/admin/dash");
      }
    } catch (error) {
      next(error);
    }
  },

  getProduct: async (req, res, next) => {
    try {
      const productData = await productModel.find().populate("category").lean();
      res.render("admin/products", { layout: "admin-layout", productData });
    } catch (error) {
      next(error);
    }
  },

  renderaddProduct: async (req, res, next) => {
    try {
      const categorydata = await categoryModel.find().lean();
      res.render("admin/add-product", { layout: "admin-layout", categorydata });
    } catch (error) {
      next(error);
    }
  },

  addProduct: async (req, res, next) => {
    try {
      const productnames = await productModel
        .findOne({ name: req.body.name })
        .lean();
      if (productnames) return res.send("product already exists");
      const arrImages = req.files.map((value) => value.filename);
      req.body.imagepath = arrImages;
      await productModel.create(req.body);
      res.redirect("/admin/products");
    } catch (error) {
      next(error);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      imagepath = await productModel.findOne(
        { _id: req.body.product },
        { imagepath: 1, _id: 0 }
      );
      imagepath.imagepath.map((i) =>
        fs.unlinkSync(
          path.join(__dirname, "..", "public", "product_uploads", i)
        )
      );
      await productModel.findOneAndDelete(
        { _id: req.body.product },
        {
          $set: {
            name: req.body.name,
            brandName: req.body.brandName,
            description: req.body.description,
            category: req.body.category,
            stock: req.body.stock,
            amount: req.body.amount,
            discount: req.body.discount,
            imagepath: req.body.imagepath,
          },
        }
      );
      res.json({});
    } catch (error) {
      next(error);
    }
  },
  rendereditProduct: async (req, res, next) => {
    try {
      let productId = req.params.id;
      let productData = await productModel
        .findOne({ _id: productId })
        .populate("category")
        .lean();
      console.log(productData, "koooou");
      let categoryData = await categoryModel.find().lean();
      res.render("admin/editproduct", {
        layout: "admin-layout",
        productData,
        categoryData,
      });
    } catch (error) {
      next(error);
    }
  },
  editproduct: async (req, res, next) => {
    try {
      let arrImages = req.files.map((value) => value.filename);
      if (arrImages[0]) {
        imagepath = await productModel
          .findOne({ _id: req.params.id }, { imagepath: 1, _id: 0 })
          .lean();
        imagepath.imagepath.map((i) =>
          fs.unlinkSync(
            path.join(__dirname, "..", "public", "product_uploads", i)
          )
        );
        req.body.imagepath = arrImages;
        await productModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              name: req.body.name,
              brandName: req.body.brandName,
              description: req.body.description,
              category: req.body.category,
              stock: req.body.stock,
              price: req.body.price,
              discount: req.body.discount,
              imagepath: req.body.imagepath,
            },
          }
        );
      } else {
        await productModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              name: req.body.name,
              brandName: req.body.brandName,
              description: req.body.description,
              category: req.body.category,
              stock: req.body.stock,
              price: req.body.price,
              discount: req.body.discount,
            },
          }
        );
      }
      res.redirect("/admin/products");
    } catch (error) {
      next(error);
    }
  },
  userdata: async (req, res, next) => {
    try {
      const userdetails = await usersModel.find().lean();
      res.render("admin/users", { layout: "admin-layout", userdetails });
    } catch (error) {
      next(error);
    }
  },
  userBlock: async (req, res, next) => {
    try {
      let userId = req.params.id;
      await usersModel.updateOne({ _id: userId }, { block: true });
      res.redirect("/admin/users");
    } catch (error) {
      next(error);
    }
  },
  userUnblock: async (req, res, next) => {
    try {
      let userId = req.params.id;
      await usersModel.updateOne({ _id: userId }, { block: false });
      res.redirect("/admin/users");
    } catch (error) {
      next(error);
    }
  },
  renderaddcategory: (req, res, next) => {
    try {
      res.render("admin/add_category", { layout: "admin-layout" });
    } catch (error) {
      next(error);
    }
  },
  createcategory: async (req, res, next) => {
    try {
      let categoryexist = await categoryModel
        .findOne({ category: req.body.category })
        .lean();
      if (categoryexist) {
        return res.send("category already exist");
      }
      await categoryModel.create(req.body);
      res.redirect("/admin/categorytable");
    } catch (error) {
      next(error);
    }
  },
  categorytable: async (req, res, next) => {
    try {
      let categorydata = await categoryModel.find().lean();
      res.render("admin/categorytable", {
        layout: "admin-layout",
        categorydata,
      });
    } catch (error) {
      next(error);
    }
  },
  rendereditcategory: (req, res, next) => {
    try {
      const categoryId = req.params.id;
      res.render("admin/editcategory", { layout: "admin-layout", categoryId });
    } catch (error) {
      next(error);
    }
  },
  editcategory: async (req, res, next) => {
    try {
      await categoryModel.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { category: req.body.category } }
      );
      res.redirect("/admin/categorytable");
    } catch (error) {
      next(error);
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      await categoryModel.deleteOne({ _id: req.params.id });
      res.redirect("/admin/categorytable");
    } catch (error) {
      next(error);
    }
  },
  salesReport: async (req, res, next) => {
    try {
      let data = await orderModel
        .find({ status: "delivered" })
        .populate("products.productId")
        .lean();
      res.render("admin/SalesReport", { data, layout: false });
    } catch (error) {
      next(error);
    }
  },
  logout: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect("/admin");
    } catch (error) {
      next(error);
    }
  },
};
