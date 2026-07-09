import api from './api';

export const listarProdutos = async (params = {}) => {
  const response = await api.get('/market/produtos', { params });
  return response.data;
};

export const criarOferta = async (data) => {
  const response = await api.post('/market/ofertas', data);
  return response.data;
};

export const listarOfertas = async (params = {}) => {
  const response = await api.get('/market/ofertas', { params });
  return response.data;
};

export const getMinhasOfertas = async () => {
  const response = await api.get('/market/minhas-ofertas');
  return response.data;
};

export const atualizarOferta = async (id, data) => {
  const response = await api.put(`/market/ofertas/${id}`, data);
  return response.data;
};

export const registrarContacto = async (id) => {
  const response = await api.post(`/market/ofertas/${id}/contacto`);
  return response.data;
};

export const getPrecosMedios = async () => {
  const response = await api.get('/market/precos-medios');
  return response.data;
};
