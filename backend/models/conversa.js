// models/conversa.js
const mongoose = require('mongoose');

const mensagemSchema = new mongoose.Schema({
  remetente: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

const conversaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titulo: String,
  mensagens: [mensagemSchema],
  status: {
    type: String,
    enum: ['ativa', 'resolvida', 'pendente'],
    default: 'ativa'
  },
  dataInicio: { type: Date, default: Date.now },
  dataFim: Date
});

module.exports = mongoose.model('Conversa', conversaSchema);
