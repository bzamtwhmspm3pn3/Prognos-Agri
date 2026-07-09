const Prediction = require('../models/Prediction');
const axios = require('axios');

const getPrevisaoClimatica = async (req, res, next) => {
  try {
    const { provincia, municipio, dias = 7 } = req.query;
    const previsoes = await Prediction.find({
      usuarioId: req.userId,
      tipo: 'climatica',
      ...(provincia && { 'localizacao.provincia': provincia })
    })
      .sort({ dataPrevisao: -1 })
      .limit(parseInt(dias));

    res.json({ success: true, data: previsoes });
  } catch (error) {
    next(error);
  }
};

const criarPrevisaoClimatica = async (req, res, next) => {
  try {
    const { localizacao, cultura } = req.body;

    const weatherData = await fetchWeatherData(localizacao);
    const previsao = new Prediction({
      usuarioId: req.userId,
      tipo: 'climatica',
      localizacao,
      cultura,
      dataPrevisao: new Date(),
      previsaoClimatica: weatherData,
      alertas: gerarAlertas(weatherData),
      recomendacaoPlantio: gerarRecomendacaoPlantio(weatherData, cultura),
      riscoPragas: calcularRiscoPragas(weatherData, cultura),
      confianca: 75,
      fonte: 'openweather',
      dadosBrutos: weatherData
    });

    await previsao.save();
    res.status(201).json({ success: true, data: previsao });
  } catch (error) {
    next(error);
  }
};

const getHistoricoPrevisoes = async (req, res, next) => {
  try {
    const { tipo, limite = 30 } = req.query;
    const filter = { usuarioId: req.userId };
    if (tipo) filter.tipo = tipo;

    const previsoes = await Prediction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));

    res.json({ success: true, data: previsoes });
  } catch (error) {
    next(error);
  }
};

const getAlertasAtivos = async (req, res, next) => {
  try {
    const alertas = await Prediction.find({
      'alertas.ativo': true,
      usuarioId: req.userId
    })
      .select('localizacao alertas dataPrevisao')
      .sort({ dataPrevisao: -1 })
      .limit(20);

    const alertasFlat = alertas.flatMap(p =>
      p.alertas.filter(a => a.ativo).map(a => ({
        ...a.toObject(),
        provincia: p.localizacao.provincia,
        dataPrevisao: p.dataPrevisao
      }))
    );

    res.json({ success: true, data: alertasFlat });
  } catch (error) {
    next(error);
  }
};

async function fetchWeatherData(localizacao) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return generateSimulatedData(localizacao);
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: `${localizacao.municipio || localizacao.provincia},AO`,
          appid: apiKey,
          units: 'metric',
          lang: 'pt'
        }
      }
    );

    return {
      temperatura: {
        min: response.data.main.temp_min,
        max: response.data.main.temp_max,
        media: response.data.main.temp
      },
      humidade: response.data.main.humidity,
      precipitacao: response.data.rain?.['1h'] || 0,
      vento: {
        velocidade: response.data.wind.speed,
        direcao: response.data.wind.deg?.toString() || 'N/A'
      },
      condicao: response.data.weather[0].description,
      icone: response.data.weather[0].icon
    };
  } catch (err) {
    return generateSimulatedData(localizacao);
  }
}

function generateSimulatedData(localizacao) {
  const tempBase = 25 + Math.random() * 10;
  return {
    temperatura: {
      min: tempBase - 5,
      max: tempBase + 5,
      media: tempBase
    },
    humidade: 60 + Math.random() * 30,
    precipitacao: Math.random() * 20,
    vento: {
      velocidade: 5 + Math.random() * 15,
      direcao: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]
    },
    condicao: ['Céu limpo', 'Parcialmente nublado', 'Nublado', 'Chuva fraca', 'Chuva moderada'][Math.floor(Math.random() * 5)],
    icone: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)]
  };
}

