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
    const { nome, cultura, provincia, municipio, area, dataColheita, producaoEstimada, receitaEstimada, orcamento, dataInicio } = req.body;
    const plantio = new Plantio({
      usuarioId: req.userId,
      nome, cultura, provincia, municipio, area, dataColheita, producaoEstimada, receitaEstimada, orcamento, dataInicio,
      status: 'planeado', progresso: 0,
      fases: FASES_PADRAO.map(f => ({ ...f, status: 'pendente' }))
    });
    await plantio.save();
    res.status(201).json({ success: true, plantio });
  } catch (error) {
    next(error);
  }
};

exports.salvarPlanoCompleto = async (req, res, next) => {
  try {
    const { nome, cultura, provincia, municipio, area, orcamento, dataInicio, plano } = req.body;
    if (!nome || !cultura || !area) {
      return res.status(400).json({ success: false, message: 'Nome, cultura e área são obrigatórios' });
    }
    const plantio = new Plantio({
      usuarioId: req.userId,
      nome, cultura, provincia, municipio, area, orcamento, dataInicio,
      status: 'planeado', progresso: 5,
      plano: {
        resumo: plano?.resumo || '',
        recomendacaoLocalizacao: plano?.localizacao?.recomendacao || '',
        municipiosRecomendados: plano?.localizacao?.municipios || [],
        investimento: {
          sementes: plano?.investimento?.itens?.[0]?.custo || 0,
          fertilizantes: plano?.investimento?.itens?.[1]?.custo || 0,
          defensivos: plano?.investimento?.itens?.[2]?.custo || 0,
          maoObra: plano?.investimento?.itens?.[3]?.custo || 0,
          maquinario: plano?.investimento?.itens?.[4]?.custo || 0,
          imprevistos: plano?.investimento?.itens?.[5]?.custo || 0,
          total: plano?.investimento?.total || 0
        },
        capitalHumano: {
          trabalhadoresPermanentes: plano?.capitalHumano?.permanentes || 0,
          trabalhadoresSazonais: plano?.capitalHumano?.sazonais || 0,
          tecnicosOperadores: plano?.capitalHumano?.tecnicos || 0,
          total: plano?.capitalHumano?.total || 0
        },
        cronograma: (plano?.cronograma || []).map(c => ({
          atividade: c.atividade,
          inicio: new Date(c.inicio),
          fim: new Date(c.fim),
          dias: c.dias || 0
        })),
        producao: {
          produtividadeTonHa: plano?.producao?.produtividade || 0,
          areaTotalHa: Number(area),
          ProducaoTotalTon: plano?.producao?.producaoTotal || 0,
          precoEstimado: plano?.producao?.precoEstimado || 0,
          rendaBrutaEstimada: plano?.producao?.rendaBruta || 0,
          lucroEstimado: plano?.producao?.lucroEstimado || 0
        },
        riscos: [
          ...(plano?.riscos?.climaticos || []).map(r => ({ tipo: 'climatico', descricao: r.nome, mitigacao: r.mitigacao })),
          ...(plano?.riscos?.pragas || []).map(r => ({ tipo: 'praga', descricao: r.nome, mitigacao: r.mitigacao })),
          ...(plano?.riscos?.doencas || []).map(r => ({ tipo: 'doenca', descricao: r.nome, mitigacao: r.mitigacao }))
        ]
      },
      fases: FASES_PADRAO.map(f => ({ ...f, status: 'pendente' }))
    });

    const ultimoCrono = plano?.cronograma?.[plano.cronograma.length - 1];
    if (ultimoCrono?.fim) plantio.dataFimPrevista = new Date(ultimoCrono.fim);

    await plantio.save();
    res.status(201).json({ success: true, plantio });
  } catch (error) {
    next(error);
  }
};

