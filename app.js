const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = config.get('port') || 5000;

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

    next();
});



app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use('/uploads/audio', express.static(path.join('uploads', 'audio')));



app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/', authRoutes);

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        })
    }

    if (req.headersSent) {
        return next(error);
    }
    console.log(error);
    res.status(error.code || 500);
    res.json({ message: error.message || 'Произошла ошибка!' });
});


mongoose.connect(config.get('mongoUri'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(result => {
    app.listen(PORT, () => console.log('DB is connected'));
}).catch(err => {
    console.log('Server error!!', err.message);
    process.exit(1);
});
