const Playlist = require('../models/playlist');
const User = require('../models/user');
const Song = require('../models/song');
const Category = require('../models/category');
const Comment = require('../models/comment');
const HttpError = require('../models/http-error');
const fs = require("fs");


exports.getCategory = async (req, res, next) => {
    const {categoryId}= req.params;
    try {
        const category = await Category.findById(categoryId);
        res.status(200).json({category: {title: category.title, _id: category._id}, message: 'Категория найдена!'});
    } catch (err) {
       return next('Категория не найдена!');
    }
}


exports.newCategory = async (req, res, next) => {
    const title = req.body.title;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    try {
        const categoryDoc = await Category.findOne({title: title});
        if (!categoryDoc) {
            const category = new Category({
                title
            });
            await category.save();
            res.status(201).json({message: 'Категория создана!'});
        } else {
            return next(new HttpError('Такая категория уже существует!', 401));
        }
    } catch(err) {
        return next(new HttpError('Произошла ошибка в создании категории!'));
    }
};

exports.updateCategory = async (req, res, next) => {
    const {title} = req.body;
    const {categoryId} = req.params;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    try {
        const categoryDoc = await Category.findOne({title})

        if (!categoryDoc) {
            await Category.findByIdAndUpdate(categoryId, {title});
            res.status(200).json({message: 'Категория изменена!'});
        } else {
            return next(new HttpError('Уже существует категория с таким названием!', 401));
        }
    } catch (err) {
        return next(new HttpError('Произошла ошибка при создании категории!'));
    }
};


exports.deleteCategory = async (req, res, next) => {
    const {categoryId} = req.params;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    try {
        const songs = await Song.find({categoryId: categoryId});

        for (const songDoc of songs) {
            if (songDoc.comments.length) {
                await Comment.deleteMany({_id: {$in: songDoc.comments}});
            }
            await Playlist.updateMany({}, {$pull: {songs: songDoc._id}});
            fs.unlink(songDoc.imgUrl, err => {
                if (err) console.log(err);
            });
            fs.unlink(songDoc.songUrl, err => {
                if (err) console.log(err);
            });
        }

        await Song.deleteMany({categoryId});
        await Category.findByIdAndDelete(categoryId);
        res.status(200).json({message: 'Категория удалена!'});
    } catch (err) {
        return next(new HttpError('Произошла ошибка при удалении категории!'));
    }
};

exports.getSong = async (req, res, next) => {
    const {songId} = req.params;
    try {
        const song = await Song.findById(songId);
        res.status(200).json({song: {title: song.title, artist: song.artist}, message: 'Песня найдена!'});
    } catch (err) {
        return next(new HttpError('Произошла ошибка при поиске песни!'));
    }
}


exports.postAddSong = async (req, res, next) => {
    const {title, artist, category} = req.body;
    const image = req.files.image[0].path.replace(/\\/g, '/');
    const audio = req.files.audio[0].path.replace(/\\/g, '/');

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    let categoryDoc;

    try {
        categoryDoc = await Category.findOne({title: category});
        console.log(categoryDoc + 'df');
    } catch (err) {
        return next(new HttpError('Ошибка при поиске категории!'));
    }


    if (categoryDoc) {
        try {
            const songDoc = await Song.findOne({title: title, artist: artist});
            if (!songDoc) {
                const song = new Song({
                    title,
                    artist,
                    imgUrl: image,
                    songUrl: audio,
                    categoryId: categoryDoc._id
                });
                await song.save();
                await Category.findByIdAndUpdate(categoryDoc._id, {$push: {songs: song._id}});
                res.status(201).json({message: 'Песня добавлена!'});
            } else {
                return next(new HttpError('Такая песня уже существует!', 401));
            }
        } catch (err) {
            return next(new HttpError('Произошла ошибка при создании песни!'));
        }
    } else {
        return next(new HttpError('Не существует такой категории!'));
    }

};

