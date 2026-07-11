const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  grupoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conteudo: { type: String, required: true, maxlength: 2000 },
  tipo: { type: String, enum: ['texto', 'imagem', 'sistema'], default: 'texto' },
  imagemUrl: String,
  lidoPor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  respondendoA: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupMessage' }
}, { timestamps: true });

groupMessageSchema.index({ grupoId: 1, createdAt: -1 });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
