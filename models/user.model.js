// const getDb = require('../utils/database').getDb;
// const mongoDb = require('mongodb');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: { type : schema.Types.ObjectId, ref: 'Product' ,required: true },
                quantity: { type: String, required: true }
            } 
        ]
    },
    resetToken: String,
    resetTokenExpiration: Date
});

userSchema.methods.addToCart = function (product) {
    let updatedCart = {};
    if (this.cart) {
        const updatedCartItems = [...this.cart.items];
        const cartProductIndex = getCartProductIndex(this.cart.items, product); 
        (cartProductIndex > -1) ?
            // increase the product quantity
            (updatedCartItems[cartProductIndex].quantity = +this.cart.items[cartProductIndex].quantity + 1) :
            // add new product to the cart
            updatedCartItems.push({productId: product._id, quantity: 1});
        updatedCart.items = updatedCartItems;
    } else {
        updatedCart = { items: [{productId: product._id, quantity: 1}] };
    }

    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteFromCart = function(product) {
    let updatedCartItems = [ ...this.cart.items ];
    const cartProductIndex = getCartProductIndex(this.cart.items, product);
    if (updatedCartItems[cartProductIndex].quantity > 1 ) {
        updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity - 1;
    } else {
        updatedCartItems = updatedCartItems.filter(item => !item.productId.equals(product._id));
    }
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);




// module.exports = class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         db.collections('users').insertOne(this);
//     }

//     addToCart(product) {
//         let updatedCart;
//         if (this.cart) {
//             updatedCart = {...this.cart};
//             const updatedCartItems = [...this.cart.items];
//             const cartProductIndex = getCartProductIndex(this.cart.items, product); 
//             (cartProductIndex > -1) ?
//                 // increase the product quantity
//                 (updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1) :
//                 // add new product to the cart
//                 updatedCartItems.push({productId: product._id, quantity: 1});
//             updatedCart.items = updatedCartItems;
//         } else {
//             updatedCart = { items: [{productId: product._id, quantity: 1}] };
//         }
//         console.log(JSON.stringify(updatedCart))
//         const db = getDb();
//         return db.collection('users').updateOne({_id: new mongoDb.ObjectId(this._id)}, { $set: {cart: updatedCart}});
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart ? this.cart.items.map(item => item.productId) : [];
//         return db.collection('products')
//             .find({ _id: {$in : productIds}})
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(i => i.productId.equals(product._id)).quantity
//                     };
//                 })
//             });
//     }

//     deleteFromCart(product) {
//         const updatedCart = { ...this.cart};
//         let updatedCartItems = [ ...updatedCart.items ];
//         const cartProductIndex = getCartProductIndex(this.cart.items, product);
//         const db = getDb();
//         if (updatedCartItems[cartProductIndex].quantity > 1 ) {
//             updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity - 1;
//         } else {
//             updatedCartItems = updatedCartItems.filter(item => !item.productId.equals(product._id));
//         }
//         updatedCart.items = updatedCartItems;
//         return db.collection('users').updateOne({_id: new mongoDb.ObjectId(this._id)}, { $set: {cart: updatedCart}});
//     }

//     placeOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: this._id,
//                         name: this.name
//                     },
//                     timestamp: (new Date()).toISOString() 
//                 };
//                 return db.collection('orders')
//                     .insertOne(order);
//             })
//             .then(res => {
//                 this.cart = { items: [] };
//                 return db.collection('users')
//                     .updateOne(
//                         {_id: new mongoDb.ObjectId(this._id)}, { $set: {cart: this.cart}}
//                     );
//             });
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders')
//             .find({ 'user._id': this._id})
//             .toArray();
//     } 

//     static findByID(userId) {
//         const db = getDb();
//         return db.collection('users')
//         .find({ _id: new mongoDb.ObjectId(userId) })
//         .next()
//         .then(user => {
//             console.log('user.model 21',user)
//             return user;
//         })
//         .catch(err => {
//             console.log(err);
//         })  
//     }
// }

function getCartProductIndex(cartItems, product) {
    return cartItems.findIndex(cp => {
        return cp.productId.equals(product._id);
    });
}