import api from './api';

export const criarPlantio = async (dados) => {
  const response = await api.post('/plantio', dados);
  return response.data;
};

export const listarPlantios = async () => {
  const response = await api.get('/plantio');
  return response.data;
};

export const getPlantio = async (id) => {
  const response = await api.get(`/plantio/${id}`);
  return response.data;
};

export const atualizarFase = async (id, dados) => {
  const response = await api.put(`/plantio/${id}/fase`, dados);
  return response.data;
};

export const perguntarIA = async (dados) => {
  const response = await api.post('/plantio/ia/perguntar', dados);
  return response.data;
};

export const eliminarPlantio = async (id) => {
  const response = await api.delete(`/plantio/${id}`);
  return response.data;
};
