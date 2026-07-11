const Sensor = require('../models/sensor');

function simularLeitura(sensor) {
  const base = {
    humidade_solo: { valor: 45, variacao: 8, min: 10, max: 95, unidade: '%' },
    temperatura: { valor: 28, variacao: 3, min: 10, max: 45, unidade: '°C' },
    humidade_ar: { valor: 65, variacao: 10, min: 20, max: 100, unidade: '%' },
    chuva: { valor: 0, variacao: 2, min: 0, max: 50, unidade: 'mm/h' },
    fluxo_agua: { valor: 12, variacao: 5, min: 0, max: 100, unidade: 'L/min' },
    pressao: { valor: 1013, variacao: 5, min: 980, max: 1040, unidade: 'hPa' }
  };
  const cfg = base[sensor.tipo] || base.humidade_solo;
  const variacao = (Math.random() - 0.5) * 2 * cfg.variacao;
  const valor = Math.round(Math.max(cfg.min, Math.min(cfg.max, cfg.valor + variacao)) * 10) / 10;
  return { valor, unidade: cfg.unidade };
}

const getStatus = async (req, res) => {
  try {
    const userId = req.userId;
    let sensores = await Sensor.find({ userId }).sort({ createdAt: 1 });

    if (sensores.length === 0) {
      const defaults = [
        { nome: 'Sensor Talhão Norte', tipo: 'humidade_solo', localizacao: 'Talhão Norte', config: { limiteInferior: 30, limiteSuperior: 80 } },
        { nome: 'Sensor Talhão Sul', tipo: 'humidade_solo', localizacao: 'Talhão Sul', config: { limiteInferior: 25, limiteSuperior: 75 } },
        { nome: 'Temperatura Ambiente', tipo: 'temperatura', localizacao: 'Estação Central', config: { limiteInferior: 15, limiteSuperior: 35 } },
        { nome: 'Pluviómetro', tipo: 'chuva', localizacao: 'Área Aberta', config: { limiteInferior: 0, limiteSuperior: 10 } },
        { nome: 'Sensor Estufa', tipo: 'humidade_ar', localizacao: 'Estufa A', config: { limiteInferior: 40, limiteSuperior: 85 } },
      ];
      sensores = await Sensor.insertMany(defaults.map(d => ({ ...d, userId, simulado: true })));
    }

    const agora = Date.now();
    const leituras = sensores.map(s => {
      if (!s.ultimaLeitura || agora - new Date(s.ultimaLeitura).getTime() > (s.config.intervaloLeitura || 5) * 1000) {
        const { valor, unidade } = simularLeitura(s);
        s.leituras.push({ valor, timestamp: new Date() });
        if (s.leituras.length > 1440) s.leituras.shift();
        s.ultimaLeitura = valor;
      }
      return s;
    });

    for (const s of leituras) {
      await s.save();
    }

    const alertas = leituras
      .filter(s => {
        const val = s.leituras.length > 0 ? s.leituras[s.leituras.length - 1].valor : 0;
        return val < s.config.limiteInferior || val > s.config.limiteSuperior;
      })
      .map(s => ({
        sensorId: s._id,
        nome: s.nome,
        tipo: s.tipo,
        valor: s.leituras.length > 0 ? s.leituras[s.leituras.length - 1].valor : 0,
        limiteInferior: s.config.limiteInferior,
        limiteSuperior: s.config.limiteSuperior,
        mensagem: s.leituras.length > 0 && s.leituras[s.leituras.length - 1].valor < s.config.limiteInferior
          ? `${s.nome}: ${s.leituras[s.leituras.length - 1].valor} abaixo do mínimo (${s.config.limiteInferior})`
          : `${s.nome}: ${s.leituras[s.leituras.length - 1].valor} acima do máximo (${s.config.limiteSuperior})`
      }));

    const precisaIrrigar = leituras.some(s =>
      s.tipo === 'humidade_solo' &&
      s.leituras.length > 0 &&
      s.leituras[s.leituras.length - 1].valor < s.config.limiteInferior
    );

    res.json({
      success: true,
      data: {
        sensores: leituras.map(s => ({
          _id: s._id,
          nome: s.nome,
          tipo: s.tipo,
          localizacao: s.localizacao,
          ativo: s.ativo,
          simulado: s.simulado,
          config: s.config,
          ultimoValor: s.leituras.length > 0 ? s.leituras[s.leituras.length - 1] : null,
          ultimasLeituras: s.leituras.slice(-60)
        })),
        alertas,
        irrigacaoAtiva: precisaIrrigar,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro getStatus:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar estado da irrigação' });
  }
};

const criarSensor = async (req, res) => {
  try {
    const { nome, tipo, localizacao, config } = req.body;
    if (!nome || !tipo) {
      return res.status(400).json({ success: false, message: 'Nome e tipo são obrigatórios' });
    }
    const sensor = await Sensor.create({
      userId: req.userId,
      nome, tipo, localizacao: localizacao || '',
      config: { limiteInferior: 20, limiteSuperior: 80, ...config },
      simulado: false
    });
    res.status(201).json({ success: true, data: sensor });
  } catch (error) {
    console.error('Erro criarSensor:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar sensor' });
  }
};

const atualizarSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, localizacao, ativo, config } = req.body;
    const update = {};
    if (nome !== undefined) update.nome = nome;
    if (tipo !== undefined) update.tipo = tipo;
    if (localizacao !== undefined) update.localizacao = localizacao;
    if (ativo !== undefined) update.ativo = ativo;
    if (config !== undefined) update.config = { ...config };

    const sensor = await Sensor.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: update },
      { new: true }
    );
    if (!sensor) return res.status(404).json({ success: false, message: 'Sensor não encontrado' });
    res.json({ success: true, data: sensor });
  } catch (error) {
    console.error('Erro atualizarSensor:', error);
    res.status(500).json({ success: false, message: 'Erro ao actualizar sensor' });
  }
};

const removerSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await Sensor.findOneAndDelete({ _id: id, userId: req.userId });
    if (!sensor) return res.status(404).json({ success: false, message: 'Sensor não encontrado' });
    res.json({ success: true, message: 'Sensor removido' });
  } catch (error) {
    console.error('Erro removerSensor:', error);
    res.status(500).json({ success: false, message: 'Erro ao remover sensor' });
  }
};

const controlarIrrigacao = async (req, res) => {
  try {
    const { acao } = req.body;
    if (!['ligar', 'desligar'].includes(acao)) {
      return res.status(400).json({ success: false, message: 'Acção deve ser "ligar" ou "desligar"' });
    }

    res.json({
      success: true,
      message: acao === 'ligar' ? 'Irrigação ligada' : 'Irrigação desligada',
      data: { irrigacaoAtiva: acao === 'ligar', timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Erro controlarIrrigacao:', error);
    res.status(500).json({ success: false, message: 'Erro ao controlar irrigação' });
  }
};

const getHistorico = async (req, res) => {
  try {
    const { sensorId, horas } = req.query;
    const filter = { userId: req.userId };
    if (sensorId) filter._id = sensorId;

    const sensores = await Sensor.find(filter).select('nome tipo localizacao leituras config');
    const limite = parseInt(horas) || 24;
    const desde = new Date(Date.now() - limite * 60 * 60 * 1000);

    const data = sensores.map(s => ({
      _id: s._id,
      nome: s.nome,
      tipo: s.tipo,
      localizacao: s.localizacao,
      leituras: s.leituras.filter(l => l.timestamp >= desde),
      config: s.config
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro getHistorico:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar histórico' });
  }
};

module.exports = {
  getStatus,
  criarSensor,
  atualizarSensor,
  removerSensor,
  controlarIrrigacao,
  getHistorico
};
