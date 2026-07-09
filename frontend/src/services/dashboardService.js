import api from './api';

export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getEstatisticasGlobais = async () => {
  const response = await api.get('/dashboard/estatisticas-globais');
  return response.data;
};
