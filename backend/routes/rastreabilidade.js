const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const rastreabilidadeController = require('../controllers/rastreabilidadeController');

router.post('/registar', protect, rastreabilidadeController.registarProducao);
router.get('/historico', protect, rastreabilidadeController.getHistorico);
router.get('/produto/:codigo', rastreabilidadeController.consultarProduto);
router.get('/certificado/:id', protect, rastreabilidadeController.getCertificado);

module.exports = router;
