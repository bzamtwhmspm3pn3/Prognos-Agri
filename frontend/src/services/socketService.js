import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });
  socket.on('connect', () => console.log('🔌 Socket conectado'));
  socket.on('connect_error', (err) => console.error('Socket erro:', err.message));
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinGrupo = (grupoId) => {
  if (socket?.connected) socket.emit('join-grupo', grupoId);
};

export const leaveGrupo = (grupoId) => {
  if (socket?.connected) socket.emit('leave-grupo', grupoId);
};

export const sendMessage = (grupoId, conteudo, imagemUrl = null, respondendoA = null) => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error('Socket não conectado'));
    socket.emit('send-message', { grupoId, conteudo, imagemUrl, respondendoA }, (response) => {
      if (response?.error) reject(new Error(response.error));
      else resolve(response);
    });
  });
};

export const onNewMessage = (callback) => {
  if (socket) socket.on('new-message', callback);
};

export const onApproved = (callback) => {
  if (socket) socket.on('approved', callback);
};

export const offNewMessage = (callback) => {
  if (socket) socket.off('new-message', callback);
};

export const offApproved = () => {
  if (socket) socket.off('approved');
};
