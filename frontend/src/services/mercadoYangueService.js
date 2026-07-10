import api from './api';

export const listarProdutos = async () => {
  const response = await api.get('/mercado-yangue/produtos');
  return response.data;
};

export const getProduto = async (id) => {
  const response = await api.get(`/mercado-yangue/produtos/${id}`);
  return response.data;
};

export const MERCADO_YANGUE_SITE = 'https://mercadoyangue.netlify.app';
