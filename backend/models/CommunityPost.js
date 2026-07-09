const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['post', 'pergunta', 'artigo', 'dica'],
    default: 'post'
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  conteudo: {
    type: String,
    required: true
  },
  resumo: { type: String, default: '' },
  tags: [String],
  grupo: {
    type: String,
    default: 'geral'
  },
  cultura: [String],
  localizacao: {
    provincia: String,
    municipio: String
  },
  imagens: [String],
  anexos: [{
    nome: String,
    url: String,
    tipo: String
  }],
  stats: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comentarios: { type: Number, default: 0 },
    visualizacoes: { type: Number, default: 0 },
    compartilhamentos: { type: Number, default: 0 }
  },
  comentarios: [{
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usuarioNome: String,
    conteudo: String,
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  likesUsuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resolvido: { type: Boolean, default: false },
  fixado: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['ativo', 'arquivado', 'removido'],
    default: 'ativo'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

communityPostSchema.index({ status: 1, createdAt: -1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ grupo: 1, status: 1 });
communityPostSchema.index({ 'stats.likes': -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
