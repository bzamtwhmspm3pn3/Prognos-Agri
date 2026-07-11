const CommunityPost = require('../models/CommunityPost');
const Group = require('../models/Group');

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
    const grupos = await Group.find({ ativo: true })
      .populate('criadorId', 'username')
      .sort({ createdAt: -1 });

    const gruposComInfo = await Promise.all(
      grupos.map(async (g) => {
        const count = await CommunityPost.countDocuments({ grupo: g.nome, status: 'ativo' });
        return {
          _id: g._id,
          nome: g.nome,
          descricao: g.descricao,
          foto: g.foto,
          categoria: g.categoria,
          criador: g.criadorId?.username || 'Desconhecido',
          totalMembros: g.membros.length,
          totalPosts: count,
          criadoEm: g.createdAt
        };
      })
    );

    res.json({ success: true, data: gruposComInfo });
  } catch (error) {
    next(error);
  }
};

const criarGrupo = async (req, res, next) => {
  try {
    const { nome, descricao, categoria } = req.body;
    if (!nome) {
      return res.status(400).json({ success: false, message: 'Nome do grupo é obrigatório' });
    }

    const existente = await Group.findOne({ nome, ativo: true });
    if (existente) {
      return res.status(409).json({ success: false, message: 'Já existe um grupo com este nome' });
    }

    const grupo = await Group.create({
      nome: nome.trim(),
      descricao: descricao || '',
      categoria: categoria || 'geral',
      criadorId: req.userId,
      membros: [{ usuarioId: req.userId, cargo: 'admin' }]
    });

    res.status(201).json({ success: true, data: grupo });
  } catch (error) {
    next(error);
  }
};

const entrarGrupo = async (req, res, next) => {
  try {
    const grupo = await Group.findById(req.params.id);
    if (!grupo) {
      return res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    }

    if (grupo.membros.some(m => m.usuarioId.toString() === req.userId)) {
      return res.json({ success: true, message: 'Já és membro deste grupo' });
    }

    grupo.membros.push({ usuarioId: req.userId, cargo: 'membro' });
    await grupo.save();

    res.json({ success: true, data: grupo });
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
  criarGrupo,
  entrarGrupo,
  getTagsPopulares
};
