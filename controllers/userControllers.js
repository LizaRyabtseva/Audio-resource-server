const User = require('../models/user');
const Song = require('../models/song');
const Playlist = require('../models/playlist');
const HttpError = require('../models/http-error');

exports.getPlaylist = async (req, res, next) => {
    const {userId, playlistId} = req.params;

    let userDoc;
    try {
        userDoc = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err));
    }

    if (!userDoc) {
        return next(new HttpError('Не существует такого пользователя!', 400));
    }
    let playlistDoc;
    try {
        playlistDoc = await Playlist.findOne({userId, _id: playlistId});
    } catch (err) {
        return next(new HttpError(err));
    }
    if (!playlistDoc) {
        return next(new HttpError('Плейлист не найден!', 400));
    }

    let songs;
    try {
        songs = await Song.find({_id: playlistDoc.songs.map(s => s._id)}).populate('categoryId');
    } catch (err) {
         return next(new HttpError(err));
    }

    songs = songs.map(s => {return {
        title: s.title,
        artist: s.artist,
        category: s.categoryId.title,
        imgUrl: s.imgUrl,
        songUrl: s.songUrl,
        _id: s._id
    }})

    res.status(200).json({
        title: playlistDoc.title,
        songs
    });
};

exports.getPlaylists = async (req, res, next) => {
    const {userId} = req.params;

    let userDoc;
    try {
        userDoc = await User.findById(userId);
    } catch (err) {
         return next(new HttpError(err));
    }

    if (!userDoc) {
        return next(new HttpError('Пользователь не найден!', 401));
    }
    let playlists;
    try {
        playlists = await Playlist.find({userId});
        res.status(200).json({
            playlists: playlists.map(p => {return {
                title: p.title,
                imgUrl: p.imgUrl,
                _id: p._id
            }}),
            message: 'Все плейлисты найдены!'
        });
    } catch (err) {
         return next(new HttpError(err));
    }

};

exports.postLike = async (req, res, next) => {
    const {userId, songId} = req.body;
    let isLiked;
    try {
        const userDoc = await User.findById(userId);
        if (!userDoc) {
            return next(new HttpError('Пользователь не найден!', 401));
        }
    } catch (err) {
         return next(new HttpError(err));
    }
    let playlist;
    try {
        const song = await Song.findById(songId);
        playlist = await Playlist.findOne({userId, title: 'Мне нравится'});
        if (playlist.songs.findIndex(s => s == songId) === -1) {
            await Playlist.findOneAndUpdate({userId, title: 'Мне нравится'}, {$push: {songs: song._id}});
            await Song.findByIdAndUpdate(songId, {countLikes: song.countLikes + 1});
        } else {
            await Playlist.findOneAndUpdate({userId, title: 'Мне нравится'}, {$pull: {songs: song._id}});
            await Song.findByIdAndUpdate(songId, {countLikes: song.countLikes - 1});
        }

    } catch (err) {
         return next(new HttpError(err));
    }

    try {
        playlist = await Playlist.findOne({userId, title: 'Мне нравится'});
        if (playlist.songs.findIndex(s => s == songId) === -1) {
            isLiked = false;
        } else {
            isLiked = true;
        }
        let message = `Песня добавлена в плейлист ${playlist.title}`;
        if (isLiked === false) {
            message = `Песня удлена из плейлиста ${playlist.title}`
        }
        res.status(201).json({isLiked, message: message});
    } catch (err) {
        return next(new HttpError(err));
    }

};

exports.newPlaylist = async (req, res, next) => {
    const {userId} = req.params;
    const {title} = req.body;
    const image = req.files.image[0].path.replace(/\\/g, '/');

    let userDoc;
    try {
        userDoc = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err));
    }

    if (!userDoc) {
        return next(new HttpError('Пользователь не найден!', 401));
    }

    const playlist = new Playlist({
        title,
        userId: userDoc._id,
        imgUrl: image
    });

    try {
        await playlist.save();
    } catch (err) {
        return next(new HttpError(err));
    }

    try {
        await User.findByIdAndUpdate(userId, {$push: {playlists: playlist._id}});
    } catch (err) {
        return next(new HttpError(err));
    }
    res.status(201).json({message: 'Плейлист создан!'});
 };

exports.deletePlaylist = async (req, res, next) => {
    const {userId, playlistId} = req.params;

    let playlistDoc;
    try {
        playlistDoc = await Playlist.findById(playlistId);
    } catch (err) {
        return next(new HttpError(err));
    }

    if (!playlistDoc) {
        return next(new HttpError('Плейлист не найден!', 401));
    }

    try {
        await User.updateOne({}, { $pull: { playlists: playlistId } });
        await Playlist.findByIdAndDelete(playlistId);
        res.status(200).json({message: 'Плейлист удален!'});
    } catch (err) {
        return next(new HttpError(err));
    }
};

exports.postSong = async (req, res, next) => {
    const {userId, songId, playlistId} = req.body;
    let userDoc;
    try {
        userDoc = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err));
    }

    if (!userDoc) {
        return next(new HttpError('Пользователь не найден!', 401));
    }

    try {
        const songDoc = await Song.findById(songId);
        await Playlist.findById(playlistId);
        await Playlist.findByIdAndUpdate(playlistId, {$push: {songs: songDoc._id}});
        res.status(201).json({message: 'Песня добавлена в плейлист!'});
    } catch (err) {
        return next(new HttpError(err));
    }

}