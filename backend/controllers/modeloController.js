// controllers/modeloController.js
const mongoose = require('mongoose');
const Modelo = require('../models/modelo');
const User = require('../models/user');

// Salvar modelo
const salvarModelo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { nome, tipo, descricao, parametros, metricas, dados, resultado, classificacao } = req.body;

    const modelo = new Modelo({
      userId,
      nome,
      tipo,
      descricao,
      parametros,
      metricas,
      dados,
      resultado,
      classificacao
    });

    await modelo.save();

    res.status(201).json({
      success: true,
      message: 'Modelo salvo com sucesso',
      modelo
    });
  } catch (error) {
    next(error);
  }
};

// Listar modelos do utilizador
const listarModelos = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { arquivado = false } = req.query;

    const modelos = await Modelo.find({ 
      userId, 
      arquivado: arquivado === 'true' 
    }).sort('-dataCriacao');

    res.json({
      success: true,
      count: modelos.length,
      modelos
    });
  } catch (error) {
    next(error);
  }
};

// Carregar modelo específico
const carregarModelo = async (req, res, next) => {
  try {
    const { userId, modeloId } = req.params;

    const modelo = await Modelo.findOne({ _id: modeloId, userId });
    
    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Modelo não encontrado'
      });
    }

    res.json({
      success: true,
      modelo
    });
  } catch (error) {
    next(error);
  }
};

// Arquivar/restaurar modelo
const alterarStatusModelo = async (req, res, next) => {
  try {
    const { userId, modeloId } = req.params;
    const { arquivado } = req.body;

    const modelo = await Modelo.findOneAndUpdate(
      { _id: modeloId, userId },
      { $set: { arquivado } },
      { new: true }
    );

    res.json({
      success: true,
      message: arquivado ? 'Modelo arquivado' : 'Modelo restaurado',
      modelo
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar modelo (apenas se arquivado)
const eliminarModelo = async (req, res, next) => {
  try {
    const { userId, modeloId } = req.params;

    const modelo = await Modelo.findOne({ _id: modeloId, userId });
    
    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Modelo não encontrado'
      });
    }
    
    if (!modelo.arquivado) {
      return res.status(400).json({
        success: false,
        message: 'Arquive o modelo antes de eliminar'
      });
    }

    await Modelo.deleteOne({ _id: modeloId, userId });

    res.json({
      success: true,
      message: 'Modelo eliminado permanentemente'
    });
  } catch (error) {
    next(error);
  }
};

// Estatísticas de modelos
const getEstatisticas = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const stats = await Modelo.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        ativos: { $sum: { $cond: [{ $eq: ['$arquivado', false] }, 1, 0] } },
        arquivados: { $sum: { $cond: [{ $eq: ['$arquivado', true] }, 1, 0] } },
        porTipo: { $push: '$tipo' }
      }}
    ]);

    res.json({
      success: true,
      estatisticas: stats[0] || { total: 0, ativos: 0, arquivados: 0, porTipo: [] }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  salvarModelo,
  listarModelos,
  carregarModelo,
  alterarStatusModelo,
  eliminarModelo,
  getEstatisticas
};