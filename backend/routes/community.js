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
router.post('/grupos', protect, communityController.criarGrupo);
router.post('/grupos/:id/entrar', protect, communityController.solicitarEntrada);
router.post('/grupos/:id/aprovar/:usuarioId', protect, communityController.aprovarMembro);
router.post('/grupos/:id/convidar/:usuarioId', protect, communityController.convidarMembro);
router.delete('/grupos/:id/membros/:usuarioId', protect, communityController.removerMembro);
router.get('/grupos/:id/mensagens', protect, communityController.listarMensagens);
router.post('/grupos/:id/mensagens', protect, communityController.enviarMensagem);
router.get('/mensagens/nao-lidas', protect, communityController.getMensagensNaoLidas);
router.get('/tags-populares', protect, communityController.getTagsPopulares);

module.exports = router;
