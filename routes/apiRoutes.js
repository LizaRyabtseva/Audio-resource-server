const express = require('express');
const apiControllers = require('../controllers/apiControllers');
const {check} = require('express-validator');

const router = express.Router();

router.get('/songs', apiControllers.getSongs);

router.get('/songs/:songId', apiControllers.getSong);

router.post('/comment/:songId', [
    check('text')
        .trim()
        .toLowerCase()
        .not().isEmpty()
], apiControllers.postComment);

router.get('/categories', apiControllers.getCategories);

router.get('/categories/:categoryId', apiControllers.getCategory);

router.post('/search', [check('title')
    .trim()
    .toLowerCase()
    .not().isEmpty()
], apiControllers.search);

module.exports = router;