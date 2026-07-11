const Avaliacao = require('../models/avaliacao');

const createAvaliacao = async (req, res) => {
  try {
    const { estrelas, comentario } = req.body;
    if (!estrelas || estrelas < 1 || estrelas > 5) {
      return res.status(400).json({ success: false, message: 'Avaliação deve ter entre 1 e 5 estrelas' });
    }

    const userId = req.userId || req.user?._id;
    const username = req.user?.username || 'Anónimo';

    const avaliacao = await Avaliacao.create({
      userId,
      username,
      estrelas,
      comentario,
      data: new Date(),
      aprovada: false
    });

    res.status(201).json({ success: true, data: avaliacao });
  } catch (error) {
    console.error('Erro createAvaliacao:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar avaliação' });
  }
};

const getAvaliacoes = async (req, res) => {
  try {
    const { aprovadas } = req.query;
    const filter = {};
    if (aprovadas === 'true') filter.aprovada = true;

    const avaliacoes = await Avaliacao.find(filter)
      .sort({ data: -1 })
      .limit(50)
      .populate('userId', 'username');

    const stats = await Avaliacao.aggregate([
      { $match: { aprovada: true } },
      {
        $group: {
          _id: null,
          media: { $avg: '$estrelas' },
          total: { $sum: 1 },
          distribuição: {
            $push: { $arrayToObject: [[{ k: { $toString: '$estrelas' }, v: 1 }]] }
          }
        }
      }
    ]);

    const mediaGeral = stats.length > 0 ? Math.round(stats[0].media * 10) / 10 : 0;
    const totalAvaliacoes = stats.length > 0 ? stats[0].total : 0;

    res.json({
      success: true,
      data: avaliacoes,
      stats: { media: mediaGeral, total: totalAvaliacoes }
    });
  } catch (error) {
    console.error('Erro getAvaliacoes:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar avaliações' });
  }
};

const responderAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ success: false, message: 'Resposta é obrigatória' });
    }

    const avaliacao = await Avaliacao.findByIdAndUpdate(
      id,
      {
        $set: {
          'resposta.texto': texto,
          'resposta.data': new Date(),
          'resposta.respondidoPor': req.userId || req.user?._id
        }
      },
      { new: true }
    );

    if (!avaliacao) {
      return res.status(404).json({ success: false, message: 'Avaliação não encontrada' });
    }

    res.json({ success: true, data: avaliacao });
  } catch (error) {
    console.error('Erro responderAvaliacao:', error);
    res.status(500).json({ success: false, message: 'Erro ao responder avaliação' });
  }
};

const aprovarAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;

    const avaliacao = await Avaliacao.findByIdAndUpdate(
      id,
      { $set: { aprovada: true } },
      { new: true }
    );

    if (!avaliacao) {
      return res.status(404).json({ success: false, message: 'Avaliação não encontrada' });
    }

    res.json({ success: true, data: avaliacao });
  } catch (error) {
    console.error('Erro aprovarAvaliacao:', error);
    res.status(500).json({ success: false, message: 'Erro ao aprovar avaliação' });
  }
};

module.exports = {
  createAvaliacao,
  getAvaliacoes,
  responderAvaliacao,
  aprovarAvaliacao
};
