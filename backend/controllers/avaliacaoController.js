// controllers/avaliacaoController.js

// Versão super simples para teste
const createAvaliacao = (req, res) => {
  console.log('✅ createAvaliacao chamado');
  res.json({ 
    success: true, 
    message: 'createAvaliacao funcionando!' 
  });
};

const getAvaliacoes = (req, res) => {
  console.log('✅ getAvaliacoes chamado');
  res.json({ 
    success: true, 
    message: 'getAvaliacoes funcionando!',
    avaliacoes: [] 
  });
};

const responderAvaliacao = (req, res) => {
  console.log('✅ responderAvaliacao chamado');
  res.json({ 
    success: true, 
    message: 'responderAvaliacao funcionando!' 
  });
};

const aprovarAvaliacao = (req, res) => {
  console.log('✅ aprovarAvaliacao chamado');
  res.json({ 
    success: true, 
    message: 'aprovarAvaliacao funcionando!' 
  });
};

module.exports = {
  createAvaliacao,
  getAvaliacoes,
  responderAvaliacao,
  aprovarAvaliacao
};