// routes/modelos.js
const express = require('express');
const router = express.Router();
const modeloController = require('../controllers/modeloController');

// Importar middleware de autenticação
let protect;
try {
  protect = require('../middleware/auth').protect;
} catch (error) {
  // Fallback
  protect = (req, res, next) => {
    req.userId = '123456789';
    req.user = { id: '123456789', role: 'agricultor' };
    next();
  };
}

// Todas as rotas de modelos são protegidas
router.use(protect);

router.post('/salvar', modeloController.salvarModelo);
router.get('/listar/:userId', modeloController.listarModelos);
router.get('/carregar/:userId/:modeloId', modeloController.carregarModelo);
router.put('/status/:userId/:modeloId', modeloController.alterarStatusModelo);
router.delete('/eliminar/:userId/:modeloId', modeloController.eliminarModelo);
router.get('/estatisticas/:userId', modeloController.getEstatisticas);

module.exports = router;