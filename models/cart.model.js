const helper = require('../helper/helpers');
const path =  require('path');

const cartDataPath = path.join(
        helper.rootPath,
        'data',
        'cart.json'
    );

module.exports = class Cart {
    static addProduct(id, price) {
        let cart = { products: [], totalPrice: 0 };
        helper.readFromFile(cartDataPath, (cartData) => {
            let updatedProduct;
            const existingProductIndex = cartData.products.findIndex(prod => prod.id === id);
            const existingProduct = cartData.products[existingProductIndex];
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty += 1;
                cartData.products = [ ...cartData.products ];
                cartData.products[existingProductIndex] = updatedProduct;
            } else {
               updatedProduct = { id: id, qty: 1, unitPrice: price}; 
                cartData.products = [ ...cartData.products, updatedProduct ];
               console.log(cartData.products, updatedProduct)
            }
            cartData.totalPrice += +price;
            helper.writeToFile(cartDataPath, cartData, err => console.log(err));
        }, cart)
    }

    static deleteProduct(id, isNotAvailable) {
        helper.readFromFile(cartDataPath, (cartData) => {
            let updatedCart = {...cartData};
            if (updatedCart.products) {
                const productToBeRemovedIndex = updatedCart.products.findIndex(prod => prod.id === id);
                if (productToBeRemovedIndex !== -1) {
                    const productToBeRemoved = updatedCart.products[productToBeRemovedIndex];
                    if (isNotAvailable) {
                        updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                        updatedCart.totalPrice -= (productToBeRemoved.qty * productToBeRemoved.unitPrice);
                    } else {
                        if (productToBeRemoved.qty > 1) {
                            updatedCart.products[productToBeRemovedIndex].qty -= 1;
                        } else {
                            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                        }
                        updatedCart.totalPrice -= productToBeRemoved.unitPrice;
                    }
                    helper.writeToFile(cartDataPath, updatedCart, err => console.log(err));
                }
            }
        });
    }

    static getCart(cb) {
        helper.readFromFile(cartDataPath, cb, null);
    }
}