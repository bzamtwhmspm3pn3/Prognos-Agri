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

export const getTagsPopulares = async () => {
  const response = await api.get('/community/tags-populares');
  return response.data;
};
