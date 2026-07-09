const express = require('express');
const router = express.Router();
const Deteccao = require('../models/deteccao');
const authMiddleware = require('../middleware/auth');

// Guardar uma nova deteção
router.post('/', authMiddleware.protect, async (req, res) => {
  try {
    const deteccao = new Deteccao({
      usuarioId: req.userId,
      ...req.body
    });
    
    await deteccao.save();
    
    res.status(201).json({
      success: true,
      message: 'Deteção guardada com sucesso',
      deteccao
    });
  } catch (error) {
    console.error('Erro ao guardar deteção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao guardar deteção',
      error: error.message
    });
  }
});

// Buscar deteções do utilizador
router.get('/', authMiddleware.protect, async (req, res) => {
  try {
    const { limit = 50, page = 1, resolvido, tipo, inicio, fim } = req.query;
    const query = { usuarioId: req.userId };
    
    if (resolvido !== undefined) query.resolvido = resolvido === 'true';
    if (tipo) query['detections.class'] = tipo;
    if (inicio || fim) {
      query.timestamp = {};
      if (inicio) query.timestamp.$gte = new Date(inicio);
      if (fim) query.timestamp.$lte = new Date(fim);
    }
    
    const deteccoes = await Deteccao.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Deteccao.countDocuments(query);
    
    res.json({
      success: true,
      deteccoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar deteções:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar deteções',
      error: error.message
    });
  }
});

// Marcar deteção como resolvida
router.patch('/:id/resolver', authMiddleware.protect, async (req, res) => {
  try {
    const deteccao = await Deteccao.findOne({
      _id: req.params.id,
      usuarioId: req.userId
    });
    
    if (!deteccao) {
      return res.status(404).json({
        success: false,
        message: 'Deteção não encontrada'
      });
    }
    
    deteccao.resolvido = true;
    deteccao.resolvidoEm = new Date();
    await deteccao.save();
    
    res.json({
      success: true,
      message: 'Deteção marcada como resolvida',
      deteccao
    });
  } catch (error) {
    console.error('Erro ao resolver deteção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao resolver deteção',
      error: error.message
    });
  }
});

// Apagar deteção
router.delete('/:id', authMiddleware.protect, async (req, res) => {
  try {
    const result = await Deteccao.deleteOne({
      _id: req.params.id,
      usuarioId: req.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deteção não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Deteção apagada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao apagar deteção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao apagar deteção',
      error: error.message
    });
  }
});

// Obter estatísticas
router.get('/estatisticas', authMiddleware.protect, async (req, res) => {
  try {
    const stats = await Deteccao.aggregate([
      { $match: { usuarioId: req.userId } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        totalPerda: { $sum: '$perdaEstimada' },
        ativas: { $sum: { $cond: [{ $eq: ['$resolvido', false] }, 1, 0] } },
        resolvidas: { $sum: { $cond: [{ $eq: ['$resolvido', true] }, 1, 0] } },
        criticas: { $sum: { $cond: [{ $eq: ['$nivelRisco', 'CRÍTICO'] }, 1, 0] } }
      }}
    ]);
    
    const porTipo = await Deteccao.aggregate([
      { $match: { usuarioId: req.userId } },
      { $unwind: '$detections' },
      { $group: {
        _id: '$detections.class',
        count: { $sum: 1 },
        class_pt: { $first: '$detections.class_pt' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      estatisticas: stats[0] || {
        total: 0,
        totalPerda: 0,
        ativas: 0,
        resolvidas: 0,
        criticas: 0
      },
      porTipo
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

module.exports = router;