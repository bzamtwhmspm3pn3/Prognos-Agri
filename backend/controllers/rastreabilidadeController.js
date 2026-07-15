const { v4: uuidv4 } = require('uuid');
const Rastreabilidade = require('../models/Rastreabilidade');

const registarProducao = async (req, res, next) => {
  try {
    const { produto, talhao, coordenadas, quantidade, unidade, qualidade } = req.body;

    if (!produto || !produto.nome) {
      return res.status(400).json({ success: false, message: 'Produto e nome são obrigatórios' });
    }

    const codigoRastreio = `PA-${Date.now().toString(36).toUpperCase()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    const registo = new Rastreabilidade({
      platform: 'prognos-agri',
      usuarioId: req.userId,
      codigoRastreio,
      produto: {
        nome: produto.nome,
        categoria: produto.categoria,
        variedade: produto.variedade || ''
      },
      producao: {
        talhao: talhao || '',
        coordenadas: coordenadas || {},
        quantidade: quantidade || 0,
        unidade: unidade || 'kg',
        qualidade: qualidade || 'bom',
        dataColheita: new Date()
      },
      certificacao: {
        emissao: new Date(),
        valido: true,
        hashBlockchain: `0x${uuidv4().replace(/-/g, '').substring(0, 32)}`
      }
    });

    await registo.save();

    res.status(201).json({
      success: true,
      data: registo,
      qrData: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rastreabilidade/${codigoRastreio}`
    });
  } catch (error) {
    next(error);
  }
};

const getHistorico = async (req, res, next) => {
  try {
    const registos = await Rastreabilidade.find({ usuarioId: req.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: registos });
  } catch (error) {
    next(error);
  }
};

const consultarProduto = async (req, res, next) => {
  try {
    const { codigo } = req.params;
    const registo = await Rastreabilidade.findOne({ codigoRastreio: codigo.toUpperCase() })
      .populate('usuarioId', 'username profile.nome');

    if (!registo) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado. Verifique o código de rastreio.'
      });
    }

    res.json({ success: true, data: registo });
  } catch (error) {
    next(error);
  }
};

const getCertificado = async (req, res, next) => {
  try {
    const certificado = await Rastreabilidade.findOne({
      _id: req.params.id,
      usuarioId: req.userId
    });

    if (!certificado) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    res.json({ success: true, data: certificado });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registarProducao,
  getHistorico,
  consultarProduto,
  getCertificado
};
