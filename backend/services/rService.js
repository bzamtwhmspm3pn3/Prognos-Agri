// backend/services/rService.js
const axios = require('axios');

class RService {
  constructor() {
    this.baseURL = process.env.R_API_URL || 'http://localhost:8002';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  async predictGlmLoss(data) {
    try {
      const response = await this.client.post('/api/r/glm/predict', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro R GLM:', error.message);
      throw error;
    }
  }

  async classifyRiskRF(data) {
    try {
      const response = await this.client.post('/api/r/rf/classify', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro R RF:', error.message);
      throw error;
    }
  }

  async getDescriptiveStats(data) {
    try {
      const response = await this.client.post('/api/r/stats/descriptive', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro R stats:', error.message);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/api/r/health');
      return { status: 'online', ...response.data };
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  }
}

module.exports = new RService();