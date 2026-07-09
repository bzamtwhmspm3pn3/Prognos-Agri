import api from './api';

export const registarProducao = async (data) => {
  const response = await api.post('/rastreabilidade/registar', data);
  return response.data;
};

export const getHistoricoRastreabilidade = async () => {
  const response = await api.get('/rastreabilidade/historico');
  return response.data;
};

export const consultarProduto = async (codigo) => {
  const response = await api.get(`/rastreabilidade/produto/${codigo}`);
  return response.data;
};

export const getCertificado = async (id) => {
  const response = await api.get(`/rastreabilidade/certificado/${id}`);
  return response.data;
};
