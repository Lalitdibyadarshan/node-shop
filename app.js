const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const adminRoute = require('./routes/admin.route');
const shopRoute = require('./routes/shop.route');
const authRoute = require('./routes/auth.route');

const errorController = require('./controllers/error');

// const database = require('./utils/database');
const mongoose = require('mongoose');

const User = require('./models/user.model');
const { createBrotliCompress } = require('zlib');

const MONGODB_URI = 'mongodb+srv://lalit:rXVxJia2GXCFQLSB@cluster0.keejz.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/[\/\\:.]/g, "_") + '_' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image')); // name of the field name

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(
    session({ secret: 'secret key', resave: false, saveUninitialized: false, store: store })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    console.log(req.session)
    if (req.session.isLoggedIn) {
        User.findById(req.session.user._id)
            .then((user) => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err));
    } else {
        next();
    }
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoute.router);
app.use('/shop', shopRoute.router);
app.use('/auth', authRoute.router)
app.get('/', (req, res, next) => {
    res.redirect('/shop');
});

app.use(errorController.get404);

// database.mongoConnect(() => {
//     app.listen(3000);
// })

mongoose.connect(MONGODB_URI)
    .then(() => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Lalit',
                    email: 'lalit@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch(err => console.log(err));