exports.updateSong = async (req, res, next) => {
    const {title, artist} = req.body;
    const {songId} = req.params;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    try {
        await Song.findByIdAndUpdate(songId, {
            title,
            artist
        });
        res.status(200).json({message: 'Песня изменена!'});
    } catch (err) {
        throw new HttpError('Произошла ошибка при изменении песни!');
    }
};

exports.deleteSong = async (req, res, next) => {
    const {songId} = req.params;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    try {
        const songDoc = await Song.findById(songId);
        await Category.findByIdAndUpdate(songDoc.categoryId, {$pull: {songs: songDoc._id}});
        fs.unlink(songDoc.imgUrl, err => {
            console.log(err);
        });
        fs.unlink(songDoc.songUrl, err => {
            console.log(err);
        });
        if (songDoc.comments.length) {
            await Comment.deleteMany({_id: {$in: songDoc.comments}});
        }
        await Playlist.updateMany({}, {$pull: {songs: songDoc._id}});
        await Song.findByIdAndDelete(songId);
        res.status(201).json({message: 'Песня удалена!'});
    } catch (err) {
        return next(new HttpError('Произошла ошибка при удалении песни!'));
    }
};

exports.getUsers = async (req, res, next) => {
    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    let users;
    try {
        users = await User.find();
    } catch (err) {
        return next(new HttpError('Произошла ошибка при поиске пользователей!'));
    }
    if (users) {
        res.status(200).json({
            users: users.map(u => {
                return {
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    isBanned: u.isBanned,
                    _id: u._id
                }
            }), message: 'Пользователи найдены!'});
    }
};

exports.getUser = async (req, res, next) => {
    const {userId} = req.params;
    console.log(userId);
    console.log(req.userData);
    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403));
    }

    let userDoc;
    try {
        userDoc = await User.findById(userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!' + err));
    }

    if (!userDoc) {
        return next(new HttpError('Пользователь не найден!'));
    }
    res.status(200).json({
        user: {
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            isBanned: userDoc.isBanned,
            _id: userDoc._id
        },
        message: 'Пользователь найден!'});
}

exports.updateUser = async (req, res, next) => {
    const {name, role} = req.body;
    const {userId} = req.params;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    let userDoc;
    try {
        userDoc = await User.findById(userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'))
    }
    if(!userDoc) {
        return next(new HttpError('Пользователя не существует!'))
    }

    try {
        await User.findByIdAndUpdate(userId, {
            name,
            role
        });
    } catch (err) {
        return next(new HttpError('Произошла ошибка в изменении пользователя!'))
    }

};

exports.banUser = async (req, res, next) => {
    const {userId, type } = req.body;
    console.log(userId);
    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Произошла ошибка в поиске пользователя!'));
    }
    if (!user) {
        return next(new HttpError('Пользователь не найден!'));
    }

    if (user.role !== 'admin') {
        return next(new HttpError('У вас нет доступа!', 403))
    }

    if (user._id.toString() === userId.toString() && type === 'ban') {
        const error = new HttpError('Нельзя забанить себя', 422);
        return next(error);
    }

    let bannedUser;
    try {
        bannedUser = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Произошла ошибка в поиске пользователя!');
        return next(error);
    }

    if (!bannedUser) {
        const error = new HttpError('Пользователя не существует', 404);
        return next(error);
    }

    if (type === 'ban') {
        bannedUser.isBanned = true;
        try {
            await bannedUser.save();
        } catch (err) {
            const error = new HttpError('Произошла ошибка!', 500);
            return next(error);
        }

        res.status(200).json({ message: "Пользователь забанен!" });
    }

    if (type === 'unban') {
        bannedUser.isBanned = false;
        try {
            await bannedUser.save();
        } catch (err) {
            const error = new HttpError('Произошла ошибка', 500);
            return next(error);
        }

        res.status(200).json({ message: 'Пользователь разбанен!' });
    }
}