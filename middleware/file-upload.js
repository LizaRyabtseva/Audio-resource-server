const multer = require('multer');
const uuid = require('uuid');

const MIME_TYPES = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'audio/mpeg': 'mp3'
};


const fileUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.mimetype === 'audio/mpeg') {
                cb(null, 'uploads/audio');
            } else {
                cb(null, 'uploads/images');
            }
        },
        filename: (req, file, cb) => {
            const type = MIME_TYPES[file.mimetype];
            cb(null, uuid.v1() + '_' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPES[file.mimetype];
        let error = isValid ? null : new Error('Invalid mime type!');
        cb(error, isValid);
    }
});

module.exports = fileUpload;