exports.listarPlantios = async (req, res, next) => {
  try {
    const { arquivados, status } = req.query;
    const filter = { usuarioId: req.userId };
    if (arquivados !== 'sim') filter.status = { $ne: 'arquivado' };
    if (status) filter.status = status;
    const plantios = await Plantio.find(filter).sort('-createdAt');
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

exports.atualizarPlantio = async (req, res, next) => {
  try {
    const plantio = await Plantio.findOne({ _id: req.params.id, usuarioId: req.userId });
    if (!plantio) return res.status(404).json({ success: false, message: 'Plantio não encontrado' });

    const campos = ['nome', 'cultura', 'provincia', 'municipio', 'area', 'orcamento', 'dataInicio', 'dataColheita', 'producaoEstimada', 'producaoReal', 'receitaEstimada', 'receitaReal'];
    campos.forEach(c => { if (req.body[c] !== undefined) plantio[c] = req.body[c]; });

    await plantio.save();
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
    if (status === 'em_andamento' && !fase.dataInicio) {
      fase.dataInicio = new Date();
    }
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
    if (todasConcluidas) { plantio.concluido = true; plantio.status = 'concluido'; }

    await plantio.save();
    res.json({ success: true, plantio });
  } catch (error) {
    next(error);
  }
};

exports.mudarStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['planeado', 'ativo', 'em_andamento', 'concluido', 'arquivado', 'cancelado'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status inválido' });
    }
    const plantio = await Plantio.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.userId },
      { status, concluido: status === 'concluido' },
      { new: true }
    );
    if (!plantio) return res.status(404).json({ success: false, message: 'Plantio não encontrado' });
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

