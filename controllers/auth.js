const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const mailer = require('../utils/mail');
const crypto = require('crypto');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    res.render('auth/login', {
        path: '/auth/login',
        pageTitle: 'login',
        errorMessage: message.length > 0 ? message[0] : null
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/auth/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    return res.redirect('/auth/login');
                }).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    res.render('auth/signup', {
        path: '/auth/signup',
        pageTitle: 'Sign up',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: message.length > 0 ? message[0] : null
    });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.cpassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email is already in use, please pick another one');
                return res.redirect('/auth/signup');
            }
            return bcrypt.hash(password, 12)
                .then((hashedPassword) => {
                    const user = new User({
                        name: 'lalit',
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(res => {
                    return mailer.sendMail(email, { subject: 'sign up successfull', body: 'Welcome to Node shop'});
                })
                .then(result => {
                    res.redirect('/auth/login');
                });
        }).catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    res.render('auth/reset-password', {
        path: '/auth/reset',
        pageTitle: 'Reset Password',
        errorMessage: message.length > 0 ? message[0] : null
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            res.redirect('/auth/reset');        
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                console.log(user)
                if(!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/auth/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                mailer.sendMail(req.body.email, { 
                    subject: 'Password reset', 
                    body: `
                        <p>You requested a password reset</p>
                        <p>Click on this <a href="http://localhost:3000/auth/create-password/${token}">link</a> to set a new password</p>
                        `
                })
            })
            .catch(err => {
                console.log(err);
            });
    });
}

exports.createNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: { $gt: Date.now() }})
        .then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found.');
                return res.redirect('/auth/reset');
            }
            let message = req.flash('error');
            res.render('auth/new-password', {
                path: '/auth/create-password',
                pageTitle: 'Create Password',
                errorMessage: message.length > 0 ? message[0] : null,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/auth/login');
        })
        .catch(err => console.log(err));

}