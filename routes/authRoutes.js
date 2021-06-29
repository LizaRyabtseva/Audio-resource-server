const express = require('express');
const {check} = require('express-validator');

const authController= require('../controllers/authControllers');
const User = require('../models/user');

const router = express.Router();

router.post('/signup',[
    check('name')
        .trim()
        .toLowerCase()
        .isLength({min: 2}),
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .custom((val, {req}) => {
            return User.findOne({email: val})
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Эта электронная почта уже используется, попробуйте другую.')
                    }
                })
        }),
    check('password')
        .trim()
        .isLength({min: 6})
], authController.postSignup);

//post /auth/login
router.post('/login', [
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail(),
    check('password')
        .trim()
        .isLength({min: 6}),
], authController.postLogin);


module.exports = router;