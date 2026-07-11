const mongoose = require('mongoose');

const faseSchema = new mongoose.Schema({
  codigo: { type: String, required: true },
  nome: { type: String, required: true },
  ordem: { type: Number, required: true },
  status: { type: String, enum: ['pendente', 'em_andamento', 'concluido', 'pulado'], default: 'pendente' },
  dataInicio: Date,
  dataFim: Date,
  observacoes: String,
  recomendacaoIA: String,
  concluido: { type: Boolean, default: false }
});

const plantioSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nome: { type: String, required: true },
  cultura: { type: String, required: true },
  provincia: String,
  municipio: String,
  area: Number,
  faseAtual: { type: Number, default: 0 },
  concluido: { type: Boolean, default: false },
  fases: [faseSchema]
}, { timestamps: true });

module.exports = mongoose.model('Plantio', plantioSchema);
