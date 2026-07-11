const axios = require('axios');
const Plantio = require('../models/Plantio');

const FASES_PADRAO = [
  { codigo: 'planeamento', nome: 'Planeamento Estratégico', ordem: 1 },
  { codigo: 'aquisicao_insumos', nome: 'Aquisição de Insumos', ordem: 2 },
  { codigo: 'logistica_insumos', nome: 'Logística de Insumos', ordem: 3 },
  { codigo: 'preparo_solo', nome: 'Preparo do Solo', ordem: 4 },
  { codigo: 'plantio', nome: 'Plantio e Semeadura', ordem: 5 },
  { codigo: 'manejo_cultura', nome: 'Manejo da Cultura', ordem: 6 },
  { codigo: 'colheita', nome: 'Colheita', ordem: 7 },
  { codigo: 'pos_colheita', nome: 'Pós-colheita e Beneficiamento', ordem: 8 },
  { codigo: 'industrializacao', nome: 'Industrialização', ordem: 9 },
  { codigo: 'distribuicao', nome: 'Distribuição e Logística', ordem: 10 },
  { codigo: 'comercializacao', nome: 'Comercialização', ordem: 11 }
];

exports.criarPlantio = async (req, res, next) => {
  try {
    const { nome, cultura, provincia, municipio, area } = req.body;
    const plantio = new Plantio({
      usuarioId: req.userId,
      nome, cultura, provincia, municipio, area,
      fases: FASES_PADRAO.map(f => ({ ...f, status: 'pendente' }))
    });
    await plantio.save();
    res.status(201).json({ success: true, plantio });
  } catch (error) {
    next(error);
  }
};

exports.listarPlantios = async (req, res, next) => {
  try {
    const plantios = await Plantio.find({ usuarioId: req.userId }).sort('-createdAt');
    res.json({ success: true, plantios });
  } catch (error) {
    next(error);
  }
};

exports.getPlantio = async (req, res, next) => {
  try {
    const plantio = await Plantio.findOne({ _id: req.params.id, usuarioId: req.userId });
    if (!plantio) return res.status(404).json({ success: false, message: 'Plantio não encontrado' });
    res.json({ success: true, plantio });
  } catch (error) {
    next(error);
  }
};

exports.atualizarFase = async (req, res, next) => {
  try {
    const { codigo, status, observacoes, dataInicio, dataFim } = req.body;
    const plantio = await Plantio.findOne({ _id: req.params.id, usuarioId: req.userId });
    if (!plantio) return res.status(404).json({ success: false, message: 'Plantio não encontrado' });

    const fase = plantio.fases.find(f => f.codigo === codigo);
    if (!fase) return res.status(404).json({ success: false, message: 'Fase não encontrada' });

    if (status) fase.status = status;
    if (observacoes !== undefined) fase.observacoes = observacoes;
    if (dataInicio) fase.dataInicio = dataInicio;
    if (dataFim) fase.dataFim = dataFim;
    if (status === 'concluido') {
      fase.concluido = true;
      fase.dataFim = fase.dataFim || new Date();
      const idx = plantio.fases.findIndex(f => f.codigo === codigo);
      if (idx >= 0 && idx < plantio.fases.length - 1) {
        plantio.faseAtual = idx + 1;
        plantio.fases[idx + 1].status = 'em_andamento';
        plantio.fases[idx + 1].dataInicio = plantio.fases[idx + 1].dataInicio || new Date();
      }
    }

    const todasConcluidas = plantio.fases.every(f => f.status === 'concluido' || f.status === 'pulado');
    if (todasConcluidas) plantio.concluido = true;

    await plantio.save();
    res.json({ success: true, plantio });
  } catch (error) {
    next(error);
  }
};

exports.perguntarIA = async (req, res, next) => {
  try {
    const { codigoFase, cultura, provincia, observacoes } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ success: false, message: 'IA não configurada' });

    const faseInfo = FASES_PADRAO.find(f => f.codigo === codigoFase);
    const nomeFase = faseInfo ? faseInfo.nome : codigoFase;

    const prompt = `És um especialista agrícola angolano. O agricultor está na fase "${nomeFase}" do cultivo de ${cultura} na província de ${provincia || 'Angola'}.
${observacoes ? `Observações do agricultor: ${observacoes}` : 'O agricultor precisa de recomendações práticas.'}
Fornece aconselhamento prático e detalhado em português de Angola para esta fase específica do ciclo produtivo.
Responde com JSON:
{
  "recomendacao": "texto detalhado da recomendação",
  "dicas": ["dica1", "dica2", "dica3"],
  "alertas": ["alerta se aplicável"]
}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
      },
      { timeout: 20000 }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return res.status(502).json({ success: false, message: 'IA não respondeu' });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ success: false, message: 'Resposta inválida' });

    res.json({ success: true, ...JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error('Erro IA Plantio:', error.message);
    next(error);
  }
};

exports.eliminarPlantio = async (req, res, next) => {
  try {
    await Plantio.deleteOne({ _id: req.params.id, usuarioId: req.userId });
    res.json({ success: true, message: 'Plantio eliminado' });
  } catch (error) {
    next(error);
  }
};
