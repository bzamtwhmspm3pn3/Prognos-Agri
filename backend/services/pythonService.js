const axios = require('axios');
const FormData = require('form-data');

class PythonService {
  constructor() {
    this.baseURL = process.env.PYTHON_API_URL || 'http://localhost:8001';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // aumentado para 60 segundos (antes 30000)
    });
  }

  async detectFromImage(imageBuffer, filename) {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, { filename });

      const response = await this.client.post('/detect', formData, {
        headers: formData.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro Python detect:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      throw new Error('Falha na detecção de imagem');
    }
  }

  async predictLosses(data) {
    try {
      const response = await this.client.post('/predict/losses', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro Python predict:', error.message);
      throw error;
    }
  }

  async analyzeRisk(data) {
    try {
      const response = await this.client.post('/analyze/risk', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro Python risk:', error.message);
      throw error;
    }
  }

  async getCameraStream() {
    return `${this.baseURL}/detect/stream`;
  }

  async healthCheck() {
    console.log('🔍 Health check Python - a iniciar...');
    console.log('   URL base (this.baseURL):', this.baseURL);
    console.log('   PYTHON_API_URL env:', process.env.PYTHON_API_URL);
    console.log('   A fazer GET para:', this.baseURL + '/health');
    try {
      const response = await this.client.get('/health');
      console.log('✅ Resposta do Python - status:', response.status);
      console.log('   Dados:', response.data);
      return { status: 'online', ...response.data };
    } catch (error) {
      console.error('❌ Erro no health check do Python:');
      console.error('   Mensagem:', error.message);
      if (error.code) console.error('   Código:', error.code);
      if (error.response) {
        console.error('   Status HTTP:', error.response.status);
        console.error('   Dados da resposta:', error.response.data);
      } else if (error.request) {
        console.error('   Pedido feito mas sem resposta (timeout?)');
      } else {
        console.error('   Erro na configuração da requisição:', error.message);
      }
      return { status: 'offline', error: error.message };
    }
  }
}

module.exports = new PythonService();