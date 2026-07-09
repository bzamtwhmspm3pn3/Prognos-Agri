const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatbotController = require('../controllers/chatbotController');

router.post('/mensagem', protect, chatbotController.enviarMensagem);
router.get('/historico', protect, chatbotController.getHistorico);
router.get('/sessao/:id', protect, chatbotController.getSessao);
router.delete('/sessao/:id', protect, chatbotController.deletarSessao);

module.exports = router;
