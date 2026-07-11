const axios = require('axios');

const coordenadasAngola = {
  'Bengo': { lat: -8.5, lon: 14.0 },
  'Benguela': { lat: -12.5, lon: 13.5 },
  'Bié': { lat: -12.5, lon: 17.5 },
  'Cabinda': { lat: -5.5, lon: 12.3 },
  'Cuando Cubango': { lat: -16.0, lon: 20.0 },
  'Cuanza Norte': { lat: -9.0, lon: 15.0 },
  'Cuanza Sul': { lat: -10.5, lon: 14.5 },
  'Cunene': { lat: -16.5, lon: 16.0 },
  'Huambo': { lat: -12.8, lon: 15.7 },
  'Huíla': { lat: -15.0, lon: 14.5 },
  'Luanda': { lat: -8.8, lon: 13.2 },
  'Lunda Norte': { lat: -8.0, lon: 19.0 },
  'Lunda Sul': { lat: -10.0, lon: 20.5 },
  'Malanje': { lat: -9.5, lon: 16.5 },
  'Moxico': { lat: -12.0, lon: 21.0 },
  'Namibe': { lat: -15.0, lon: 12.5 },
  'Uíge': { lat: -7.5, lon: 15.0 },
  'Zaire': { lat: -6.5, lon: 14.0 }
};

function getEstacao(provincia) {
  const mes = new Date().getMonth() + 1;
  if (provincia === 'Bié') {
    if (mes >= 10 || mes <= 4) return 'chuvosa';
    return 'cacimbo';
  }
  if (mes >= 10 || mes <= 4) return 'chuvosa';
  return 'cacimbo';
}

function gerarRecomendacao(previsao, provincia) {
  const estacao = getEstacao(provincia);
  const tempMedia = previsao.dias.reduce((a, d) => a + (d.tempMax + d.tempMin) / 2, 0) / previsao.dias.length;
  const chuvaTotal = previsao.dias.reduce((a, d) => a + (d.precipitacao || 0), 0);
  const humMedia = previsao.dias.reduce((a, d) => a + (d.humidade || 0), 0) / previsao.dias.length;

  let favoravel = tempMedia >= 18 && tempMedia <= 35 && chuvaTotal > 0;
  let riscoPragas = 'baixo';
  let culturas = [];

  if (estacao === 'cacimbo') {
    culturas = ['Mandioca', 'Batata-doce', 'Amendoim'];
    if (provincia === 'Bié') {
      favoravel = tempMedia >= 15 && tempMedia <= 30;
      riscoPragas = humMedia > 70 ? 'medio' : 'baixo';
    }
  } else {
    culturas = ['Milho', 'Feijão', 'Mandioca', 'Tomate'];
    if (chuvaTotal > 30) riscoPragas = 'alto';
    else if (chuvaTotal > 10) riscoPragas = 'medio';
  }

  return {
    estacao,
    favoravel,
    culturas,
    riscoPragas,
    mensagem: estacao === 'cacimbo'
      ? `Período de Cacimbo em ${provincia}. Temperaturas amenas. Culturas recomendadas: ${culturas.join(', ')}. Irrigação essencial.`
      : `Época chuvosa em ${provincia}. Condições propícias para: ${culturas.join(', ')}. Monitorizar humidade excessiva.`
  };
}

const getPrevisao = async (req, res) => {
  try {
    const { provincia, dias = 7 } = req.query;
    const prov = provincia || 'Bié';
    const coords = coordenadasAngola[prov];

    if (!coords) {
      return res.status(400).json({ success: false, message: `Província "${prov}" não encontrada` });
    }

    const maxDias = Math.min(parseInt(dias), 7);

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        daily: [
          'temperature_2m_max', 'temperature_2m_min',
          'precipitation_sum', 'precipitation_probability_max',
          'wind_speed_10m_max', 'relative_humidity_2m_max',
          'weathercode'
        ].join(','),
        current_weather: true,
        timezone: 'auto',
        forecast_days: maxDias
      },
      timeout: 10000
    });

    const hoje = new Date();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const diasPrevisao = response.data.daily.time.map((data, i) => {
      const d = new Date(data + 'T12:00:00');
      return {
        dia: diasSemana[d.getDay()],
        data: d.toLocaleDateString('pt-PT'),
        tempMax: Math.round(response.data.daily.temperature_2m_max[i]),
        tempMin: Math.round(response.data.daily.temperature_2m_min[i]),
        precipitacao: Math.round(response.data.daily.precipitation_sum[i] * 10) / 10,
        probPrecipitacao: response.data.daily.precipitation_probability_max[i] || 0,
        humidade: response.data.daily.relative_humidity_2m_max[i] || 0,
        vento: Math.round(response.data.daily.wind_speed_10m_max[i] || 0),
        weathercode: response.data.daily.weathercode[i] || 0
      };
    });

    const current = response.data.current_weather;

    const previsao = {
      provincia: prov,
      atual: {
        temperatura: current.temperature,
        vento: current.windspeed,
        weathercode: current.weathercode,
        timestamp: current.time
      },
      dias: diasPrevisao,
      recomendacao: gerarRecomendacao({ dias: diasPrevisao }, prov)
    };

    res.json({ success: true, data: previsao });
  } catch (error) {
    console.error('Erro weatherController:', error.message);
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ success: false, message: 'API climática demorou demasiado. Tente novamente.' });
    }
    res.status(500).json({ success: false, message: 'Erro ao obter previsão climática' });
  }
};

module.exports = { getPrevisao };
