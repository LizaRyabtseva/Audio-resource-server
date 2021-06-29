const express = require('express');
const {check} = require('express-validator');
const fileUpload = require('../middleware/file-upload');
const isAuth = require('../middleware/isAuth');

const adminController = require('../controllers/adminControllers');

const router = express.Router();


router.get('/categories/:categoryId', adminController.getCategory);

router.get('/songs/:songId', adminController.getSong);

router.use(isAuth);

router.post('/addCategory', [
    check('title')
        .trim()
        .toLowerCase()
        .not().isEmpty()
], adminController.newCategory);

router.patch('/updateCategory/:categoryId', [
    check('title')
        .trim()
        .toLowerCase()
        .not().isEmpty()
], adminController.updateCategory);

router.delete('/deleteCategory/:categoryId', adminController.deleteCategory);

router.post('/addSong', fileUpload.fields([
    {name: 'image', maxCount: 1}, { name: 'audio', maxCount: 1}]), [
    check('title')
        .trim()
        .toLowerCase()
        .not().isEmpty(),
    check('artist')
        .trim()
        .toLowerCase()
        .not().isEmpty(),
    check('category')
        .trim()
        .toLowerCase()
        .not().isEmpty()
], adminController.postAddSong);

router.patch('/updateSong/:songId', [
    check('title')
        .trim()
        .toLowerCase()
        .not().isEmpty(),
    check('artist')
        .trim()
        .toLowerCase()
        .not().isEmpty(),
    check('category')
        .trim()
        .toLowerCase()
        .not().isEmpty()
], adminController.updateSong);

router.delete('/deleteSong/:songId', adminController.deleteSong);

router.get('/users/:userId', adminController.getUser);

router.get('/users', adminController.getUsers);

router.patch('/updateUser/:userId', [
    check('name')
        .trim()
        .toLowerCase()
        .not().isEmpty(),
    check('role')
        .trim()
        .toLowerCase()
        .not().isEmpty()
], adminController.updateUser);

router.post('/user/ban', adminController.banUser);

module.exports = router;