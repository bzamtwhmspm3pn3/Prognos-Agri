const mongoose = require('mongoose');

const rastreabilidadeSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  codigoRastreio: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  produto: {
    nome: { type: String, required: true },
    categoria: { type: String, default: '' },
    variedade: { type: String, default: '' }
  },
  producao: {
    talhao: String,
    coordenadas: {
      lat: Number,
      lng: Number
    },
    dataPlantio: Date,
    dataColheita: { type: Date, default: Date.now },
    quantidade: { type: Number, default: 0 },
    unidade: {
      type: String,
      enum: ['kg', 'ton', 'unidade', 'litro'],
      default: 'kg'
    },
    qualidade: {
      type: String,
      enum: ['premium', 'bom', 'regular', 'basico'],
      default: 'bom'
    },
    observacoes: String
  },
  certificacao: {
    emissao: { type: Date, default: Date.now },
    valido: { type: Boolean, default: true },
    hashBlockchain: { type: String, default: '' },
    certificadoUrl: String
  },
  historicoTransacoes: [{
    tipo: {
      type: String,
      enum: ['colheita', 'venda', 'transporte', 'processamento', 'entrega']
    },
    data: Date,
    responsavel: String,
    observacoes: String,
    hashTransacao: String
  }],
  agrookuvanjaId: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

rastreabilidadeSchema.index({ codigoRastreio: 1 });
rastreabilidadeSchema.index({ 'produto.nome': 1 });

module.exports = mongoose.model('Rastreabilidade', rastreabilidadeSchema);
