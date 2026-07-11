const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const plantioController = require('../controllers/plantioController');

router.use(protect);

router.post('/', plantioController.criarPlantio);
router.get('/', plantioController.listarPlantios);
router.get('/:id', plantioController.getPlantio);
router.put('/:id/fase', plantioController.atualizarFase);
router.post('/ia/perguntar', plantioController.perguntarIA);
router.delete('/:id', plantioController.eliminarPlantio);

module.exports = router;
