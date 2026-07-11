const axios = require('axios');
const Detection = require('../models/detection');
const Deteccao = require('../models/deteccao');
const User = require('../models/user');

const NIVEL_MAP = { 'Baixo': 1, 'Médio': 2, 'Alto': 3, 'Crítico': 4 };
const NIVEL_REVERSE = { 1: 'BAIXO', 2: 'MÉDIO', 3: 'ALTO', 4: 'CRÍTICO' };

function calcularNivelRisco(pragas) {
  if (!pragas || pragas.length === 0) return 'BAIXO';
  const maxNivel = Math.max(...pragas.map(p => NIVEL_MAP[p.nivel] || 0));
  return NIVEL_REVERSE[maxNivel] || 'BAIXO';
}

exports.detectWithGemini = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'IA não configurada' });
    }

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = `Analisa esta imagem agrícola. Identifica se há pragas, doenças ou deficiências nutricionais.
Responde APENAS com JSON válido neste formato exacto (sem markdown):
{
  "temPraga": true/false,
  "pragas": [
    {
      "nome": "nome da praga/doença em português",
      "nomeCientifico": "nome científico",
      "nivel": "Baixo|Médio|Alto|Crítico",
      "probabilidade": 0-100,
      "sintomas": "descrição curta",
      "controlo": "método de controlo recomendado",
      "controloBiologico": "alternativa biológica se aplicável"
    }
  ],
  "cultura": "cultura identificada ou 'Não identificada'",
  "resumo": "resumo curto em português de Angola",
  "recomendacoes": ["recomendação 1", "recomendação 2", "recomendação 3"]
}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64 } }
          ]
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
      },
      { timeout: 30000 }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(502).json({ success: false, message: 'IA não gerou resposta' });
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ success: false, message: 'Resposta inválida da IA' });
    }

    const result = JSON.parse(jsonMatch[0]);

    const nivelRisco = calcularNivelRisco(result.pragas);
    const score = result.pragas?.length > 0
      ? Math.min(100, result.pragas.reduce((a, p) => a + (p.probabilidade || 0), 0) / result.pragas.length)
      : 0;

    const detection = new Detection({
      userId: req.userId,
      imageUrl: `/uploads/${req.file.filename}`,
      detections: (result.pragas || []).map(p => ({
        class: p.nome,
        confidence: (p.probabilidade || 0) / 100,
        class_pt: p.nome,
        nomeCientifico: p.nomeCientifico,
        nivel: p.nivel,
        sintomas: p.sintomas,
        controlo: p.controlo,
        controloBiologico: p.controloBiologico
      })),
      impact: { nivel_risco: nivelRisco, total_loss_kz: 0 },
      analysis: {
        level: nivelRisco,
        score: Math.round(score),
        recommendations: result.recomendacoes || [],
        resumo: result.resumo || '',
        cultura: result.cultura || ''
      },
      notes: result.resumo || ''
    });

    await detection.save();

    await new Deteccao({
      usuarioId: req.userId,
      timestamp: new Date(),
      nivelRisco,
      total_count: detection.detections.length,
      detections: detection.detections,
      imagemUrl: `/uploads/${req.file.filename}`,
      cultura: result.cultura || '',
      perdaEstimada: 0,
      origem: 'deteccao',
      localizacao: req.body.location || ''
    }).save();

    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'estatisticas.totalScans': 1, 'estatisticas.pragasDetectadas': detection.detections.length }
    });

    res.json({
      success: true,
      message: 'Análise concluída',
      detection,
      resumo: result.resumo,
      pragas: result.pragas || [],
      recomendacoes: result.recomendacoes || [],
      cultura: result.cultura || ''
    });

  } catch (error) {
    console.error('Erro Gemini Vision:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status, 'Data:', JSON.stringify(error.response.data?.error));
    }
    next(error);
  }
};
