import api from './api';

export const getPrevisaoClimatica = async (params = {}) => {
  const response = await api.get('/weather/previsao', { params });
  return response.data;
};
