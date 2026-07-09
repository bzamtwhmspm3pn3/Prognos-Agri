const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const marketController = require('../controllers/marketController');

router.get('/produtos', protect, marketController.listarProdutos);
router.post('/ofertas', protect, marketController.criarOferta);
router.get('/ofertas', protect, marketController.listarOfertas);
router.get('/minhas-ofertas', protect, marketController.getMinhasOfertas);
router.put('/ofertas/:id', protect, marketController.atualizarOferta);
router.post('/ofertas/:id/contacto', protect, marketController.registrarContacto);
router.get('/precos-medios', protect, marketController.getPrecosMedios);

module.exports = router;
