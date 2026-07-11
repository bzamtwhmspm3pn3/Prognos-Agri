const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, maxlength: 100 },
  descricao: { type: String, trim: true, maxlength: 500 },
  foto: { type: String, default: null },
  categoria: { type: String, default: 'geral' },
  tipo: { type: String, enum: ['publico', 'privado'], default: 'publico' },
  conviteCodigo: { type: String, unique: true, sparse: true },
  criadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membros: [{
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cargo: { type: String, enum: ['admin', 'moderador', 'membro'], default: 'membro' },
    entrouEm: { type: Date, default: Date.now }
  }],
  pedidosPendentes: [{
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

groupSchema.index({ nome: 1 });
groupSchema.index({ categoria: 1 });
groupSchema.index({ conviteCodigo: 1 });

module.exports = mongoose.model('Group', groupSchema);
