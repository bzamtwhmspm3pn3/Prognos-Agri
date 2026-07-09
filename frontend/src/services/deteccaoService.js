// src/services/deteccaoService.js

// Base de conhecimento de pragas
const baseConhecimento = {
  roedores: {
    palavrasChave: ['rato', 'ratazana', 'camundongo', 'roedor', 'buraco', 'túnel', 'fezes', 'pegadas'],
    especies: [
      { nome: 'Rato-do-campo', nomeCientifico: 'Rattus norvegicus', risco: 'alto', culturas: ['milho', 'sorgo', 'arroz'] },
      { nome: 'Ratazana', nomeCientifico: 'Rattus rattus', risco: 'alto', culturas: ['milho', 'armazenado'] },
      { nome: 'Camundongo', nomeCientifico: 'Mus musculus', risco: 'médio', culturas: ['grãos', 'sementes'] }
    ]
  },
  aves: {
    palavrasChave: ['pássaro', 'ave', 'pena', 'ninho', 'voo', 'bicada', 'canto'],
    especies: [
      { nome: 'Pássaro-tecelão', nomeCientifico: 'Ploceus cucullatus', risco: 'alto', culturas: ['milho', 'arroz'] },
      { nome: 'Pomba', nomeCientifico: 'Columba livia', risco: 'médio', culturas: ['grãos', 'frutas'] },
      { nome: 'Papagaio-cinzento', nomeCientifico: 'Psittacus erithacus', risco: 'médio', culturas: ['frutas', 'milho'] }
    ]
  },
  insetos: {
    palavrasChave: ['inseto', 'lagarta', 'larva', 'ovo', 'folha comida', 'perfurada'],
    especies: [
      { nome: 'Lagarta-do-cartucho', nomeCientifico: 'Spodoptera frugiperda', risco: 'alto', culturas: ['milho', 'sorgo'] },
      { nome: 'Gafanhoto', nomeCientifico: 'Locusta migratoria', risco: 'alto', culturas: ['pastagem', 'milho'] },
      { nome: 'Broca-do-café', nomeCientifico: 'Hypothenemus hampei', risco: 'médio', culturas: ['café'] }
    ]
  }
};

// Dicionário de palavras em português angolano
const dicionarioAngolano = {
  'bicho': 'praga',
  'cacimbo': 'chuva',
  'quibombo': 'quiabo',
  'jindungo': 'pimenta',
  'massango': 'sorgo',
  'massambala': 'milho',
  'olossota': 'lagarta',
  'kamba': 'amigo'
};

// Simular análise de imagem (substituir por chamada à API Python/R)
export const analisarImagem = async (imagemFile) => {
  console.log('🔍 Analisando imagem...', imagemFile?.name);
  
  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Resultados pré-definidos baseados em padrões reais
  const resultadosPossiveis = [
    {
      praga: 'Rato-do-campo',
      tipo: 'roedor',
      confianca: 97,
      severidade: 'alta',
      descricao: 'Roedor de médio porte, ataca principalmente milho e sorgo',
      danos: 'Consome grãos e contamina com fezes',
      recomendacoes: [
        'Instalar armadilhas mecânicas',
        'Aplicar raticida biológico',
        'Manter terreno limpo',
        'Proteger armazenamento'
      ],
      perda_estimada: '45.000 Kz/ha',
      area_afetada: '2.5 hectares'
    },
    {
      praga: 'Pássaro-tecelão',
      tipo: 'ave',
      confianca: 95,
      severidade: 'alta',
      descricao: 'Ave que ataca cereais em desenvolvimento',
      danos: 'Bica e destrói espigas de milho',
      recomendacoes: [
        'Instalar redes de proteção',
        'Utilizar dispositivos sonoros',
        'Aplicar repelentes naturais'
      ],
      perda_estimada: '28.000 Kz/ha',
      area_afetada: '1.8 hectares'
    },
    {
      praga: 'Lagarta-do-cartucho',
      tipo: 'inseto',
      confianca: 96,
      severidade: 'alta',
      descricao: 'Lagarta que ataca o cartucho do milho',
      danos: 'Destrói folhas e pode matar a planta',
      recomendacoes: [
        'Aplicar inseticida específico',
        'Introduzir predadores naturais',
        'Rotacionar culturas'
      ],
      perda_estimada: '32.000 Kz/ha',
      area_afetada: '3.2 hectares'
    },
    {
      praga: 'Nenhuma praga detectada',
      tipo: 'saudavel',
      confianca: 99,
      severidade: 'baixa',
      descricao: 'Plantação aparenta saudável',
      danos: 'Sem danos visíveis',
      recomendacoes: [
        'Continuar monitoramento regular',
        'Manter práticas atuais',
        'Reforçar prevenção'
      ],
      perda_estimada: '0 Kz',
      area_afetada: '0 hectares'
    }
  ];

  // Escolher resultado baseado em padrão (para demo)
  const index = Math.floor(Math.random() * resultadosPossiveis.length);
  return resultadosPossiveis[index];
};

