const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    isBanned: {
        type: Boolean,
        required: true,
        default: false
    },
    playlists: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true,
    }]
});

userSchema.methods.addPlaylist = function (playlist) {
    const updatedPlaylists = [...this.playlists];
    updatedPlaylists.push({
        playlistId: playlist._id
    });
    this.playlists = updatedPlaylists;
    return this.save();
}

module.exports = mongoose.model('User', userSchema);