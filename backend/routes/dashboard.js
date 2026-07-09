const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/', protect, dashboardController.getDashboard);
router.get('/estatisticas-globais', protect, authorize('admin'), dashboardController.getEstatisticasGlobais);

module.exports = router;
