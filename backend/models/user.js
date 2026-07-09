const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['agricultor', 'tecnico', 'admin'],
    default: 'agricultor'
  },
  profile: {
    nome: String,
    telefone: String,
    propriedade: String,
    hectares: Number,
    culturas: [String],
    localizacao: {
      provincia: String,
      municipio: String,
      bairro: String
    },
    imagemPerfil: {
      url: String,
      publicId: String
    }
  },
  configuracoes: {
    notificacoes: { type: Boolean, default: true },
    idioma: { type: String, default: 'pt' },
    tema: { type: String, default: 'auto' }
  },
  plano: {
    tipo: { type: String, enum: ['gratuito', 'premium'], default: 'gratuito' },
    scansRestantes: { type: Number, default: 5 },
    scansUsados: { type: Number, default: 0 },
    dataExpiracao: Date,
    ativo: { type: Boolean, default: true }
  },
  estatisticas: {
    totalScans: { type: Number, default: 0 },
    pragasDetectadas: { type: Number, default: 0 },
    alertasRecebidos: { type: Number, default: 0 },
    previsoesSolicitadas: { type: Number, default: 0 },
    ofertasPublicadas: { type: Number, default: 0 },
    postsForum: { type: Number, default: 0 }
  },
  agrookuvanjaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  emailConfirmado: { type: Boolean, default: false },
  ultimoAcesso: Date,
  dataCriacao: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
