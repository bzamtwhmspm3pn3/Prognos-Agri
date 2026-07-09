const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['climatica', 'pragas', 'mercado', 'plantio'],
    required: true
  },
  localizacao: {
    provincia: { type: String, default: '' },
    municipio: { type: String, default: '' },
    latitude: Number,
    longitude: Number
  },
  cultura: {
    type: String,
    default: ''
  },
  dataPrevisao: {
    type: Date,
    required: true
  },
  previsaoClimatica: {
    temperatura: {
      min: Number,
      max: Number,
      media: Number
    },
    humidade: { type: Number },
    precipitacao: { type: Number },
    vento: {
      velocidade: Number,
      direcao: String
    },
    condicao: { type: String },
    icone: { type: String }
  },
  alertas: [{
    tipo: {
      type: String,
      enum: ['geada', 'vento_forte', 'chuva_intensa', 'seca', 'tempestade', 'calor_extremo']
    },
    nivel: {
      type: String,
      enum: ['leve', 'moderado', 'severo', 'extremo']
    },
    mensagem: String,
    data: Date,
    ativo: { type: Boolean, default: true }
  }],
  recomendacaoPlantio: {
    favoravel: { type: Boolean, default: true },
    culturasRecomendadas: [String],
    periodoIdeal: { type: String },
    observacoes: { type: String }
  },
  riscoPragas: {
    nivel: {
      type: String,
      enum: ['baixo', 'medio', 'alto', 'critico']
    },
    pragasProvaveis: [String],
    recomendacoes: [String]
  },
  confianca: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  fonte: {
    type: String,
    enum: ['openweather', 'jiam', 'interno'],
    default: 'interno'
  },
  dadosBrutos: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

predictionSchema.index({ usuarioId: 1, dataPrevisao: -1 });
predictionSchema.index({ tipo: 1, dataPrevisao: -1 });
predictionSchema.index({ 'localizacao.provincia': 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
