const mongoose = require('mongoose');

const leituraSchema = new mongoose.Schema({
  valor: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const sensorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['humidade_solo', 'temperatura', 'humidade_ar', 'chuva', 'fluxo_agua', 'pressao'],
    required: true
  },
  localizacao: { type: String, default: '' },
  ativo: { type: Boolean, default: true },
  config: {
    limiteInferior: { type: Number, default: 30 },
    limiteSuperior: { type: Number, default: 80 },
    intervaloLeitura: { type: Number, default: 5 },
    unidade: { type: String, default: '%' }
  },
  ultimaLeitura: { type: Number, default: 0 },
  leituras: {
    type: [leituraSchema],
    default: [],
    validate: [arr => arr.length <= 1440, 'Máximo 1440 leituras (24h a cada 1min)']
  },
  simulado: { type: Boolean, default: true }
}, { timestamps: true });

sensorSchema.index({ userId: 1, tipo: 1 });
sensorSchema.index({ userId: 1, ativo: 1 });

module.exports = mongoose.model('Sensor', sensorSchema);
