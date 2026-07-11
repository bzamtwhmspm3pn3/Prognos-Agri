const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPrevisao } = require('../controllers/weatherController');

router.get('/previsao', protect, getPrevisao);

module.exports = router;