exports.estatisticas = async (req, res, next) => {
  try {
    const plantios = await Plantio.find({ usuarioId: req.userId });
    const total = plantios.length;
    const planeados = plantios.filter(p => p.status === 'planeado').length;
    const ativos = plantios.filter(p => p.status === 'ativo' || p.status === 'em_andamento').length;
    const concluidos = plantios.filter(p => p.status === 'concluido').length;
    const arquivados = plantios.filter(p => p.status === 'arquivado').length;
    const cancelados = plantios.filter(p => p.status === 'cancelado').length;
    const areaTotal = plantios.reduce((a, p) => a + (p.area || 0), 0);
    const orcamentoTotal = plantios.reduce((a, p) => a + (p.orcamento || 0), 0);
    const porCultura = {};
    plantios.forEach(p => { porCultura[p.cultura] = (porCultura[p.cultura] || 0) + 1; });
    const fasesConcluidas = plantios.reduce((a, p) => a + p.fases.filter(f => f.status === 'concluido').length, 0);
    const fasesTotal = plantios.reduce((a, p) => a + p.fases.length, 0);

    res.json({ success: true, data: {
      total, planeados, ativos, concluidos, arquivados, cancelados, areaTotal, orcamentoTotal,
      culturas: Object.entries(porCultura).map(([nome, quantidade]) => ({ nome, quantidade })),
      progressoGeral: fasesTotal > 0 ? Math.round((fasesConcluidas / fasesTotal) * 100) : 0
    }});
  } catch (error) {
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

// --- Dados regionais para fallback determinístico ---
const DADOS_REGIONAIS = {
  'Bié': { solos: 'ferralíticos, bem drenados', clima: 'tropical de altitude, ameno', culturas: { 'milho': { produtividade: 3.5, municipios: ['Cuíto', 'Chinguar', 'Andulo', 'Nharea', 'Cunhinga'] }, 'feijão': { produtividade: 1.2, municipios: ['Cuíto', 'Chinguar', 'Cunhinga'] }, 'soja': { produtividade: 2.0, municipios: ['Andulo', 'Nharea'] } } },
  'Huambo': { solos: 'ferralíticos argilosos', clima: 'tropical de altitude, fresco', culturas: { 'milho': { produtividade: 4.0, municipios: ['Huambo', 'Caála', 'Bailundo', 'Londuimbali', 'Ecunha'] }, 'feijão': { produtividade: 1.5, municipios: ['Huambo', 'Caála', 'Bailundo'] }, 'batata': { produtividade: 10.0, municipios: ['Huambo', 'Caála', 'Londuimbali'] } } },
  'Malanje': { solos: 'argilosos e arenosos', clima: 'tropical húmido', culturas: { 'milho': { produtividade: 3.0, municipios: ['Malanje', 'Cacuso', 'Calandula', 'Cambundi-Catembo'] }, 'mandioca': { produtividade: 12.0, municipios: ['Malanje', 'Cacuso', 'Massango'] }, 'café': { produtividade: 0.8, municipios: ['Calandula', 'Cambundi-Catembo', 'Quela'] } } },
  'Benguela': { solos: 'aluviões férteis', clima: 'semi-árido a tropical', culturas: { 'milho': { produtividade: 2.5, municipios: ['Benguela', 'Lobito', 'Bocoio', 'Balombo', 'Ganda'] }, 'feijão': { produtividade: 1.0, municipios: ['Benguela', 'Bocoio', 'Ganda'] } } },
  'Huíla': { solos: 'ferralíticos bem drenados', clima: 'tropical de altitude', culturas: { 'milho': { produtividade: 3.8, municipios: ['Lubango', 'Quipungo', 'Matala', 'Chibia', 'Cacula'] }, 'feijão': { produtividade: 1.3, municipios: ['Lubango', 'Chibia', 'Quipungo'] }, 'batata': { produtividade: 12.0, municipios: ['Lubango', 'Matala'] } } },
  'Luanda': { solos: 'sedimentares arenosos', clima: 'tropical seco', culturas: { 'hortícolas': { produtividade: 8.0, municipios: ['Icolo e Bengo', 'Quiçama', 'Viana'] }, 'tomate': { produtividade: 15.0, municipios: ['Icolo e Bengo', 'Quiçama'] } } },
  'Kwanza Sul': { solos: 'argilosos férteis', clima: 'tropical húmido', culturas: { 'café': { produtividade: 0.7, municipios: ['Sumbe', 'Amboim', 'Cassongue', 'Cela', 'Quibala'] }, 'milho': { produtividade: 2.8, municipios: ['Sumbe', 'Cela', 'Quibala'] } } },
  'Uíge': { solos: 'argilosos férteis', clima: 'tropical húmido', culturas: { 'café': { produtividade: 0.9, municipios: ['Uíge', 'Negage', 'Puri', 'Bembe', 'Ambuíla'] }, 'mandioca': { produtividade: 11.0, municipios: ['Uíge', 'Negage', 'Puri'] }, 'milho': { produtividade: 2.5, municipios: ['Uíge', 'Negage'] } } },
  'Moxico': { solos: 'arenosos', clima: 'tropical húmido', culturas: { 'milho': { produtividade: 2.0, municipios: ['Luena', 'Camanongue', 'Léua'] }, 'mandioca': { produtividade: 8.0, municipios: ['Luena', 'Léua'] } } }
};

const CULTURA_ALIASES = { 'feijao': 'feijão', 'cafe': 'café', 'batata-doce': 'batata', 'amendoim': 'amendoim' };
const PRECOS_TON = { 'milho': 150000, 'feijão': 350000, 'soja': 200000, 'café': 800000, 'mandioca': 80000, 'batata': 120000, 'hortícolas': 150000, 'tomate': 200000, 'arroz': 250000, 'amendoim': 90000 };

function gerarPlanoDeterministico(cultura, provincia, municipio, area, orcamento, dataInicio) {
  cultura = CULTURA_ALIASES[cultura] || cultura;
  const regiao = DADOS_REGIONAIS[provincia] || DADOS_REGIONAIS['Huambo'];
  const infoCultura = regiao?.culturas[cultura] || { produtividade: 2.0, municipios: [municipio || 'Não especificado'] };

  const recomendacao = `Para ${cultura} na província de ${provincia} (solos ${regiao.solos}, clima ${regiao.clima}), os municípios mais propícios são:\n${(infoCultura.municipios || []).slice(0, 3).map((m, i) => {
    const justificativas = ['solos mais férteis e bem drenados', 'melhores condições climáticas', 'tradição agrícola e acesso a insumos'];
    return `${m}: ${justificativas[i] || 'boa aptidão agrícola'}`;
  }).join('\n')}`;

  const orc = orcamento || (area * 200000);
  const invest = {
    sementes: Math.round(orc * 0.20),
    fertilizantes: Math.round(orc * 0.25),
    defensivos: Math.round(orc * 0.10),
    maoObra: Math.round(orc * 0.25),
    maquinario: Math.round(orc * 0.10),
    imprevistos: Math.round(orc * 0.10),
    total: orc
  };

  const capH = {
    trabalhadoresPermanentes: Math.max(1, Math.round(area / 10)),
    trabalhadoresSazonais: Math.max(2, Math.round(area / 2)),
    tecnicosOperadores: Math.max(1, Math.round(area / 20)),
    total: Math.max(1, Math.round(area / 10)) + Math.max(2, Math.round(area / 2)) + Math.max(1, Math.round(area / 20))
  };

  const inicio = dataInicio ? new Date(dataInicio) : new Date();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const cronograma = [
    { atividade: 'Preparo do solo', inicio: new Date(inicio), fim: addDays(inicio, 7), dias: 7 },
    { atividade: 'Plantio', inicio: addDays(inicio, 7), fim: addDays(inicio, 12), dias: 5 },
    { atividade: 'Adubação', inicio: addDays(inicio, 12), fim: addDays(inicio, 15), dias: 3 },
    { atividade: 'Irrigação', inicio: addDays(inicio, 15), fim: addDays(inicio, 45), dias: 30 },
    { atividade: 'Controle de pragas', inicio: addDays(inicio, 30), fim: addDays(inicio, 40), dias: 10 },
    { atividade: 'Colheita', inicio: addDays(inicio, 120), fim: addDays(inicio, 135), dias: 15 },
    { atividade: 'Pós-colheita', inicio: addDays(inicio, 135), fim: addDays(inicio, 149), dias: 14 }
  ];

  const produtividade = infoCultura.produtividade || 2.0;
  const producaoTotal = Math.round(produtividade * area * 100) / 100;
  const preco = PRECOS_TON[cultura] || 100000;
  const rendaBruta = Math.round(producaoTotal * preco);
  const lucro = rendaBruta - (orcamento || orc);

  const riscos = [
    { tipo: 'climatico', descricao: 'Seca prolongada durante a floração', mitigacao: 'Sistemas de irrigação de apoio' },
    { tipo: 'climatico', descricao: 'Excesso de chuvas na colheita', mitigacao: 'Drenagem adequada do solo' },
    { tipo: 'praga', descricao: 'Lagarta-do-cartucho (Spodoptera frugiperda)', mitigacao: 'Monitoramento semanal com armadilhas' },
    { tipo: 'praga', descricao: 'Mosca-branca', mitigacao: 'Controlo biológico com parasitoides' },
    { tipo: 'doenca', descricao: 'Ferrugem comum', mitigacao: 'Uso de sementes certificadas e tratadas' },
    { tipo: 'doenca', descricao: 'Helmintosporiose', mitigacao: 'Rotação de culturas (mínimo 3 anos)' }
  ];

  return {
    resumo: `Plano completo para cultivo de ${cultura} em ${area} hectares na província de ${provincia}, ${municipio || ''}. Investimento total de ${(orcamento || orc).toLocaleString()} Kz com retorno estimado de ${rendaBruta.toLocaleString()} Kz.`,
    localizacao: { recomendacao, municipios: (infoCultura.municipios || []).slice(0, 3).map(m => ({ nome: m, justificativa: 'Condições edafoclimáticas favoráveis' })) },
    investimento: {
      itens: [
        { nome: 'Sementes', custo: invest.sementes, percentagem: 20 },
        { nome: 'Fertilizantes', custo: invest.fertilizantes, percentagem: 25 },
        { nome: 'Defensivos', custo: invest.defensivos, percentagem: 10 },
        { nome: 'Mão de obra', custo: invest.maoObra, percentagem: 25 },
        { nome: 'Maquinário', custo: invest.maquinario, percentagem: 10 },
        { nome: 'Imprevistos (10%)', custo: invest.imprevistos, percentagem: 10 }
      ],
      total: invest.total
    },
    capitalHumano: { permanentes: capH.trabalhadoresPermanentes, sazonais: capH.trabalhadoresSazonais, tecnicos: capH.tecnicosOperadores, total: capH.total },
    cronograma: cronograma.map(c => ({ ...c, inicio: c.inicio.toISOString().split('T')[0], fim: c.fim.toISOString().split('T')[0] })),
    producao: { produtividade, unidade: 'ton/ha', area, producaoTotal, precoEstimado: preco, rendaBruta, lucroEstimado: lucro },
    riscos: {
      climaticos: riscos.filter(r => r.tipo === 'climatico').map(r => ({ nome: r.descricao, icone: '☀️', mitigacao: r.mitigacao })),
      pragas: riscos.filter(r => r.tipo === 'praga').map(r => ({ nome: r.descricao, icone: '🐛', mitigacao: r.mitigacao })),
      doencas: riscos.filter(r => r.tipo === 'doenca').map(r => ({ nome: r.descricao, icone: '🍄', mitigacao: r.mitigacao }))
    }
  };
}

exports.planearCompleto = async (req, res, next) => {
  try {
    const { cultura, provincia, municipio, area, orcamento, dataInicio } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `És um especialista agrícola angolano honesto e realista. Gera um plano completo de plantio com dados realistas para Angola.

Cultura: ${cultura}
Província: ${provincia}
Município: ${municipio || 'Não especificado'}
Área: ${area} hectares
Orçamento: ${orcamento || 'Não especificado'} Kz
Data início: ${dataInicio || 'Não especificada'}

REGRAS OBRIGATÓRIAS:
1. Sé REALISTA. Se a cultura NÃO é adequada para a província/município, indica isso claramente no resumo e nas recomendações. NÃO sejas sempre otimista.
2. Se o orçamento é insuficiente para a área, indica-o e sugere alternativas mais viáveis.
3. Produtividade deve refletir condições REAIS de Angola (não valores de países desenvolvidos). Milho em Angola: 0.8-2.5 ton/ha dependendo do manejo. Feijão: 0.5-1.5 ton/ha. Mandioca: 8-15 ton/ha.
4. Preços devem refletir o mercado angolano real.
5. Riscos devem ser específicos da região, não genéricos.
6. O campo "resumo" deve conter uma análise honesta incluindo: adequação do solo/clima, viabilidade económica, alertas se a cultura não for recomendada, e recomendação final (recomendar, desaconselhar, ou recomendar com ressalvas).
7. Se desaconselha a cultura, explica por que e sugere alternativas.

Responde APENAS com JSON válido (sem markdown, sem comentários):
{
  "resumo": "Análise honesta e contextualizada do plano. Se a cultura não é adequada, diz-o. Inclui viabilidade económica, alertas, e recomendação final.",
  "localizacao": {
    "recomendacao": "Análise realista do solo, clima e condições da região. Se não é favorável, indica isso.",
    "municipios": [
      {"nome": "Município X", "justificativa": "solo/clima adequados ou não"}
    ]
  },
  "investimento": {
    "itens": [
      {"nome": "Sementes", "custo": 0, "percentagem": 0},
      {"nome": "Fertilizantes", "custo": 0, "percentagem": 0},
      {"nome": "Defensivos", "custo": 0, "percentagem": 0},
      {"nome": "Mão de obra", "custo": 0, "percentagem": 0},
      {"nome": "Maquinário", "custo": 0, "percentagem": 0},
      {"nome": "Imprevistos (10%)", "custo": 0, "percentagem": 0}
    ],
    "total": 0
  },
  "capitalHumano": {
    "permanentes": 0,
    "sazonais": 0,
    "tecnicos": 0,
    "total": 0
  },
  "cronograma": [
    {"atividade": "Preparo do solo", "inicio": "data", "fim": "data", "dias": 0},
    {"atividade": "Plantio", "inicio": "data", "fim": "data", "dias": 0},
    {"atividade": "Adubação", "inicio": "data", "fim": "data", "dias": 0},
    {"atividade": "Irrigação", "inicio": "data", "fim": "data", "dias": 0},
    {"atividade": "Controlo de pragas", "inicio": "data", "fim": "data", "dias": 0},
    {"atividade": "Colheita", "inicio": "data", "fim": "data", "dias": 0},
    {"atividade": "Pós-colheita", "inicio": "data", "fim": "data", "dias": 0}
  ],
  "producao": {
    "produtividade": 0,
    "unidade": "ton/ha",
    "area": ${area},
    "producaoTotal": 0,
    "precoEstimado": 0,
    "rendaBruta": 0,
    "lucroEstimado": 0
  },
  "riscos": {
    "climaticos": [
      {"nome": "Risco específico da região", "icone": "☀️", "mitigacao": "recomendação específica e acionável"}
    ],
    "pragas": [
      {"nome": "Praga específica da cultura/região", "icone": "🐛", "mitigacao": "recomendação específica e acionável"}
    ],
    "doencas": [
      {"nome": "Doença específica da cultura/região", "icone": "🍄", "mitigacao": "recomendação específica e acionável"}
    ]
  }
}

Usa dados realistas baseados na cultura, província e área. Preços em Kz angolanos. Produtividade em ton/hectare.`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
          { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 4096 } },
          { timeout: 30000 }
        );

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const plano = JSON.parse(jsonMatch[0]);
            plano._fonte = 'gemini';
            return res.json({ success: true, plano });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini falhou, usando fallback:', geminiErr.message);
      }
    }

    const plano = gerarPlanoDeterministico(cultura, provincia, municipio, area, orcamento, dataInicio);
    plano._fonte = 'deterministico';
    res.json({ success: true, plano });
  } catch (error) {
    console.error('Erro planear:', error.message);
    next(error);
  }
};