// Interpretar texto/descrição do agricultor
export const interpretarDescricao = (texto) => {
  const textoLower = texto.toLowerCase();
  
  // Traduzir termos angolanos
  let textoTraduzido = textoLower;
  Object.entries(dicionarioAngolano).forEach(([k, v]) => {
    textoTraduzido = textoTraduzido.replace(new RegExp(k, 'g'), v);
  });

  // Procurar correspondências
  for (const [tipo, dados] of Object.entries(baseConhecimento)) {
    const temPalavraChave = dados.palavrasChave.some(palavra => 
      textoTraduzido.includes(palavra)
    );
    
    if (temPalavraChave) {
      // Encontrar espécie específica
      const especie = dados.especies.find(e => 
        textoTraduzido.includes(e.nome.toLowerCase()) ||
        textoTraduzido.includes(e.nomeCientifico.toLowerCase())
      ) || dados.especies[0];

      return {
        tipo,
        especie: especie.nome,
        risco: especie.risco,
        confianca: 85,
        culturas: especie.culturas,
        sugestoes: gerarSugestoes(tipo, especie)
      };
    }
  }

  return null;
};

// Gerar sugestões baseadas no tipo de praga
const gerarSugestoes = (tipo, especie) => {
  const sugestoes = {
    roedor: [
      'Instalar armadilhas mecânicas nas áreas afetadas',
      'Aplicar raticida biológico (consultar técnico)',
      'Manter o terreno limpo sem acúmulo de vegetação',
      'Utilizar barreiras físicas ao redor das culturas'
    ],
    ave: [
      'Instalar redes de proteção nas áreas mais críticas',
      'Utilizar dispositivos sonoros de dissuasão',
      'Aplicar repelentes naturais à base de extratos vegetais',
      'Implementar culturas armadilhas em áreas periféricas'
    ],
    inseto: [
      'Aplicar inseticidas específicos para a praga identificada',
      'Introduzir predadores naturais',
      'Utilizar armadilhas luminosas ou cromáticas',
      'Rotacionar culturas para quebrar ciclo da praga'
    ]
  };

  return sugestoes[tipo] || sugestoes.inseto;
};

// Calcular perda económica
export const calcularPerda = (area, cultura, praga) => {
  const valoresPorCultura = {
    milho: 45000,
    sorgo: 38000,
    pastagem: 25000,
    frutas: 120000,
    'café': 150000
  };

  const valorBase = valoresPorCultura[cultura.toLowerCase()] || 30000;
  const perda = area * valorBase * 0.3; // 30% de perda estimada
  
  return {
    kz: Math.round(perda),
    usd: Math.round(perda / 920), // Conversão aproximada
    area,
    cultura
  };
};

// Histórico de deteções
export const salvarDeteccao = (deteccao) => {
  const historico = JSON.parse(localStorage.getItem('agrookuvanja_deteccoes') || '[]');
  const novaDeteccao = {
    ...deteccao,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };
  historico.unshift(novaDeteccao);
  localStorage.setItem('agrookuvanja_deteccoes', JSON.stringify(historico.slice(0, 100)));
  return novaDeteccao;
};

export const getHistoricoDeteccoes = () => {
  return JSON.parse(localStorage.getItem('agrookuvanja_deteccoes') || '[]');
};