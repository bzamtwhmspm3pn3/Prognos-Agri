const CommunityPost = require('../models/CommunityPost');

const listarPosts = async (req, res, next) => {
  try {
    const { grupo, tag, tipo, page = 1, limite = 20 } = req.query;
    const filter = { status: 'ativo' };
    if (grupo) filter.grupo = grupo;
    if (tag) filter.tags = tag;
    if (tipo) filter.tipo = tipo;

    const total = await CommunityPost.countDocuments(filter);
    const posts = await CommunityPost.find(filter)
      .populate('usuarioId', 'username profile.nome profile.imagemPerfil.url')
      .sort(req.query.sort === 'popular' ? { 'stats.likes': -1 } : { createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(parseInt(limite));

    res.json({
      success: true,
      data: posts,
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

const criarPost = async (req, res, next) => {
  try {
    const post = new CommunityPost({
      ...req.body,
      usuarioId: req.userId
    });
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'stats.visualizacoes': 1 } },
      { new: true }
    ).populate('usuarioId', 'username profile.nome profile.imagemPerfil.url')
     .populate('comentarios.usuarioId', 'username profile.nome');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post não encontrado' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const comentar = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post não encontrado' });
    }

    post.comentarios.push({
      usuarioId: req.userId,
      usuarioNome: req.user.username,
      conteudo: req.body.conteudo
    });
    post.stats.comentarios = post.comentarios.length;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post não encontrado' });
    }

    const index = post.likesUsuarios.indexOf(req.userId);
    if (index > -1) {
      post.likesUsuarios.splice(index, 1);
      post.stats.likes -= 1;
    } else {
      post.likesUsuarios.push(req.userId);
      post.stats.likes += 1;
    }

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const listarGrupos = async (req, res, next) => {
  try {
    const grupos = await CommunityPost.distinct('grupo', { status: 'ativo' });
    const gruposComInfo = await Promise.all(
      grupos.map(async (grupo) => {
        const count = await CommunityPost.countDocuments({ grupo, status: 'ativo' });
        return { nome: grupo, totalPosts: count };
      })
    );

    res.json({ success: true, data: gruposComInfo.sort((a, b) => b.totalPosts - a.totalPosts) });
  } catch (error) {
    next(error);
  }
};

const getTagsPopulares = async (req, res, next) => {
  try {
    const tags = await CommunityPost.aggregate([
      { $match: { status: 'ativo', tags: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarPosts,
  criarPost,
  getPost,
  comentar,
  likePost,
  listarGrupos,
  getTagsPopulares
};
