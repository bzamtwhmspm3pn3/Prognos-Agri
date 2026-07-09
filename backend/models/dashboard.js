// models/dashboard.js
const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  scans: [{
    data: Date,
    imagem: String,
    pragaDetectada: String,
    severidade: String,
    confianca: Number,
    localizacao: String,
    recomendacoes: [String]
  }],
  estatisticas: {
    totalScans: { type: Number, default: 0 },
    pragasPorTipo: {
      roedores: { type: Number, default: 0 },
      aves: { type: Number, default: 0 },
      insetos: { type: Number, default: 0 }
    },
    areasMonitoradas: [String],
    alertasAtivos: { type: Number, default: 0 }
  },
  configuracoes: {
    alertas: { type: Boolean, default: true },
    periodicidadeRelatorio: { type: String, enum: ['diario', 'semanal', 'mensal'], default: 'semanal' }
  },
  ultimaAtualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);