const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    songId: {
        type: Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    }
});


module.exports = mongoose.model('Comment', commentSchema);