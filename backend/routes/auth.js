const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

console.log('🔍 authController:', {
  register: typeof register,
  login: typeof login,
  getMe: typeof getMe
});

// ROTA DE TESTE (ADICIONA ISTO)
router.get('/teste', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Rota de teste funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rota protegida
router.get('/me', protect, getMe);

module.exports = router;