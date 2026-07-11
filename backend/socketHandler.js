const GroupMessage = require('./models/GroupMessage');
const Group = require('./models/Group');
const jwt = require('jsonwebtoken');

const connectedUsers = {};

function setupSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token não fornecido'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.email || 'User';
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket conectado: ${socket.userId}`);

    socket.join(`user:${socket.userId}`);

    socket.on('join-grupo', async (grupoId) => {
      try {
        const grupo = await Group.findById(grupoId);
        if (!grupo || !grupo.membros.some(m => m.usuarioId.toString() === socket.userId.toString())) return;
        socket.join(`grupo:${grupoId}`);
        connectedUsers[`${grupoId}:${socket.userId}`] = socket.id;
        socket.grupoId = grupoId;
      } catch (err) {
        console.error('Erro ao entrar no grupo socket:', err);
      }
    });

    socket.on('leave-grupo', (grupoId) => {
      socket.leave(`grupo:${grupoId}`);
      delete connectedUsers[`${grupoId}:${socket.userId}`];
    });

    socket.on('send-message', async (data, callback) => {
      try {
        const { grupoId, conteudo, imagemUrl, respondendoA } = data;
        const grupo = await Group.findById(grupoId);
        if (!grupo || !grupo.membros.some(m => m.usuarioId.toString() === socket.userId.toString())) {
          return callback?.({ error: 'Não autorizado' });
        }

        const mensagem = await GroupMessage.create({
          grupoId,
          usuarioId: socket.userId,
          conteudo,
          tipo: imagemUrl ? 'imagem' : 'texto',
          imagemUrl: imagemUrl || undefined,
          respondendoA: respondendoA || null
        });

        const msg = await GroupMessage.findById(mensagem._id)
          .populate('usuarioId', 'username profile.nome profile.imagemPerfil.url');

        io.to(`grupo:${grupoId}`).emit('new-message', msg);
        callback?.({ success: true, data: msg });
      } catch (err) {
        console.error('Erro socket send-message:', err);
        callback?.({ error: 'Erro ao enviar mensagem' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket desconectado: ${socket.userId}`);
      if (socket.grupoId) {
        delete connectedUsers[`${socket.grupoId}:${socket.userId}`];
      }
    });
  });
}

module.exports = setupSocket;
