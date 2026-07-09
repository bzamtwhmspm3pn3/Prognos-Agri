// routes/avaliacoes.js
const express = require('express');
const router = express.Router();

// Funções diretamente na rota (sem importar controller)
router.get('/', (req, res) => {
  console.log('✅ GET /avaliacoes chamado');
  res.json({ 
    success: true, 
    message: 'Rota de avaliações funcionando!',
    data: [] 
  });
});

router.post('/', (req, res) => {
  console.log('✅ POST /avaliacoes chamado');
  res.json({ 
    success: true, 
    message: 'POST avaliações funcionando!' 
  });
});

router.post('/:id/responder', (req, res) => {
  console.log('✅ POST /avaliacoes/:id/responder chamado');
  res.json({ 
    success: true, 
    message: 'Responder avaliação funcionando!' 
  });
});

router.put('/:id/aprovar', (req, res) => {
  console.log('✅ PUT /avaliacoes/:id/aprovar chamado');
  res.json({ 
    success: true, 
    message: 'Aprovar avaliação funcionando!' 
  });
});

module.exports = router;