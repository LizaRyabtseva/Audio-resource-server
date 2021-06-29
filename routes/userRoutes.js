const express = require('express');
const userController = require('../controllers/userControllers');
const fileUpload = require('../middleware/file-upload');
const router = express.Router();

router.get('/:userId/playlists', userController.getPlaylists);

router.get('/:userId/playlists/:playlistId', userController.getPlaylist);

router.post('/postLike', userController.postLike);

router.post('/:userId/newPlaylist', fileUpload.fields([
    {name: 'image', maxCount: 1}]), userController.newPlaylist);

router.post('/addSongToPlaylist', userController.postSong);

router.delete('/:userId/deletePlaylist/:playlistId', userController.deletePlaylist);

module.exports = router;