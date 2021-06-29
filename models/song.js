const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const songSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    songUrl: {
        type: String,
        required: true
    },
    countPreviews: {
        type: Number,
        required: true,
        default: 0
    },
    countLikes : {
        type: Number,
        required: true,
        default: 0,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    }]
});

module.exports = mongoose.model('Song', songSchema);