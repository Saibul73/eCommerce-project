const wishlistModel = require("../modal/wishlistschema");

async function getwishcount(req, res) {
  let user = req.session.user;
  let wishCount = 0;
  if (user) {
    let wishlist = await wishlistModel.findOne({ userId: user._id }).lean();
    if (wishlist) {
      wishCount = wishlist.products.length;
    }
  }
  return wishCount;
}

module.exports = getwishcount;
