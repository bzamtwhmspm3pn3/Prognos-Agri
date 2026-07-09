import api from './api';

export const enviarMensagem = async (mensagem, sessaoId = null) => {
  const response = await api.post('/chatbot/mensagem', { mensagem, sessaoId });
  return response.data;
};

export const getHistorico = async () => {
  const response = await api.get('/chatbot/historico');
  return response.data;
};

export const getSessao = async (id) => {
  const response = await api.get(`/chatbot/sessao/${id}`);
  return response.data;
};

export const deletarSessao = async (id) => {
  const response = await api.delete(`/chatbot/sessao/${id}`);
  return response.data;
};
