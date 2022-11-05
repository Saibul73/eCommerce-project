module.exports = {
    totalAmount: (cartdata) => {console.log(cartdata.products.productId,"41564169TTTT")
        total = cartdata.products.reduce((acc, curr) =>{
            acc += (curr.productId.amount - curr.productId.discount) * curr.quantity;
            return acc;
        }, 0);
        console.log(total)
        return total;
    }
}