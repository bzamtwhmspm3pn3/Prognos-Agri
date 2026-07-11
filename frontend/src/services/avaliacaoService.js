import api from './api';

export const getAvaliacoes = async (params = {}) => {
  const response = await api.get('/avaliacoes', { params });
  return response.data;
};

export const createAvaliacao = async (data) => {
  const response = await api.post('/avaliacoes', data);
  return response.data;
};

export const responderAvaliacao = async (id, texto) => {
  const response = await api.post(`/avaliacoes/${id}/responder`, { texto });
  return response.data;
};

export const aprovarAvaliacao = async (id) => {
  const response = await api.put(`/avaliacoes/${id}/aprovar`);
  return response.data;
};
