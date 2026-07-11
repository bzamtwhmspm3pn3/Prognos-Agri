const express = require('express');
const router = express.Router();
const {
  createAvaliacao,
  getAvaliacoes,
  responderAvaliacao,
  aprovarAvaliacao
} = require('../controllers/avaliacaoController');
const { protect } = require('../middleware/auth');

router.get('/', getAvaliacoes);
router.post('/', protect, createAvaliacao);
router.post('/:id/responder', protect, responderAvaliacao);
router.put('/:id/aprovar', protect, aprovarAvaliacao);

module.exports = router;
