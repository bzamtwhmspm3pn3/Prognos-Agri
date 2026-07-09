// frontend/src/services/deteccaoApi.js
import api from './api';

export const deteccaoApi = {
  // Guardar nova deteção
  salvar: async (dados) => {
    try {
      const response = await api.post('/deteccoes', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar deteção:', error);
      throw error;
    }
  },
  
  // Buscar deteções do utilizador
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/deteccoes?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar deteções:', error);
      throw error;
    }
  },
  
  // Marcar como resolvida
  resolver: async (id) => {
    try {
      const response = await api.patch(`/deteccoes/${id}/resolver`);
      return response.data;
    } catch (error) {
      console.error('Erro ao resolver deteção:', error);
      throw error;
    }
  },
  
  // Apagar deteção
  apagar: async (id) => {
    try {
      const response = await api.delete(`/deteccoes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao apagar deteção:', error);
      throw error;
    }
  },
  
  // Obter estatísticas
  estatisticas: async () => {
    try {
      const response = await api.get('/deteccoes/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
};