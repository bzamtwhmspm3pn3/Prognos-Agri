// models/modelo.js
const mongoose = require('mongoose');

const modeloSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['regressao', 'randomForest', 'glm', 'svm', 'outro'],
    required: true
  },
  descricao: String,
  parametros: mongoose.Schema.Types.Mixed,
  metricas: {
    acuracia: Number,
    precisao: Number,
    recall: Number,
    f1Score: Number
  },
  dados: {
    features: [String],
    target: String,
    tamanhoTreino: Number,
    tamanhoTeste: Number
  },
  resultado: mongoose.Schema.Types.Mixed,
  classificacao: {
    type: String,
    enum: ['EXCELENTE', 'BOA', 'MODERADA', 'RUIM']
  },
  arquivado: { type: Boolean, default: false },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Modelo', modeloSchema);