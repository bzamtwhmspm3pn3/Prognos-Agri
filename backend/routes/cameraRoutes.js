const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');

// Test camera connectivity
router.post('/test', protect, async (req, res) => {
  try {
    const { url, username, password } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL é obrigatória' });
    }

    const config = { timeout: 8000, responseType: 'arraybuffer' };
    if (username && password) {
      config.auth = { username, password };
    }

    const response = await axios.get(url, config);
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('image') || response.data.length > 1000) {
      res.json({ success: true, message: 'Conexão OK!', contentType });
    } else {
      res.json({ success: false, message: 'Resposta não é uma imagem válida' });
    }
  } catch (error) {
    const msg = error.code === 'ECONNABORTED' ? 'Timeout - câmara não respondeu'
      : error.code === 'ECONNREFUSED' ? 'Conexão recusada - verifique URL e porta'
      : error.response?.status === 401 ? 'Autenticação necessária - verifique credenciais'
      : `Falha: ${error.message}`;
    res.json({ success: false, message: msg });
  }
});

// Proxy frame from camera (avoids mixed content)
router.get('/frame', protect, async (req, res) => {
  try {
    const { url, username, password } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL é obrigatória' });
    }

    const config = { timeout: 8000, responseType: 'arraybuffer' };
    if (username && password) {
      config.auth = { username, password };
    }

    const response = await axios.get(url, config);
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(response.data));
  } catch (error) {
    res.status(502).json({ success: false, message: `Erro ao buscar frame: ${error.message}` });
  }
});

module.exports = router;
