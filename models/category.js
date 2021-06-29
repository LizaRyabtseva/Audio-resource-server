const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const categorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    }]
});

module.exports = mongoose.model('Category', categorySchema);