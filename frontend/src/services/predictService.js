import api from './api';

export const getPrevisaoClimatica = async (params = {}) => {
  const response = await api.get('/predict/climatica', { params });
  return response.data;
};

export const criarPrevisaoClimatica = async (data) => {
  const response = await api.post('/predict/climatica', data);
  return response.data;
};

export const getHistoricoPrevisoes = async (params = {}) => {
  const response = await api.get('/predict/historico', { params });
  return response.data;
};

export const getAlertasAtivos = async () => {
  const response = await api.get('/predict/alertas');
  return response.data;
};
