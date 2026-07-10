import axios from 'axios';

const MERCADO_YANGUE_API = process.env.REACT_APP_MERCADO_YANGUE_API_URL || 'https://mercadoyangue-i3in.onrender.com/api';

const api = axios.create({
  baseURL: MERCADO_YANGUE_API,
  headers: { 'Content-Type': 'application/json' },
});

export const listarProdutos = async () => {
  const response = await api.get('/produtos');
  return response.data;
};

export const getProduto = async (id) => {
  const response = await api.get(`/produtos/${id}`);
  return response.data;
};

export const MERCADO_YANGUE_SITE = 'https://mercadoyangue.netlify.app';

export default api;
