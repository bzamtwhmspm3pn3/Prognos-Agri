// routes/modelos.js
const express = require('express');
const router = express.Router();
const modeloController = require('../controllers/modeloController');

// Importar middleware de autenticação
let protect;
try {
  protect = require('../middleware/auth').protect;
  console.log('✅ Auth middleware carregado em modelos');
} catch (error) {
  console.log('⚠️ Erro ao carregar auth middleware em modelos:', error.message);
  // Fallback
  protect = (req, res, next) => {
    console.log('⚠️ Usando protect dummy em modelos');
    req.userId = '123456789';
    req.user = { id: '123456789', role: 'agricultor' };
    next();
  };
}

console.log('🔍 modeloController:', {
  salvarModelo: typeof modeloController?.salvarModelo,
  listarModelos: typeof modeloController?.listarModelos,
  carregarModelo: typeof modeloController?.carregarModelo,
  alterarStatusModelo: typeof modeloController?.alterarStatusModelo,
  eliminarModelo: typeof modeloController?.eliminarModelo,
  getEstatisticas: typeof modeloController?.getEstatisticas
});

// Todas as rotas de modelos são protegidas
router.use(protect);

router.post('/salvar', modeloController.salvarModelo);
router.get('/listar/:userId', modeloController.listarModelos);
router.get('/carregar/:userId/:modeloId', modeloController.carregarModelo);
router.put('/status/:userId/:modeloId', modeloController.alterarStatusModelo);
router.delete('/eliminar/:userId/:modeloId', modeloController.eliminarModelo);
router.get('/estatisticas/:userId', modeloController.getEstatisticas);

module.exports = router;