const config = require('config');
const User = require('../models/user');
const Playlist = require('../models/playlist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require("../models/http-error");
const {validationResult} = require('express-validator'); //использовать для проверки валидации


exports.postSignup = async (req, res, next) => {
    const { name, email, password } = req.body;

    let userDoc;
    try {
        userDoc = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Произошла ошибка при поиске пользователя', 500);
        return next(error);
    }

    if (userDoc) {
        const error = new HttpError('Пользователь уже существует!', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Произошла ошибка!", 500);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword
    });

   try {
       const playlist = new Playlist({
           title: 'Мне нравится',
           userId: createdUser._id
       });
       await playlist.save();
       await createdUser.save();
       await User.findByIdAndUpdate(createdUser._id, {$push: {playlists: playlist._id}});
   } catch (err) {
        const error = new HttpError('Регистрация провалилась!', 500);
        console.log(err);
        return next(error);
   }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'secret-key',
            { expiresIn: "1h" }
        );
    } catch (err) {
        const error = new HttpError('Регистрация провалилась!', 500);
        return next(error);
    }

    res.status(201).json({
        userId: createdUser.id,
        role: createdUser.role,
        token: token
    });

};


exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    let userDoc;

    try {
        userDoc = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Произошла ошибка на сервере: ' + err, 500));
    }

    if (!userDoc) {
        return next(new HttpError('Неверные данные!', 401));
    }

    if (userDoc.isBanned === true) {
        return next(new HttpError('Вы были забанены!', 403));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, userDoc.password);
    } catch (err) {
        return next(new HttpError('Неверные данные!', 401));
    }
    if (!isValidPassword) {
        return next(new HttpError('Неверные данные!', 401));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: userDoc.id, email: userDoc.email },
            'secret-key', { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('Произошла ошибка на сервере: ' + err, 500);
        return next(error);
    }

    res.status(200).json({
        userId: userDoc.id,
        email: userDoc.email,
        token: token,
        role: userDoc.role
    });
};