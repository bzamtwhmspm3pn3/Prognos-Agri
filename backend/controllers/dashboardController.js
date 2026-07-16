const Deteccao = require('../models/deteccao');
const Prediction = require('../models/Prediction');
const MarketData = require('../models/MarketData');
const CommunityPost = require('../models/CommunityPost');
const Plantio = require('../models/Plantio');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;

    const [deteccoes, previsoes, ofertas, posts, plantios] = await Promise.all([
      Deteccao.find({ usuarioId: userId }).sort({ timestamp: -1 }).limit(50),
      Prediction.find({ usuarioId: userId }).sort({ createdAt: -1 }).limit(10),
      MarketData.find({ usuarioId: userId }).sort({ createdAt: -1 }).limit(10),
      CommunityPost.find({ usuarioId: userId }).sort({ createdAt: -1 }).limit(10),
      Plantio.find({ usuarioId: userId }).sort({ createdAt: -1 })
    ]);

    const totalScans = deteccoes.length;
    const totalPragas = deteccoes.reduce((acc, d) => acc + (d.total_count || 0), 0);
    const perdaTotal = deteccoes.reduce((acc, d) => acc + (d.perdaEstimada || 0), 0);
    const alertasAtivos = deteccoes.filter(d => d.nivelRisco === 'ALTO' || d.nivelRisco === 'CRÍTICO').length;
    const pragasPorTipo = {};

    deteccoes.forEach(d => {
      if (d.detections) {
        d.detections.forEach(det => {
          const classe = det.class_pt || det.class || 'desconhecido';
          pragasPorTipo[classe] = (pragasPorTipo[classe] || 0) + 1;
        });
      }
    });

    const tendenciaDeteccoes = [];
    const ultimos7Dias = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    ultimos7Dias.forEach(data => {
      const count = deteccoes.filter(d =>
        new Date(d.timestamp).toISOString().split('T')[0] === data
      ).length;
      tendenciaDeteccoes.push({ data, quantidade: count });
    });

    // Plantio stats
    const totalPlantios = plantios.length;
    const plantiosAtivos = plantios.filter(p => p.status !== 'concluido' && p.status !== 'cancelado' && p.status !== 'arquivado').length;
    const plantiosConcluidos = plantios.filter(p => p.status === 'concluido').length;
    const areaTotal = plantios.reduce((acc, p) => acc + (p.area || 0), 0);
    const investimentoTotal = plantios.reduce((acc, p) => acc + (p.plano?.investimento?.total || p.orcamento || 0), 0);
    const rendaTotal = plantios.reduce((acc, p) => acc + (p.plano?.producao?.rendaBrutaEstimada || 0), 0);
    const lucroTotal = plantios.reduce((acc, p) => acc + (p.plano?.producao?.lucroEstimado || 0), 0);
    const plantiosPorCultura = {};
    plantios.forEach(p => {
      const c = p.cultura || 'outro';
      plantiosPorCultura[c] = (plantiosPorCultura[c] || 0) + 1;
    });
    const ultimosPlantios = plantios.slice(0, 5);

    res.json({
      success: true,
      data: {
        resumo: {
          totalScans,
          totalPragas,
          perdaTotal: Math.round(perdaTotal * 100) / 100,
          alertasAtivos,
          areasMonitoradas: [...new Set(deteccoes.map(d => d.localizacao))].length,
          culturasAfetadas: [...new Set(deteccoes.map(d => d.cultura).filter(Boolean))],
          totalPrevisoes: previsoes.length,
          totalOfertas: ofertas.length,
          totalPlantios,
          plantiosAtivos,
          plantiosConcluidos,
          areaTotal,
          investimentoTotal,
          rendaTotal,
          lucroTotal
        },
        pragasPorTipo: Object.entries(pragasPorTipo)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade),
        tendenciaDeteccoes,
        plantiosPorCultura: Object.entries(plantiosPorCultura)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade),
        ultimasDeteccoes: deteccoes.slice(0, 10),
        ultimasPrevisoes: previsoes.slice(0, 5),
        ultimasOfertas: ofertas.slice(0, 5),
        ultimosPlantios
      }
    });
  } catch (error) {
    next(error);
  }
};

const getEstatisticasGlobais = async (req, res, next) => {
  try {
    const [totalUsers, totalDeteccoes, totalPrevisoes, totalOfertas, totalPosts] = await Promise.all([
      require('../models/user').countDocuments({ platform: 'prognos-agri' }),
      Deteccao.countDocuments({ platform: 'prognos-agri' }),
      Prediction.countDocuments({ platform: 'prognos-agri' }),
      MarketData.countDocuments({ platform: 'prognos-agri' }),
      CommunityPost.countDocuments({ platform: 'prognos-agri' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDeteccoes,
        totalPrevisoes,
        totalOfertas,
        totalPosts,
        platform: 'prognos-agri',
        version: '2.0.0'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getEstatisticasGlobais };
