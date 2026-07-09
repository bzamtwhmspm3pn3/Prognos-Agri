const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const predictController = require('../controllers/predictController');

router.get('/climatica', protect, predictController.getPrevisaoClimatica);
router.post('/climatica', protect, predictController.criarPrevisaoClimatica);
router.get('/historico', protect, predictController.getHistoricoPrevisoes);
router.get('/alertas', protect, predictController.getAlertasAtivos);

module.exports = router;
