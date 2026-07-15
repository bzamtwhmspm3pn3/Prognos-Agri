import api from './api';

export const criarPlantio = async (dados) => {
  const response = await api.post('/plantio', dados);
  return response.data;
};

export const salvarPlanoCompleto = async (dados) => {
  const response = await api.post('/plantio/salvar-plano', dados);
  return response.data;
};

export const listarPlantios = async (params = {}) => {
  const response = await api.get('/plantio', { params });
  return response.data;
};

export const getPlantio = async (id) => {
  const response = await api.get(`/plantio/${id}`);
  return response.data;
};

export const atualizarPlantio = async (id, dados) => {
  const response = await api.put(`/plantio/${id}`, dados);
  return response.data;
};

export const atualizarFase = async (id, dados) => {
  const response = await api.put(`/plantio/${id}/fase`, dados);
  return response.data;
};

export const mudarStatus = async (id, status) => {
  const response = await api.patch(`/plantio/${id}/status`, { status });
  return response.data;
};

export const perguntarIA = async (dados) => {
  const response = await api.post('/plantio/ia/perguntar', dados);
  return response.data;
};

export const planearCompleto = async (dados) => {
  const response = await api.post('/plantio/ia/planear-completo', dados);
  return response.data;
};

export const estatisticas = async () => {
  const response = await api.get('/plantio/estatisticas');
  return response.data;
};

export const eliminarPlantio = async (id) => {
  const response = await api.delete(`/plantio/${id}`);
  return response.data;
};
