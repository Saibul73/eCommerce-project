

module.exports = {
    totalAmount: (cartdata) => {
        total = cartdata.products.reduce((acc, curr) => {
            acc += (curr.productId.price - curr.productId.discount) * curr.quantity;
            return acc;
        }, 0);
        return total;
    }
}