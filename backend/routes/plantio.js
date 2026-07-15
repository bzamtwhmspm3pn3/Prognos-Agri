const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const plantioController = require('../controllers/plantioController');

router.use(protect);

router.post('/', plantioController.criarPlantio);
router.post('/salvar-plano', plantioController.salvarPlanoCompleto);
router.get('/', plantioController.listarPlantios);
router.get('/estatisticas', plantioController.estatisticas);
router.get('/:id', plantioController.getPlantio);
router.put('/:id', plantioController.atualizarPlantio);
router.put('/:id/fase', plantioController.atualizarFase);
router.patch('/:id/status', plantioController.mudarStatus);
router.post('/ia/perguntar', plantioController.perguntarIA);
router.post('/ia/planear-completo', plantioController.planearCompleto);
router.delete('/:id', plantioController.eliminarPlantio);

module.exports = router;
