import api from './api';

export const getIrrigacaoStatus = async () => {
  const response = await api.get('/irrigacao');
  return response.data;
};

export const criarSensor = async (data) => {
  const response = await api.post('/irrigacao/sensores', data);
  return response.data;
};

export const atualizarSensor = async (id, data) => {
  const response = await api.put(`/irrigacao/sensores/${id}`, data);
  return response.data;
};

export const removerSensor = async (id) => {
  const response = await api.delete(`/irrigacao/sensores/${id}`);
  return response.data;
};

export const controlarIrrigacao = async (acao) => {
  const response = await api.post('/irrigacao/controlar', { acao });
  return response.data;
};

export const getHistorico = async (params = {}) => {
  const response = await api.get('/irrigacao/historico', { params });
  return response.data;
};
