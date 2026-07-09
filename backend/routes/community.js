const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const communityController = require('../controllers/communityController');

router.get('/posts', protect, communityController.listarPosts);
router.post('/posts', protect, communityController.criarPost);
router.get('/posts/:id', protect, communityController.getPost);
router.post('/posts/:id/comentar', protect, communityController.comentar);
router.post('/posts/:id/like', protect, communityController.likePost);
router.get('/grupos', protect, communityController.listarGrupos);
router.get('/tags-populares', protect, communityController.getTagsPopulares);

module.exports = router;
