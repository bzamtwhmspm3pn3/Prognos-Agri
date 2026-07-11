const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessoes: [{
    titulo: { type: String, default: 'Nova conversa' },
    mensagens: [{
      papel: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
      },
      conteudo: { type: String, required: true },
      contexto: {
        tipo: {
          type: String,
          enum: ['geral', 'praga', 'clima', 'mercado', 'plantio', 'tecnico', 'ia']
        },
        dadosRelacionados: mongoose.Schema.Types.Mixed
      },
      timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  ultimaMensagem: { type: Date, default: Date.now }
}, {
  timestamps: true
});

chatHistorySchema.index({ usuarioId: 1, ultimaMensagem: -1 });
chatHistorySchema.index({ 'sessoes.mensagens.conteudo': 'text' });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
