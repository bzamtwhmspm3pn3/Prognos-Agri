const express = require('express');
const router = express.Router();
const {
  getStatus, criarSensor, atualizarSensor,
  removerSensor, controlarIrrigacao, getHistorico
} = require('../controllers/irrigacaoController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getStatus);
router.get('/sensores', getStatus);
router.post('/sensores', criarSensor);
router.put('/sensores/:id', atualizarSensor);
router.delete('/sensores/:id', removerSensor);
router.post('/controlar', controlarIrrigacao);
router.get('/historico', getHistorico);

module.exports = router;
