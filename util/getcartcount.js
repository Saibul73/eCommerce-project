const cartModel = require("../modal/cartschema");

async function getcartcount(req, res) {
  let user = req.session.user;
  let cartCount = 0;
  if (user) {
    let cart = await cartModel.findOne({ userId: user._id }).lean();
    if (cart) {
      cartCount = cart.products.length;
    }
  }
  return cartCount;
}

module.exports = getcartcount;