function gerarAlertas(weatherData) {
  const alertas = [];
  const { temperatura, vento, precipitacao } = weatherData;

  if (temperatura.min < 10) {
    alertas.push({
      tipo: 'geada',
      nivel: temperatura.min < 5 ? 'severo' : 'moderado',
      mensagem: `Risco de geada com temperatura mínima de ${temperatura.min.toFixed(1)}°C`,
      data: new Date(),
      ativo: true
    });
  }

  if (vento.velocidade > 30) {
    alertas.push({
      tipo: 'vento_forte',
      nivel: vento.velocidade > 50 ? 'extremo' : 'moderado',
      mensagem: `Ventos fortes de ${vento.velocidade.toFixed(1)} km/h podem danificar culturas`,
      data: new Date(),
      ativo: true
    });
  }

  if (precipitacao > 50) {
    alertas.push({
      tipo: 'chuva_intensa',
      nivel: precipitacao > 100 ? 'severo' : 'moderado',
      mensagem: `Precipitação intensa de ${precipitacao.toFixed(1)} mm`,
      data: new Date(),
      ativo: true
    });
  }

  if (temperatura.max > 38) {
    alertas.push({
      tipo: 'calor_extremo',
      nivel: temperatura.max > 42 ? 'extremo' : 'severo',
      mensagem: `Calor extremo com máxima de ${temperatura.max.toFixed(1)}°C`,
      data: new Date(),
      ativo: true
    });
  }

  return alertas;
}

function gerarRecomendacaoPlantio(weatherData, cultura) {
  const { temperatura, precipitacao, humidade } = weatherData;
  const culturasRecomendadas = [];

  if (temperatura.media >= 20 && temperatura.media <= 35) {
    culturasRecomendadas.push('Milho', 'Feijão', 'Mandioca');
  }
  if (temperatura.media >= 15 && temperatura.media <= 30 && precipitacao > 10) {
    culturasRecomendadas.push('Tomate', 'Cebola', 'Alface');
  }
  if (humidade > 60 && precipitacao > 20) {
    culturasRecomendadas.push('Arroz', 'Batata-doce');
  }
  if (cultura && !culturasRecomendadas.includes(cultura)) {
    culturasRecomendadas.unshift(cultura);
  }

  const favoravel = temperatura.media >= 18 && temperatura.media <= 38 && precipitacao >= 5;

  return {
    favoravel,
    culturasRecomendadas: culturasRecomendadas.length > 0 ? culturasRecomendadas : ['Consulte um técnico agrícola'],
    periodoIdeal: favoravel ? 'Condições favoráveis para plantio imediato' : 'Aguarde melhores condições',
    observacoes: favoravel
      ? 'As condições climáticas estão adequadas para o plantio. Mantenha irrigação complementar se necessário.'
      : 'Condições climáticas não ideais para plantio. Considere usar estufas ou irrigação controlada.'
  };
}

function calcularRiscoPragas(weatherData, cultura) {
  const { temperatura, humidade, precipitacao } = weatherData;
  let score = 0;

  if (humidade > 80) score += 30;
  if (temperatura.media > 28) score += 20;
  if (precipitacao > 30) score += 15;
  if (temperatura.media > 32 && humidade > 70) score += 25;

  const nivel = score > 60 ? 'alto' : score > 40 ? 'medio' : score > 20 ? 'baixo' : 'baixo';
  const pragas = [];

  if (humidade > 75) {
    pragas.push('Fungos', 'Mofo', 'Lagarta-do-cartucho');
  }
  if (temperatura.media > 28) {
    pragas.push('Mosca-branca', 'Pulgão', 'Ácaro');
  }
  if (precipitacao > 30) {
    pragas.push('Lesmas', 'Caracóis', 'Nematoides');
  }

  return {
    nivel,
    pragasProvaveis: pragas,
    recomendacoes: [
      'Monitorar regularmente as culturas',
      'Manter irrigação equilibrada',
      nivel === 'alto' ? 'Aplicar defensivos biológicos preventivamente' : 'Manter práticas culturais adequadas',
      'Consultar técnico agrícola se necessário'
    ]
  };
}

module.exports = {
  getPrevisaoClimatica,
  criarPrevisaoClimatica,
  getHistoricoPrevisoes,
  getAlertasAtivos
};
