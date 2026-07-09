const MarketData = require('../models/MarketData');

const listarProdutos = async (req, res, next) => {
  try {
    const { categoria, provincia, search, page = 1, limite = 20 } = req.query;
    const filter = { tipo: 'produto', status: 'ativo' };
    if (categoria) filter['produto.categoria'] = categoria;
    if (provincia) filter['localizacao.provincia'] = provincia;
    if (search) filter['produto.nome'] = { $regex: search, $options: 'i' };

    const total = await MarketData.countDocuments(filter);
    const produtos = await MarketData.find(filter)
      .populate('usuarioId', 'username profile.nome profile.telefone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(parseInt(limite));

    res.json({
      success: true,
      data: produtos,
      pagination: {
        page: parseInt(page),
        limite: parseInt(limite),
        total,
        paginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    next(error);
  }
};

const criarOferta = async (req, res, next) => {
  try {
    const oferta = new MarketData({
      ...req.body,
      tipo: 'oferta',
      usuarioId: req.userId,
      vendedor: {
        ...req.body.vendedor,
        email: req.user.email
      }
    });

    await oferta.save();
    res.status(201).json({ success: true, data: oferta });
  } catch (error) {
    next(error);
  }
};

const listarOfertas = async (req, res, next) => {
  try {
    const { tipo, provincia, page = 1, limite = 20 } = req.query;
    const filter = { tipo: tipo || 'oferta', status: 'ativo' };
    if (provincia) filter['localizacao.provincia'] = provincia;

    const ofertas = await MarketData.find(filter)
      .populate('usuarioId', 'username profile.nome profile.telefone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(parseInt(limite));

    res.json({ success: true, data: ofertas });
  } catch (error) {
    next(error);
  }
};

const getMinhasOfertas = async (req, res, next) => {
  try {
    const ofertas = await MarketData.find({ usuarioId: req.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: ofertas });
  } catch (error) {
    next(error);
  }
};

const atualizarOferta = async (req, res, next) => {
  try {
    const oferta = await MarketData.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!oferta) {
      return res.status(404).json({ success: false, message: 'Oferta não encontrada' });
    }

    res.json({ success: true, data: oferta });
  } catch (error) {
    next(error);
  }
};

const registrarContacto = async (req, res, next) => {
  try {
    const oferta = await MarketData.findByIdAndUpdate(
      req.params.id,
      { $inc: { contactos: 1 } },
      { new: true }
    );

    res.json({ success: true, message: 'Contacto registado', data: oferta });
  } catch (error) {
    next(error);
  }
};

const getPrecosMedios = async (req, res, next) => {
  try {
    const precos = await MarketData.aggregate([
      { $match: { tipo: 'produto', status: 'ativo' } },
      {
        $group: {
          _id: {
            produto: '$produto.nome',
            categoria: '$produto.categoria',
            provincia: '$localizacao.provincia'
          },
          precoMedio: { $avg: '$preco.valor' },
          precoMin: { $min: '$preco.valor' },
          precoMax: { $max: '$preco.valor' },
          totalOfertas: { $sum: 1 }
        }
      },
      { $sort: { '_id.categoria': 1, '_id.produto': 1 } }
    ]);

    res.json({ success: true, data: precos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarProdutos,
  criarOferta,
  listarOfertas,
  getMinhasOfertas,
  atualizarOferta,
  registrarContacto,
  getPrecosMedios
};
