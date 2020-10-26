// const mongoDb = require('mongodb');
// const getDb = require('../utils/database').getDb;
const mongoose = require('mongoose');
const helper = require('../helper/helpers');
const path = require('path');
const Cart = require('./cart.model');
const dataFilePath = path.join(helper.rootPath, 'data', 'products.json');
const Schema = require('mongoose').Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);

// module.exports = class Product {
//     constructor(title, imageUrl, description, price, id, userId) {
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.price = price;
//         this._id = id;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dbOps;
//         if (this._id) {
//             dbOps = db.collection('products').updateOne({ _id: this._id}, { $set: this });
//         } else {
//             dbOps = db.collection('products').insertOne(this);
//         }
//         return dbOps
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     // save() {
//     //     if (this.id) { //   update existing product
//     //         helper.readFromFile(dataFilePath, (products) => {
//     //             const existingProductIndex = products.findIndex(prod => prod.id === this.id);
//     //             if (products[existingProductIndex]) {
//     //                 const updatedProducts = [...products];
//     //                 updatedProducts[existingProductIndex] = this;
//     //                 helper.writeToFile(dataFilePath, updatedProducts, (err) => console.log(err))
//     //             }
//     //         });
//     //     } else { //    create a new product
//     //         this.id = getRandomArbitrary(1,100) + 'BK' + getRandomArbitrary(100, 1000);
//     //         helper.readFromFile(dataFilePath, (products) => {
//     //             products.push(this);
//     //             helper.writeToFile(dataFilePath, products, (err) => {
//     //                 console.log(err);
//     //             });
//     //         }, []);
//     //     }
//     // }

//     static deleteById(id) {
//         Product.fetchAll((products) => {
//             const filteredProducts = products.filter(prod => prod.id !== id);
//             Cart.deleteProduct(id, true);
//             helper.writeToFile(dataFilePath, filteredProducts, err => console.log(err));
//         });
//     }

//     static deleteByIdV2(id) {
//         const db = getDb();
//         return db.collection('products').deleteOne({ _id: new mongoDb.ObjectId(id) });
//     }

//     static fetchAll(cb) {
//         helper.readFromFile(dataFilePath, cb, []);
//     }

//     static fetchAllV2() {
//         return getDb().collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 console.log('product.model.js: 68', products)
//                 return products;
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }

//     static fetchById(id, cb) {
//         Product.fetchAll((products) => {
//             cb(products.find(p => p.id === id));
//         });
//     }

//     static fetchByIdV2(id) {
//         return getDb().collection('products')
//             .find({ _id: new mongoDb.ObjectId(id) })
//             .next()
//             .then(product => {
//                 console.log('product.model.js: 87', product)
//                 return product;
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }
// }
