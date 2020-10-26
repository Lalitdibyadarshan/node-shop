
const Product = require('../models/product.model');
const mongodb = require('mongodb');
const fileUtil = require('../utils/file');

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(imageUrl)
    if (!imageUrl) {
        return res.status(422).render('admin/add-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            formsCSS: true,
            productCSS: true,
            activeAddProduct: true,
            errorMessage: 'Attached file is not an image'
        })
    }
    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl.path.replace(/\\/g, '/'),
        description: description,
        userId: req.user._id
    });

    product.save()
        .then(result => {
            res.redirect('/admin/products');
        }).catch(err => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.render('admin/add-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            formsCSS: true,
            productCSS: true,
            activeAddProduct: true,
            errorMessage: null
        });
    } else {
        const productId = req.params.productId;
        Product.findById(productId)
            .then((product) => {
                if (!product) {
                    return res.redirect('/');
                }
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product',
                    path: '/admin/add-product',
                    product: product,
                    errorMessage: null
                });
            })
            .catch(err => console.log(err)); 
    }
};

exports.postEditProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = { ...req.body};
    // const updatedProduct = new Product(title, imageUrl, description, price, new mongodb.ObjectId(req.params.productId));
    Product.findById(req.params.productId).then(product => {
        if (!product.userId.equals(req.user._id)) {
            return res.redirect('/');
        }
        fileUtil.deleteFile(product.imageUrl);
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;
        product.userId = req.user._id;
        product.save().then(res => {
            updatedProduct.save();
            res.redirect('/admin/products');
        });
    });
};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    Product.findById(req.params.productId)
        .then(product => {
            if (!product) {
                //throw err
            }
            fileUtil.deleteFile(product.imageUrl);
            return Product.deleteOne({_id: req.params.productId, userId: req.user._id});
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}