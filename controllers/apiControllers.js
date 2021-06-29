const Song = require('../models/song');
const User = require('../models/user');
const Category = require('../models/category');
const Comment = require('../models/comment');

const HttpError = require('../models/http-error');

exports.getSongs = async (req, res, next) => {
    try {
        const songs = await Song.find().populate('categoryId');

        res.status(200).json({songs: songs.map(s => {
                return {
                    title: s.title,
                    artist: s.artist,
                    imgUrl: s.imgUrl,
                    songUrl: s.songUrl,
                    category: s.categoryId.title,
                    _id: s._id
                }}),
            message: 'Все песни найдены!'});
    } catch (err) {
        throw new HttpError(err);
    }
};

exports.getSong = async (req, res, next) => {
    const {songId} = req.params;

    try {
        const song = await Song.findById(songId).populate('categoryId');
        const comments = await Comment.find({songId}).populate('userId');
        await Song.findOneAndUpdate({_id: songId}, {countPreviews: song.countPreviews + 1});
        res.status(200).json({song: {
                _id: song._id,
                title: song.title,
                artist: song.artist,
                category: song.categoryId.title,
                imgUrl: song.imgUrl,
                songUrl: song.songUrl,
                likes:song.countLikes,
                previews: song.countPreviews,
                comments: comments.map(c => {
                    return {
                        id: c._id,
                        text: c.text,
                        user: c.userId.name,
                        year: c.date.getFullYear(),
                        month: c.date.getMonth() + 1,
                        day: c.date.getDate(),
                        hour: c.date.getHours(),
                        minutes: c.date.getMinutes()
                    }
                })
        }, message: 'Песня найдена!'});
    } catch (err) {
        throw new HttpError(err);
    }

};

exports.postComment = async (req, res, next) => {
    const {text, date, userId} = req.body;
    const {songId} = req.params;
    let userDoc;
    try {
        userDoc = User.findById(userId);
    } catch (err) {
        throw new HttpError(err);
    }
    if (!userDoc) {
        return next(new HttpError('Пользователь не найден!', 401));
    }

    try {
        const comment = new Comment({
            text,
            date,
            userId,
            songId
        });
        await comment.save();
        await Song.findByIdAndUpdate(songId, {$push: {comments: comment._id}});
        res.status(201).json({comment: {
                id: comment._id,
                text: comment.text,
                user: userDoc.name,
                year: comment.date.getFullYear(),
                month: comment.date.getMonth() + 1,
                day: comment.date.getDate(),
                hour: comment.date.getHours(),
                minutes: comment.date.getMinutes()
            }, message: 'Комментарий сохранен!'});
    } catch (err) {
        throw new HttpError(err);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({categories: categories.map(c => {return {title: c.title, _id: c._id}}), message: 'Все категории найдены!'});
    } catch (err) {
        throw new HttpError(err);
    }
};

exports.getCategory = async (req, res, next) => {
    const {categoryId} = req.params;

    let category;
    try {
        category = await Category.findById(categoryId);
    } catch (err) {
        throw new HttpError(err);
    }

    if (!category) {
        return next(new HttpError('Категория не найдена!', 401));
    }
    let songs;
    try {
        songs = await Song.find({categoryId});
    } catch (err) {
        throw new HttpError(err);
    }

    res.status(200).json({
        category: category.title, songs,
        message: 'Все песни из категории найдены!'
    });
};

exports.search = async (req, res, next) => {
    const {title} = req.body;

    let songs;

    try {
        songs = await Song.find({title}).populate('categoryId');
        songs = songs.map(s => {return {
            title: s.title,
            artist: s.artist,
            category: s.categoryId.title,
            imgUrl: s.imgUrl,
            songUrl: s.songUrl,
            _id: s._id}});
        res.status(200).json({songs, message: 'Песни найдены!'});
    } catch (err) {
        return next(new HttpError(err));
    }
}