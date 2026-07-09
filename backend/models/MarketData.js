const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  tipo: {
    type: String,
    enum: ['produto', 'oferta', 'procura'],
    required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  produto: {
    nome: { type: String, required: true },
    categoria: {
      type: String,
      enum: ['graos', 'horticolas', 'frutas', 'tubérculos', 'animais', 'laticínios', 'outros'],
      default: 'outros'
    },
    quantidade: { type: Number, default: 0 },
    unidade: {
      type: String,
      enum: ['kg', 'ton', 'unidade', 'litro', 'hectare'],
      default: 'kg'
    },
    qualidade: {
      type: String,
      enum: ['premium', 'bom', 'regular', 'basico'],
      default: 'bom'
    }
  },
  preco: {
    valor: { type: Number, required: true },
    moeda: { type: String, default: 'AOA' },
    porUnidade: { type: String, default: 'kg' }
  },
  localizacao: {
    provincia: { type: String, required: true },
    municipio: { type: String },
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  vendedor: {
    nome: String,
    telefone: String,
    email: String
  },
  descricao: { type: String, default: '' },
  imagens: [String],
  status: {
    type: String,
    enum: ['ativo', 'pendente', 'reservado', 'vendido', 'expirado'],
    default: 'ativo'
  },
  dataExpiracao: Date,
  visualizacoes: { type: Number, default: 0 },
  contactos: { type: Number, default: 0 },
  historicoPrecos: [{
    preco: Number,
    data: { type: Date, default: Date.now }
  }],
  tags: [String],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

marketDataSchema.index({ 'produto.nome': 1, status: 1 });
marketDataSchema.index({ 'localizacao.provincia': 1, status: 1 });
marketDataSchema.index({ tipo: 1, status: 1 });
marketDataSchema.index({ 'preco.valor': 1 });
marketDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MarketData', marketDataSchema);
