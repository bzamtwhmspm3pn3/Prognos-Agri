// models/avaliacao.js
const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  estrelas: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comentario: String,
  resposta: {
    texto: String,
    data: Date,
    respondidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  data: { type: Date, default: Date.now },
  aprovada: { type: Boolean, default: false }
});

module.exports = mongoose.model('Avaliacao', avaliacaoSchema);