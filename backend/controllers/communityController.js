const CommunityPost = require('../models/CommunityPost');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const crypto = require('crypto');

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
    const { nome, descricao, categoria, tipo } = req.body;
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
      tipo: tipo || 'publico',
      conviteCodigo: crypto.randomBytes(4).toString('hex'),
      criadorId: req.userId,
      membros: [{ usuarioId: req.userId, cargo: 'admin' }]
    });

    await GroupMessage.create({
      grupoId: grupo._id,
      usuarioId: req.userId,
      conteudo: `${req.user?.username || 'Alguém'} criou o grupo "${grupo.nome}"`,
      tipo: 'sistema'
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

const solicitarEntrada = async (req, res, next) => {
  try {
    const grupo = await Group.findById(req.params.id);
    if (!grupo) return res.status(404).json({ success: false, message: 'Grupo não encontrado' });

    if (grupo.membros.some(m => m.usuarioId.toString() === req.userId)) {
      return res.json({ success: true, message: 'Já és membro' });
    }
    if (grupo.pedidosPendentes?.some(p => p.usuarioId.toString() === req.userId)) {
      return res.json({ success: true, message: 'Pedido já enviado' });
    }

    if (grupo.tipo === 'publico') {
      grupo.membros.push({ usuarioId: req.userId, cargo: 'membro' });
      await grupo.save();
      await GroupMessage.create({ grupoId: grupo._id, usuarioId: req.userId, conteudo: `${req.user?.username || 'Alguém'} entrou no grupo`, tipo: 'sistema' });
      return res.json({ success: true, data: grupo });
    }

    grupo.pedidosPendentes.push({ usuarioId: req.userId });
    await grupo.save();
    res.json({ success: true, message: 'Pedido enviado. Aguarda aprovação de um admin.' });
  } catch (error) { next(error); }
};

const aprovarMembro = async (req, res, next) => {
  try {
    const grupo = await Group.findById(req.params.id);
    if (!grupo) return res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    if (!grupo.membros.some(m => m.usuarioId.toString() === req.userId && (m.cargo === 'admin' || m.cargo === 'moderador'))) {
      return res.status(403).json({ success: false, message: 'Só administradores podem aprovar' });
    }

    const pedido = grupo.pedidosPendentes.find(p => p.usuarioId.toString() === req.params.usuarioId);
    if (!pedido) return res.status(404).json({ success: false, message: 'Pedido não encontrado' });

    grupo.membros.push({ usuarioId: req.params.usuarioId, cargo: 'membro' });
    grupo.pedidosPendentes = grupo.pedidosPendentes.filter(p => p.usuarioId.toString() !== req.params.usuarioId);
    await grupo.save();
    await GroupMessage.create({ grupoId: grupo._id, usuarioId: req.userId, conteudo: `Membro aprovado`, tipo: 'sistema' });
    res.json({ success: true, data: grupo });
  } catch (error) { next(error); }
};

const convidarMembro = async (req, res, next) => {
  try {
    const grupo = await Group.findById(req.params.id);
    if (!grupo) return res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    if (!grupo.membros.some(m => m.usuarioId.toString() === req.userId && (m.cargo === 'admin' || m.cargo === 'moderador'))) {
      return res.status(403).json({ success: false, message: 'Só administradores podem convidar' });
    }
    if (grupo.membros.some(m => m.usuarioId.toString() === req.params.usuarioId)) {
      return res.json({ success: true, message: 'Já é membro' });
    }
    grupo.membros.push({ usuarioId: req.params.usuarioId, cargo: 'membro' });
    await grupo.save();
    await GroupMessage.create({ grupoId: grupo._id, usuarioId: req.userId, conteudo: `Novo membro adicionado`, tipo: 'sistema' });
    res.json({ success: true, data: grupo });
  } catch (error) { next(error); }
};

const removerMembro = async (req, res, next) => {
  try {
    const grupo = await Group.findById(req.params.id);
    if (!grupo) return res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    if (!grupo.membros.some(m => m.usuarioId.toString() === req.userId && (m.cargo === 'admin' || m.cargo === 'moderador'))) {
      return res.status(403).json({ success: false, message: 'Só administradores podem remover' });
    }
    grupo.membros = grupo.membros.filter(m => m.usuarioId.toString() !== req.params.usuarioId);
    await grupo.save();
    res.json({ success: true, data: grupo });
  } catch (error) { next(error); }
};

const enviarMensagem = async (req, res, next) => {
  try {
    const grupo = await Group.findById(req.params.id);
    if (!grupo) return res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    if (!grupo.membros.some(m => m.usuarioId.toString() === req.userId)) {
      return res.status(403).json({ success: false, message: 'Não és membro deste grupo' });
    }

    const mensagem = await GroupMessage.create({
      grupoId: req.params.id,
      usuarioId: req.userId,
      conteudo: req.body.conteudo,
      respondendoA: req.body.respondendoA || null
    });

    const msg = await GroupMessage.findById(mensagem._id)
      .populate('usuarioId', 'username profile.nome profile.imagemPerfil.url');

    res.status(201).json({ success: true, data: msg });
  } catch (error) { next(error); }
};

const listarMensagens = async (req, res, next) => {
  try {
    const { limite = 50, antes } = req.query;
    const filter = { grupoId: req.params.id };
    if (antes) filter._id = { $lt: antes };

    const mensagens = await GroupMessage.find(filter)
      .populate('usuarioId', 'username profile.nome profile.imagemPerfil.url')
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));

    await GroupMessage.updateMany(
      { grupoId: req.params.id, lidoPor: { $ne: req.userId } },
      { $addToSet: { lidoPor: req.userId } }
    );

    res.json({ success: true, data: mensagens.reverse() });
  } catch (error) { next(error); }
};

const getMensagensNaoLidas = async (req, res, next) => {
  try {
    const grupos = await Group.find({ 'membros.usuarioId': req.userId });
    const naoLidas = await Promise.all(grupos.map(async g => {
      const count = await GroupMessage.countDocuments({ grupoId: g._id, lidoPor: { $ne: req.userId }, tipo: 'texto' });
      return { grupoId: g._id, count };
    }));
    res.json({ success: true, data: naoLidas.filter(n => n.count > 0) });
  } catch (error) { next(error); }
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
  solicitarEntrada,
  aprovarMembro,
  convidarMembro,
  removerMembro,
  entrarGrupo,
  enviarMensagem,
  listarMensagens,
  getMensagensNaoLidas,
  getTagsPopulares
};
