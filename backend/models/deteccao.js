const mongoose = require('mongoose');

const deteccaoSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  localizacao: {
    type: String,
    default: 'Não especificada'
  },
  talhao: {
    type: String,
    default: ''
  },
  coordenadas: {
    lat: Number,
    lng: Number
  },
  areaAfetada: {
    type: String,
    default: 'Área não especificada'
  },
  cultura: {
    type: String,
    default: 'Não especificada'
  },
  perdaEstimada: {
    type: Number,
    default: 0
  },
  nivelRisco: {
    type: String,
    enum: ['BAIXO', 'MÉDIO', 'ALTO', 'CRÍTICO', 'NENHUM'],
    default: 'NENHUM'
  },
  total_count: {
    type: Number,
    default: 0
  },
  detections: [{
    class: String,
    class_pt: String,
    confidence: Number,
    bbox: [Number],
    area: Number
  }],
  imagemUrl: {
    type: String,
    default: null
  },
  processado: {
    type: Boolean,
    default: true
  },
  resolvido: {
    type: Boolean,
    default: false
  },
  resolvidoEm: {
    type: Date,
    default: null
  },
  origem: {
    type: String,
    enum: ['deteccao', 'monitoramento', 'camera'],
    default: 'deteccao'
  },
  cameraId: {
    type: String,
    default: null
  },
  cameraNome: {
    type: String,
    default: null
  },
  agrookuvanjaId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, {
  timestamps: true
});

deteccaoSchema.index({ usuarioId: 1, timestamp: -1 });
deteccaoSchema.index({ usuarioId: 1, resolvido: 1 });
deteccaoSchema.index({ 'detections.class': 1 });
deteccaoSchema.index({ platform: 1 });

module.exports = mongoose.model('Deteccao', deteccaoSchema);
