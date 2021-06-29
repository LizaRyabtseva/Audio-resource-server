const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const playlistSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type:Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imgUrl: {
        type: String,
        required: true,
        default: 'uploads/images/playlist.jpg'
    },
    songs: [{
        type:Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    }]
});


module.exports = mongoose.model('Playlist', playlistSchema);