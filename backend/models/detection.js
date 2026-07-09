const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  platform: { type: String, default: 'prognos-agri' },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: String,
  detections: [{
    class: String,
    confidence: Number,
    bbox: [Number],
    timestamp: Date
  }],
  impact: {
    total_loss_kz: Number,
    total_loss_usd: Number,
    area_afetada_ha: Number,
    nivel_risco: String
  },
  analysis: {
    level: String,
    score: Number,
    recommendations: [String]
  },
  location: {
    talhao: String,
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  notes: String,
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Detection', detectionSchema);
