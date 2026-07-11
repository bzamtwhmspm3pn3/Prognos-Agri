import api from './api';

export const listarPosts = async (params = {}) => {
  const response = await api.get('/community/posts', { params });
  return response.data;
};

export const criarPost = async (data) => {
  const response = await api.post('/community/posts', data);
  return response.data;
};

export const getPost = async (id) => {
  const response = await api.get(`/community/posts/${id}`);
  return response.data;
};

export const comentar = async (id, conteudo) => {
  const response = await api.post(`/community/posts/${id}/comentar`, { conteudo });
  return response.data;
};

export const likePost = async (id) => {
  const response = await api.post(`/community/posts/${id}/like`);
  return response.data;
};

export const listarGrupos = async () => {
  const response = await api.get('/community/grupos');
  return response.data;
};

export const criarGrupo = async (data) => {
  const response = await api.post('/community/grupos', data);
  return response.data;
};

export const entrarGrupo = async (id) => {
  const response = await api.post(`/community/grupos/${id}/entrar`);
  return response.data;
};

export const solicitarEntrada = async (id) => {
  const response = await api.post(`/community/grupos/${id}/entrar`);
  return response.data;
};

export const aprovarMembro = async (id, usuarioId) => {
  const response = await api.post(`/community/grupos/${id}/aprovar/${usuarioId}`);
  return response.data;
};

export const convidarMembro = async (id, usuarioId) => {
  const response = await api.post(`/community/grupos/${id}/convidar/${usuarioId}`);
  return response.data;
};

export const removerMembro = async (id, usuarioId) => {
  const response = await api.delete(`/community/grupos/${id}/membros/${usuarioId}`);
  return response.data;
};

export const listarMensagens = async (id, params = {}) => {
  const response = await api.get(`/community/grupos/${id}/mensagens`, { params });
  return response.data;
};

export const enviarMensagem = async (id, conteudo, respondendoA = null) => {
  const response = await api.post(`/community/grupos/${id}/mensagens`, { conteudo, respondendoA });
  return response.data;
};

export const getMensagensNaoLidas = async () => {
  const response = await api.get('/community/mensagens/nao-lidas');
  return response.data;
};

export const getTagsPopulares = async () => {
  const response = await api.get('/community/tags-populares');
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/community/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
