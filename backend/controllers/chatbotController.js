const ChatHistory = require('../models/ChatHistory');
const axios = require('axios');

exports.enviarMensagem = async (req, res, next) => {
  try {
    const { mensagem, sessaoId } = req.body;

    let historico = await ChatHistory.findOne({ usuarioId: req.userId });

    if (!historico) {
      historico = new ChatHistory({ usuarioId: req.userId, sessoes: [] });
    }

    let sessao;
    if (sessaoId) {
      sessao = historico.sessoes.id(sessaoId);
    }

    if (!sessao) {
      sessao = {
        titulo: mensagem.substring(0, 50),
        mensagens: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      historico.sessoes.push(sessao);
      sessao = historico.sessoes[historico.sessoes.length - 1];
    }

    sessao.mensagens.push({
      papel: 'user',
      conteudo: mensagem,
      timestamp: new Date()
    });

    const resposta = await gerarRespostaIA(mensagem, req.user);

    sessao.mensagens.push({
      papel: 'assistant',
      conteudo: resposta.texto,
      contexto: resposta.contexto,
      timestamp: new Date()
    });

    sessao.updatedAt = new Date();
    historico.ultimaMensagem = new Date();
    await historico.save();

    res.json({
      success: true,
      data: {
        mensagem: resposta.texto,
        contexto: resposta.contexto,
        sessoes: resposta.sugestoes || [],
        sessaoId: sessao._id
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistorico = async (req, res, next) => {
  try {
    const historico = await ChatHistory.findOne({ usuarioId: req.userId })
      .select('sessoes.titulo sessoes._id sessoes.createdAt sessoes.updatedAt ultimaMensagem');

    res.json({
      success: true,
      data: historico ? historico.sessoes.sort((a, b) => b.updatedAt - a.updatedAt) : []
    });
  } catch (error) {
    next(error);
  }
};

exports.getSessao = async (req, res, next) => {
  try {
    const historico = await ChatHistory.findOne({
      usuarioId: req.userId,
      'sessoes._id': req.params.id
    });

    if (!historico) {
      return res.status(404).json({ success: false, message: 'Sessão não encontrada' });
    }

    const sessao = historico.sessoes.id(req.params.id);
    res.json({ success: true, data: sessao });
  } catch (error) {
    next(error);
  }
};

exports.deletarSessao = async (req, res, next) => {
  try {
    const historico = await ChatHistory.findOne({ usuarioId: req.userId });
    if (!historico) {
      return res.status(404).json({ success: false, message: 'Histórico não encontrado' });
    }

    historico.sessoes = historico.sessoes.filter(s => s._id.toString() !== req.params.id);
    await historico.save();

    res.json({ success: true, message: 'Sessão removida' });
  } catch (error) {
    next(error);
  }
};

async function gerarRespostaIA(mensagem, user) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `És um assistente agrícola especializado em Angola. 
Responde à pergunta do utilizador de forma clara e útil, em português de Angola.
Contexto: O utilizador usa o Prognos Agri, uma plataforma agrícola.
Mantém a resposta curta (máx 200 palavras) e prática.

Pergunta: ${mensagem}`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        },
        { timeout: 15000 }
      );

      const texto = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (texto) {
        return {
          texto,
          contexto: { tipo: 'ia' },
          sugestoes: [
            'Como detectar pragas?',
            'Previsão do tempo',
            'Preços de produtos agrícolas',
            'Dicas de plantio'
          ]
        };
      }
    } catch (err) {
      console.error('Erro Gemini API:', err.message, err.response?.status, err.response?.data?.error?.message || '');
    }
  }
  return gerarRespostaLocal(mensagem);
}

function gerarRespostaLocal(mensagem) {
  const mensagemLower = mensagem.toLowerCase();
  let texto = '';
  let contexto = { tipo: 'geral' };
  let sugestoes = [];

  if (mensagemLower.includes('praga') || mensagemLower.includes('inseto') || mensagemLower.includes('doença')) {
    contexto.tipo = 'praga';
    texto = `Compreendo a sua preocupação com pragas. Com base nos dados agrícolas de Angola:

Recomendações imediatas:
1. Faça uma vistoria detalhada nas suas culturas
2. Utilize o sistema de detecção do Prognos Agri para identificar a praga com IA
3. Para pragas comuns em Angola:
   - Lagarta-do-cartucho: Use controlo biológico com Bacillus thuringiensis
   - Mosca-branca: Aplique óleo de neem ou inseticidas específicos
   - Pulgão: Use joaninhas como controlo biológico ou sabão de potássio
4. Mantenha registo das ocorrências para padrões sazonais

Deseja que eu detalhe alguma praga específica?`;
    sugestoes = [
      'Como usar o detector de pragas?',
      'Quais pragas são comuns no milho?',
      'Controlo biológico vs químico'
    ];
  } else if (mensagemLower.includes('clima') || mensagemLower.includes('tempo') || mensagemLower.includes('chuva') || mensagemLower.includes('temperatura')) {
    contexto.tipo = 'clima';
    texto = `Sobre as condições climáticas actuais:

📊 Dados climáticos para Angola:
- A temperatura ideal para maioria das culturas é entre 20°C e 35°C
- A época chuvosa em Angola vai de Outubro a Abril (dependendo da região)

💡 Recomendações:
1. Consulte a previsão de 7 dias no módulo de Previsão Climática
2. Planeie o plantio conforme a estação chuvosa da sua região
3. Para estiagem, considere sistemas de irrigação gota-a-gota
4. Monitore alertas de condições extremas (geada, vento forte)

Quer que eu verifique a previsão para a sua região?`;
    sugestoes = [
      'Previsão para 7 dias',
      'Melhor época para plantar milho',
      'Alertas climáticos ativos'
    ];
  } else if (mensagemLower.includes('preço') || mensagemLower.includes('vender') || mensagemLower.includes('comprar') || mensagemLower.includes('mercado')) {
    contexto.tipo = 'mercado';
    texto = `📈 Mercado Agrícola em Tempo Real:

O Prognos Agri conecta compradores e vendedores de produtos agrícolas em Angola.

Para vender:
1. Aceda ao módulo Mercado
2. Publique a sua oferta com fotos e preço
3. Conecte-se directamente com compradores

Para comprar:
1. Navegue pelos produtos disponíveis por província
2. Compare preços médios por região
3. Contacte o vendedor directamente

Dicas:
- Para melhores preços, cadastre produtos com certificação de qualidade
- Acompanhe a tendência de preços no dashboard

Deseja publicar uma oferta ou procurar produtos?`;
    sugestoes = [
      'Ver preços médios',
      'Publicar minha oferta',
      'Produtos mais procurados'
    ];
  } else if (mensagemLower.includes('plant') || mensagemLower.includes('cultivar') || mensagemLower.includes('semente') || mensagemLower.includes('colheita')) {
    contexto.tipo = 'plantio';
    texto = `🌱 Recomendações de Plantio para Angola:

Com base nas condições actuais:

Culturas recomendadas para esta época:
1. Milho: Plantar no início das chuvas (Setembro-Outubro)
2. Feijão: 2-3 semanas após o milho
3. Mandioca: Pode ser plantada durante todo o ano com irrigação
4. Tomate: Prefere temperaturas entre 20-28°C

📋 Preparação do solo:
- Analise o pH do solo (ideal: 5.5-7.0)
- Adube com matéria orgânica
- Planeie rotação de culturas para evitar esgotamento

Use o módulo de Previsão para recomendações personalizadas baseadas no clima da sua região!`;
    sugestoes = [
      'Melhores culturas para minha região',
      'Preparação do solo',
      'Calendário agrícola de Angola'
    ];
  } else {
    contexto.tipo = 'geral';
    texto = `👋 Olá! Sou o assistente virtual do Prognos Agri.

Posso ajudar com:
🔮 Previsão climática e condições meteorológicas
🔍 Detecção e controlo de pragas
📈 Mercado agrícola e preços
🌱 Recomendações de plantio
🔗 Rastreabilidade de produção
👥 Comunidade e fórum de discussão

Sobre o que gostaria de falar?`;
    sugestoes = [
      'Como detectar pragas?',
      'Previsão do tempo',
      'Preços de produtos agrícolas',
      'Dicas de plantio'
    ];
  }

  return { texto, contexto, sugestoes };
}

module.exports = {
  enviarMensagem: exports.enviarMensagem,
  getHistorico: exports.getHistorico,
  getSessao: exports.getSessao,
  deletarSessao: exports.deletarSessao
};
