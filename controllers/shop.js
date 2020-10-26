const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.getProducts = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All products',
				path: '/shop/products',
				hasProducts: products.length > 0,
				activeShop: true,
				productCSS: true
			});
		})
		.catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
	req.user
	.populate('cart.items.productId')
	.execPopulate()
	.then(user => {
		let products = user.cart.items.length ? user.cart.items : null;
		const totalPrice = products ? parseFloat(products.reduce((prev, cur) => prev + (cur.productId.price * cur.quantity), 0)).toFixed(2) : 0;
		res.render('shop/cart', {
				pageTitle: 'Cart',
				path: '/shop/cart',
				productCSS: true,
				products: products,
				totalPrice: totalPrice
			});
	});
	// Cart.getCart((cart) => {
	// 	if (!cart) {
	// 		res.render('shop/cart', {
	// 			pageTitle: 'Cart',
	// 			path: '/shop/cart',
	// 			productCSS: true,
	// 			products: null
	// 		});
	// 	} else {
	// 		Product.fetchAll((products) => {
	// 			const productsInCart = [];
	// 			products.forEach(prod => {
	// 				const findProdInCart = cart.products.find(cartProd => cartProd.id === prod.id);
	// 				if (findProdInCart) {
	// 					productsInCart.push({ productData: prod, qty: findProdInCart.qty})
	// 				}
	// 			})
	// 			res.render('shop/cart', {
	// 				pageTitle: 'Cart',
	// 				path: '/shop/cart',
	// 				productCSS: true,
	// 				products: productsInCart,
	// 				totalPrice: cart.totalPrice
	// 			});
	// 		});
	// 	}
	// })
}

exports.postCart = (req, res, next) => {
	const id = req.body.productId;
	Product.findById(id)
		.then((product) => {
			req.user.addToCart(product).then(() => {
				res.redirect('/shop/cart');
			});
			// Cart.addProduct(id, product.price);
		})
		.catch(err => console.log(err));
};

exports.deleteFromCart = (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.then((product) => {
			req.user.deleteFromCart(product).then(() => {
				res.redirect('/shop/cart');
			});
			// Cart.addProduct(id, product.price);
		})
		.catch(err => console.log(err));
	// Cart.deleteProduct(id);
	// res.redirect('/shop/cart');
};

exports.getIndex = (req, res, next) => {
	Product.find()
	.then(products => {
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/'
		});
	})
	.catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user._id })
		.then(orders => {
			console.log(orders)
			res.render('shop/orders', {
				path: '/shop/orders',
				pageTitle: 'Your Orders',
				orders: orders
			});
		});
};

exports.postOrder = (req, res, next) => {
	req.user
	.populate('cart.items.productId')
	.execPopulate()
	.then(user => {
		const products = user.cart.items.map(item => {
			return { quantity: item.quantity, productData: { ...item.productId._doc } };
		});
		const order = new Order({
			user: {
				name: req.user.name,
				userId: req.user // mongoose will pick the ID 
			},
			products: products
		});
		return order.save();
	})
	.then(res => req.user.clearCart())
	.then(result => {
		res.redirect('/shop/orders');
	})
	.catch(err => console.log(err));
  };

exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout'
	});
};

exports.getProductById = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			res.render('shop/product-detail', {
				path: '',
				pageTitle: `Details of ${product.title}`,
				product: product
			});
		})
		.catch(err => console.log(err));
}

exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	const invoiceName = 'invoice-' + orderId + '.pdf';
	const invoicePath = path.join('data', 'invoices', invoiceName);
	Order.findById(orderId)
		.then(order => {
			if (order && order.user.userId.equals(req.user._id)) {
				// fs.readFile(invoicePath, (err, data) => {
				// 	if (!err) {
				// 		res.header('content-type', 'application/pdf')
				// 		/**
				// 		 * header: content-disposition
				// 		 * value: attachment (will download the file)
				// 		 * value: inline (will open the file in browser)
				// 		 * 
				// 		 */
				// 		res.header('content-disposition', 'attachment; filename="' + invoiceName + '"');
				// 		res.send(data);
				// 	}
				// 	res.redirect('/shop/orders');
				// })
				// const file = fs.createReadStream(invoicePath);
				// file.pipe(res);
				const pdfDoc = new PDFDocument();
				pdfDoc.pipe(fs.createWriteStream(invoicePath));
				res.header('content-type', 'application/pdf');
				/**
				 * header: content-disposition
				 * value: attachment (will download the file)
				 * value: inline (will open the file in browser)
				 * 
				 */
				res.header('content-disposition', 'attachment; filename="' + invoiceName + '"');
				pdfDoc.pipe(res);
				pdfDoc.fontSize(26).text('Invoice', {
					underline: true
				});
				let totalPrice = 0;
				order.products.forEach(prod => {
					totalPrice += prod.quantity * prod.productData.price;
					pdfDoc.fontSize(18).text(`${prod.productData.title} - ${prod.quantity} x $${prod.productData.price}`);
				});
				pdfDoc.text('______________________________________');
				pdfDoc.fontSize(20).text('Grand Total: $' + totalPrice);
				pdfDoc.end();
			}
		});
}
