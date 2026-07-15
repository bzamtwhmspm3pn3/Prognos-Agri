// backend/controllers/detectionController.js
const pythonService = require('../services/pythonService');
const rService = require('../services/rService');
const Detection = require('../models/detection');
const User = require('../models/user');

exports.detectFromImage = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem enviada'
      });
    }

    console.log('🔍 Enviando para detecção Python...');
    
    const detectionResult = await pythonService.detectFromImage(
      req.file.buffer,
      req.file.originalname
    );

    console.log('✅ Detecção concluída. Pragas:', detectionResult.total_count);

    let rAnalysis = null;
    try {
      rAnalysis = await rService.classifyRiskRF({
        pest_count: detectionResult.total_count,
        detections: detectionResult.detections,
        area: req.body.area || 1,
        crop_type: req.body.cropType || 'milho'
      });
      console.log('✅ Análise R concluída');
    } catch (rError) {
      console.warn('⚠️ Análise R falhou');
    }

    const detection = new Detection({
      userId,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      detections: detectionResult.detections,
      impact: detectionResult.impact,
      analysis: rAnalysis || {
        level: detectionResult.impact?.nivel_risco || 'MÉDIO',
        score: 50,
        recommendations: ['Monitorar área afetada']
      },
      location: (() => {
        try {
          return req.body.location ? JSON.parse(req.body.location) : null;
        } catch {
          return null;
        }
      })(),
      notes: req.body.notes
    });

    await detection.save();

    await User.findByIdAndUpdate(userId, {
      $inc: {
        'estatisticas.totalScans': 1,
        'estatisticas.pragasDetectadas': detectionResult.total_count || 0
      }
    });

    res.json({
      success: true,
      message: 'Detecção realizada com sucesso',
      detection,
      audio: generateAudioAlert(detectionResult, rAnalysis)
    });

  } catch (error) {
    console.error('❌ Erro na detecção:', error);
    next(error);
  }
};

exports.getDetectionHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { limit = 20, page = 1 } = req.query;

    const detections = await Detection.find({ userId })
      .sort('-timestamp')
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Detection.countDocuments({ userId });

    res.json({
      success: true,
      detections,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.checkServices = async (req, res, next) => {
  try {
    const [python, r] = await Promise.all([
      pythonService.healthCheck(),
      rService.healthCheck()
    ]);

    res.json({
      success: true,
      services: { python, r }
    });
  } catch (error) {
    next(error);
  }
};

function generateAudioAlert(detection, analysis) {
  const pestNames = detection.detections.map(d => d.class).join(', ');
  const totalLoss = detection.impact?.total_loss_kz || 0;
  
  return {
    message: `Atenção! Detectamos ${detection.total_count} ${detection.total_count === 1 ? 'praga' : 'pragas'}: ${pestNames}. Perda estimada de ${totalLoss.toLocaleString()} Kwanzas.`,
    severity: detection.impact?.nivel_risco || 'MÉDIO'
  };
}