const express = require('express');
const router = express.Router();
const axios = require('axios');

const MERCADO_YANGUE_API = process.env.MERCADO_YANGUE_API_URL || 'https://mercadoyangue-i3in.onrender.com/api';

router.all('*', async (req, res) => {
  try {
    const targetUrl = `${MERCADO_YANGUE_API}${req.path}`;
    const headers = { 'Content-Type': 'application/json' };

    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
      params: req.query,
      headers,
      timeout: 30000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Erro no proxy Mercado Yangue:', err.message);
    res.status(502).json({
      success: false,
      message: 'Erro ao comunicar com o Mercado Yangue.',
    });
  }
});

module.exports = router;
