const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const communityController = require('../controllers/communityController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'chat'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `chat-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype.split('/')[1]);
    cb(null, extOk || mimeOk);
  }
});

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
router.post('/upload', protect, upload.single('file'), communityController.uploadFile);

module.exports = router;
