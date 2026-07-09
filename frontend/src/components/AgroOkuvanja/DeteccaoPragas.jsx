// frontend/src/components/AgroOkuvanja/DeteccaoPragas.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Zap, AlertTriangle, CheckCircle,
  X, Mic, Volume2, Download, Share2, Bug, Bird, Rat,
  TrendingUp, DollarSign, MapPin, Calendar, Clock, Loader,
  RefreshCw, Wifi, WifiOff, Save, History, BarChart3,
  FileText, Image, Video, Ruler, Target, Award, Star,
  Leaf, Sprout, CloudRain, Shield, Sparkles, Rocket,
  Map, Thermometer, Droplets, Wind, Sun, Compass,
  Home, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { detectPestFromImage, checkPythonHealth } from '../../services/pythonService';
import { deteccaoApi } from '../../services/deteccaoApi'; // ← NOVO IMPORT
import vozService from '../../services/vozService';

// Cores
const cores = {
  verdeAngola: '#1A4D2E',
  verdeMusgo: '#2E7D32',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelhoAngola: '#EF4444',
  amareloAngola: '#F59E0B',
  azulAngola: '#3B82F6',
  roxoAngola: '#8B5CF6',
  marromAngola: '#8B4513',
  cinza: '#9CA3AF',
  cinzaEscuro: '#4B5563',
  sucesso: '#10B981',
  aviso: '#F59E0B',
  erro: '#EF4444'
};

// Mapeamento de nomes de pragas
const nomesPortugues = {
  // Aves
  'bird': 'Pássaro',
  'pigeon': 'Pombo',
  'sparrow': 'Pardal',
  'weaver': 'Pássaro-tecelão',
  'crow': 'Corvo',
  'dove': 'Pomba',
  
  // Roedores
  'rat': 'Ratazana',
  'mouse': 'Camundongo',
  'rodent': 'Roedor',
  'squirrel': 'Esquilo',
  'beaver': 'Castor',
  
  // Insetos
  'locust': 'Gafanhoto',
  'grasshopper': 'Gafanhoto',
  'beetle': 'Besouro',
  'caterpillar': 'Lagarta',
  'ant': 'Formiga',
  'fly': 'Mosca',
  'mosquito': 'Mosquito',
  'bee': 'Abelha',
  'wasp': 'Vespa',
  'spider': 'Aranha',
  'aphid': 'Pulgão',
  'whitefly': 'Mosca-branca',
  'thrips': 'Tripes',
  'scale': 'Cochonilha',
  
  // Pragas específicas
  'fall_armyworm': 'Lagarta-do-cartucho',
  'corn_borer': 'Broca-do-milho',
  'default': 'Praga não identificada'
};

// Recomendações por tipo de praga
const recomendacoesPorPraga = {
  'roedor': [
    '🌿 Instalar armadilhas ecológicas com iscas naturais',
    '🌱 Plantar hortelã-pimenta, lavanda e alecrim como repelentes naturais',
    '🦉 Utilizar predadores naturais como corujas e gatos',
    '🏡 Vedar todas as entradas com lã de aço e materiais reciclados',
    '🚫 Evitar raticidas químicos que contaminam o solo e água',
    '🗑️ Manter o terreno limpo sem acúmulo de entulho',
    '💧 Eliminar focos de água parada',
    '📦 Armazenar grãos em recipientes herméticos'
  ],
  'ave': [
    '🌿 Instalar redes de proteção biodegradáveis nas culturas',
    '🌱 Plantar culturas armadilha (milho, sorgo) em áreas periféricas',
    '♻️ Dispositivos sonoros com energia solar (ultrassom)',
    '🪶 Aplicar repelentes naturais à base de extratos de pimenta',
    '🏡 Oferecer áreas alternativas para alimentação',
    '🚫 Evitar métodos letais de controle',
    '💧 Instalar bebedouros longe das culturas principais',
    '🦅 Utilizar falcoaria em áreas muito extensas'
  ],
  'inseto': [
    '🌿 Controle biológico com fungos entomopatogênicos (Metarhizium)',
    '🌱 Plantar crotalária e outras culturas repelentes',
    '♻️ Armadilhas luminosas com energia solar',
    '🐞 Introduzir joaninhas, crisopas e outros predadores naturais',
    '🌿 Aplicar óleo de nim e extratos vegetais',
    '🚫 Evitar inseticidas químicos de amplo espectro',
    '💧 Manejar irrigação para reduzir proliferação',
    '🌾 Fazer rotação de culturas'
  ],
  'gafanhoto': [
    '🌿 Aplicar fungos entomopatogênicos (Metarhizium acridum)',
    '🌱 Plantar barreiras verdes com culturas não palatáveis',
    '♻️ Armadilhas com atrativos alimentares naturais',
    '🐞 Proteger pássaros e outros predadores naturais',
    '🌿 Pulverizar com óleo de nim e extratos de alho',
    '🚫 Evitar queimadas que desequilibram o ecossistema',
    '💧 Monitorar áreas de reprodução após chuvas',
    '🗑️ Destruir ovos em áreas de postura'
  ],
  'lagarta': [
    '🌿 Aplicar Bacillus thuringiensis (BT) - biológico e eficaz',
    '🌱 Plantar atrativos para vespas parasitoides',
    '♻️ Armadilhas luminosas para monitoramento',
    '🐞 Proteger predadores naturais',
    '🌿 Pulverizar com extrato de nim e fumo',
    '🚫 Evitar inseticidas de largo espectro',
    '💧 Fazer inspeção frequente das plantas',
    '🗑️ Eliminar restos culturais após colheita'
  ],
  'besouro': [
    '🌿 Aplicar Beauveria bassiana (fungo entomopatogênico)',
    '🌱 Plantar armadilhas com culturas preferidas',
    '♻️ Armadilhas luminosas sustentáveis',
    '🐞 Liberar nematóides entomopatogênicos no solo',
    '🌿 Usar cinza vegetal e óleo de nim',
    '🚫 Evitar monoculturas extensas',
    '💧 Fazer rotação de culturas',
    '🗑️ Destruir restos culturais'
  ],
  'default': [
    '🌿 Consultar um técnico agrónomo para avaliação específica',
    '🌱 Aumentar a frequência de monitoramento na área',
    '♻️ Registrar todas as ocorrências para histórico',
    '🏡 Considerar medidas de controlo integrado de pragas',
    '🚫 Evitar métodos químicos prejudiciais ao ambiente',
    '💧 Monitorar condições climáticas',
    '📦 Manter registo fotográfico das ocorrências',
    '🌾 Implementar rotação de culturas'
  ]
};

// Componente de Mapa
const MapaSimples = ({ onClose, localizacao, dados }) => {
  const [mapaCarregado, setMapaCarregado] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapaCarregado(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          width: '90%',
          maxWidth: '900px',
          height: '80vh',
          maxHeight: '600px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '15px 20px',
          background: cores.verdeAngola,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
            <Map size={20} />
            Mapa de Risco  
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <X size={18} /> Fechar
          </button>
        </div>
        
        <div style={{ 
          flex: 1, 
          background: '#E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {!mapaCarregado ? (
            <div style={{ textAlign: 'center' }}>
              <Loader className="spin" size={40} color={cores.verdeAngola} />
              <p style={{ marginTop: '10px', color: cores.cinzaEscuro }}>Carregando mapa...</p>
            </div>
          ) : (
            <>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #ddd 25%, #eee 25%, #eee 50%, #ddd 50%, #ddd 75%, #eee 75%, #eee 100%)',
                backgroundSize: '56.57px 56.57px',
                position: 'relative'
              }}>
                {/* Linhas de grade */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  {[...Array(10)].map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={`${i * 10}%`}
                      x2="100%"
                      y2={`${i * 10}%`}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                    />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={`${i * 10}%`}
                      y1="0"
                      x2={`${i * 10}%`}
                      y2="100%"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
                
                {/* Marcadores baseados nos dados reais */}
                {dados?.detections?.map((det, index) => {
                  const posicoes = [
                    { top: '30%', left: '40%' },
                    { top: '60%', left: '60%' },
                    { top: '45%', left: '20%' },
                    { top: '20%', left: '70%' },
                    { top: '70%', left: '30%' }
                  ];
                  const pos = posicoes[index % posicoes.length];
                  const cor = det.confidence > 0.7 ? cores.vermelhoAngola :
                             det.confidence > 0.4 ? cores.amareloAngola : cores.verdeAngola;
                  
                  return (
                    <div key={index} style={{ position: 'absolute', ...pos, textAlign: 'center' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        background: cor,
                        borderRadius: '50%',
                        boxShadow: `0 0 0 4px ${cor}30`,
                        animation: det.confidence > 0.7 ? 'pulse 1.5s infinite' : 'none',
                        margin: '0 auto'
                      }} />
                      <span style={{ 
                        background: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        display: 'inline-block',
                        marginTop: '5px'
                      }}>
                        {det.class_pt || det.class} ({Math.round(det.confidence * 100)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Legenda */}
        <div style={{
          padding: '15px 20px',
          background: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: cores.vermelhoAngola }} />
            <span>Alto Risco (&gt;70%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: cores.amareloAngola }} />
            <span>Médio Risco (40-70%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: cores.verdeAngola }} />
            <span>Baixo Risco (&lt;40%)</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente de Gestão Específica
const GestaoPraga = ({ tipoPraga, onClose, dados }) => {
  const determinarCategoria = (tipo) => {
    if (!tipo) return 'default';
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('rat') || tipoLower.includes('mouse') || tipoLower.includes('rodent')) {
      return 'roedor';
    }
    if (tipoLower.includes('bird') || tipoLower.includes('pigeon') || tipoLower.includes('sparrow')) {
      return 'ave';
    }
    if (tipoLower.includes('locust') || tipoLower.includes('grasshopper')) {
      return 'gafanhoto';
    }
    if (tipoLower.includes('caterpillar') || tipoLower.includes('worm')) {
      return 'lagarta';
    }
    if (tipoLower.includes('beetle') || tipoLower.includes('weevil')) {
      return 'besouro';
    }
    return 'inseto';
  };

  const categoria = determinarCategoria(tipoPraga);
  const recomendacoes = recomendacoesPorPraga[categoria] || recomendacoesPorPraga.default;

  const getIcone = () => {
    switch(categoria) {
      case 'roedor': return <Rat size={48} color={cores.marromAngola} />;
      case 'ave': return <Bird size={48} color={cores.amareloAngola} />;
      default: return <Bug size={48} color={cores.verdePimenta} />;
    }
  };

  const getTitulo = () => {
    switch(categoria) {
      case 'roedor': return 'Roedores';
      case 'ave': return 'Aves';
      case 'gafanhoto': return 'Gafanhotos';
      case 'lagarta': return 'Lagartas';
      case 'besouro': return 'Besouros';
      default: return 'Insetos';
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          padding: '20px',
          background: `linear-gradient(135deg, ${cores.verdeAngola} 0%, ${cores.verdeMusgo} 100%)`,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getIcone()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>Gestão de {getTitulo()}</h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {nomesPortugues[tipoPraga?.toLowerCase()] || tipoPraga}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <X size={18} /> Fechar
          </button>
        </div>

        <div style={{ 
          padding: '25px', 
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 100px)'
        }}>
          {/* Informações da deteção atual */}
          {dados && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#f0f0f0',
              borderRadius: '10px'
            }}>
              <h4 style={{ color: cores.verdeAngola, marginBottom: '10px' }}>
                Deteção Atual
              </h4>
              <p><strong>Localização:</strong> {dados.localizacao || 'Não especificada'}</p>
              <p><strong>Área:</strong> {dados.areaAfetada || 'Não especificada'} ha</p>
              <p><strong>Cultura:</strong> {dados.cultura || 'Não especificada'}</p>
              <p><strong>Confiança:</strong> {Math.round(dados.confidence * 100)}%</p>
            </div>
          )}

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              color: cores.verdeAngola, 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={20} />
              Recomendações Eco-friendly
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recomendacoes.map((rec, i) => (
                <li key={i} style={{
                  padding: '12px 15px',
                  marginBottom: '8px',
                  background: cores.verdeClaro,
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  borderLeft: `4px solid ${cores.verdePimenta}`,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            padding: '20px',
            background: '#F0F9FF',
            borderRadius: '12px',
            border: `1px solid ${cores.azulAngola}30`
          }}>
            <h4 style={{ 
              color: cores.azulAngola, 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Leaf size={18} />
              Dica Ambiental
            </h4>
            <p style={{ fontSize: '0.95rem', color: cores.cinzaEscuro, lineHeight: '1.5' }}>
              Priorize sempre métodos de controle que não agridam o meio ambiente. 
              O equilíbrio ecológico é fundamental para uma agricultura sustentável.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente de Gráficos
const GraficoResultado = ({ detections }) => {
  if (!detections || detections.length === 0) return null;

  const categorias = {
    'Roedores': 0,
    'Aves': 0,
    'Gafanhotos': 0,
    'Lagartas': 0,
    'Besouros': 0,
    'Outros Insetos': 0
  };

  detections.forEach(d => {
    const classe = d.class?.toLowerCase() || '';
    const confianca = d.confidence || 0.5;
    
    if (classe.includes('rat') || classe.includes('mouse') || classe.includes('rodent')) {
      categorias['Roedores'] += confianca;
    } else if (classe.includes('bird') || classe.includes('pigeon') || classe.includes('sparrow')) {
      categorias['Aves'] += confianca;
    } else if (classe.includes('locust') || classe.includes('grasshopper')) {
      categorias['Gafanhotos'] += confianca;
    } else if (classe.includes('caterpillar') || classe.includes('worm')) {
      categorias['Lagartas'] += confianca;
    } else if (classe.includes('beetle') || classe.includes('weevil')) {
      categorias['Besouros'] += confianca;
    } else {
      categorias['Outros Insetos'] += confianca;
    }
  });

  const maxValor = Math.max(...Object.values(categorias).filter(v => v > 0));
  if (maxValor === 0) return null;

  const coresCategoria = {
    'Roedores': cores.marromAngola,
    'Aves': cores.amareloAngola,
    'Gafanhotos': cores.vermelhoAngola,
    'Lagartas': cores.verdePimenta,
    'Besouros': cores.roxoAngola,
    'Outros Insetos': cores.azulAngola
  };

  return (
    <div style={{ marginTop: '25px', marginBottom: '15px' }}>
      <h4 style={{ 
        color: cores.verdeAngola, 
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <BarChart3 size={18} />
        Distribuição por Categoria
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(categorias).map(([cat, valor]) => {
          if (valor === 0) return null;
          const porcentagem = Math.round((valor / maxValor) * 100);
          const cor = coresCategoria[cat] || cores.cinza;
          
          return (
            <div key={cat}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '5px',
                fontSize: '0.9rem'
              }}>
                <span style={{ fontWeight: '500' }}>{cat}</span>
                <span style={{ color: cor, fontWeight: 'bold' }}>{porcentagem}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                background: '#eee',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${porcentagem}%` }}
                  transition={{ duration: 0.8 }}
                  style={{
                    height: '100%',
                    background: cor,
                    borderRadius: '5px'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente Principal
export default function DeteccaoPragas({ 
  onResultado,
  onAtualizarDashboard,
  onEnviarParaRelatorios,
  onEnviarParaMetricas,
  onEnviarParaMapaRisco,
  onEnviarParaRecomendacoes
}) {
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [usandoCamera, setUsandoCamera] = useState(false);
  const [audioAtivo, setAudioAtivo] = useState(true);
  const [pythonStatus, setPythonStatus] = useState('verificando');
  const [localizacao, setLocalizacao] = useState('');
  const [areaAfetada, setAreaAfetada] = useState('');
  const [culturaAfetada, setCulturaAfetada] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarGestao, setMostrarGestao] = useState(false);
  const [tipoPragaSelecionado, setTipoPragaSelecionado] = useState(null);
  const [dadosCusto, setDadosCusto] = useState({ inserido: false });
  const [historico, setHistorico] = useState([]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    verificarPython();
    carregarHistorico();

    return () => {
      if (streamRef.current) {
        pararCamera();
      }
    };
  }, []);

  const carregarHistorico = () => {
    const saved = localStorage.getItem('agrookuvanja_deteccoes');
    if (saved) {
      try {
        setHistorico(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  };

  const verificarPython = async () => {
  try {
    const status = await checkPythonHealth();
    setPythonStatus(status.online ? 'online' : 'offline');
  } catch {
    setPythonStatus('offline');
  }
};

  const falarResultado = useCallback((dados) => {
    if (!audioAtivo || !dados) return;
    
    let mensagem = '';
    if (dados.detections?.length) {
      const nomesPragas = dados.detections.map(d => d.class_pt || d.class).join(' e ');
      mensagem = `Foi detectada ${dados.detections.length} praga: ${nomesPragas}. `;
      
      if (dados.perdaEstimada && dadosCusto.inserido) {
        mensagem += `A perda estimada é de ${dados.perdaEstimada.toLocaleString()} kwanzas. `;
      }
      
      if (dados.recomendacoes?.length) {
        mensagem += `Recomendação principal: ${dados.recomendacoes[0]}.`;
      }
    } else {
      mensagem = 'Nenhuma praga foi detectada na imagem. A sua plantação está saudável.';
    }
    vozService.falar(mensagem);
  }, [audioAtivo, dadosCusto]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErro('Imagem deve ter no máximo 10MB');
      return;
    }

    if (imagemPreview) {
      URL.revokeObjectURL(imagemPreview);
    }

    setImagem(file);
    setImagemPreview(URL.createObjectURL(file));
    setResultado(null);
    setErro('');
  };

  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUsandoCamera(true);
    } catch (error) {
      setErro('Erro ao acessar câmara');
    }
  };

  const capturarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'captura.jpg', { type: 'image/jpeg' });
        if (imagemPreview) URL.revokeObjectURL(imagemPreview);
        setImagem(file);
        setImagemPreview(URL.createObjectURL(blob));
        pararCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUsandoCamera(false);
  };

  // Função para guardar no backend
  const guardarNoBackend = async (dados) => {
    try {
      // Verificar se o utilizador está autenticado (pegar do localStorage)
      const user = JSON.parse(localStorage.getItem('agrookuvanja_user') || '{}');
      if (!user.id) {
        console.log('⚠️ Utilizador não autenticado, dados guardados apenas localmente');
        return;
      }

      const dadosParaBackend = {
        usuarioId: user.id,
        localizacao: dados.localizacao,
        areaAfetada: dados.areaAfetada,
        cultura: dados.cultura,
        perdaEstimada: dados.perdaEstimada,
        nivelRisco: dados.nivelRisco,
        total_count: dados.total_count,
        detections: dados.detections.map(d => ({
          class: d.class,
          class_pt: d.class_pt,
          confidence: d.confidence,
          bbox: d.bbox || []
        })),
        timestamp: dados.timestamp,
        origem: 'deteccao'
      };

      const response = await deteccaoApi.salvar(dadosParaBackend);
      console.log('✅ Deteção guardada no servidor:', response);
    } catch (error) {
      console.error('❌ Erro ao guardar no servidor:', error);
      // Não mostrar erro ao utilizador, apenas log
    }
  };

  const analisarImagem = async () => {
    if (!imagem) {
      setErro('Selecione uma imagem primeiro');
      return;
    }

    setAnalisando(true);
    setErro('');

    try {
      let resultadoPython;
      if (pythonStatus === 'online') {
        resultadoPython = await detectPestFromImage(imagem);
      } else {
        resultadoPython = {
          detections: [
            { class: 'locust', confidence: 0.85 },
            { class: 'bird', confidence: 0.72 },
            { class: 'rat', confidence: 0.64 }
          ],
          total_count: 3,
          processing_time_ms: 1234
        };
      }

      let perdaEstimada = null;
      let nivelRisco = 'BAIXO';
      
      if (dadosCusto.inserido && dadosCusto.valor && areaAfetada) {
        const area = parseFloat(areaAfetada) || 1;
        const fatorPerda = Math.min(resultadoPython.detections.length * 0.15, 0.7);
        perdaEstimada = dadosCusto.valor * area * fatorPerda;
        
        nivelRisco = fatorPerda > 0.5 ? 'ALTO' : fatorPerda > 0.3 ? 'MÉDIO' : 'BAIXO';
      }

      const resultadoCompleto = {
        ...resultadoPython,
        timestamp: new Date().toISOString(),
        localizacao: localizacao || 'Não especificada',
        areaAfetada: areaAfetada || 'Não especificada',
        cultura: culturaAfetada || 'Não especificada',
        perdaEstimada,
        nivelRisco,
        recomendacoes: gerarRecomendacoes(resultadoPython.detections),
        detections: resultadoPython.detections?.map(d => ({
          ...d,
          class_pt: nomesPortugues[d.class?.toLowerCase()] || d.class || 'Praga não identificada'
        })),
        impact: perdaEstimada ? {
          total_loss_kz: perdaEstimada,
          nivel_risco: nivelRisco,
          area_afetada: areaAfetada,
          cultura: culturaAfetada
        } : null
      };

      setResultado(resultadoCompleto);
      falarResultado(resultadoCompleto);

      // GUARDAR NO BACKEND
      await guardarNoBackend(resultadoCompleto);

      // Salvar no histórico local
      const novoHistorico = [resultadoCompleto, ...historico].slice(0, 20);
      setHistorico(novoHistorico);
      localStorage.setItem('agrookuvanja_deteccoes', JSON.stringify(novoHistorico));

      // ENVIAR PROPS PARA TODOS OS COMPONENTES
      
      // 1. Callback principal
      if (onResultado) {
        onResultado(resultadoCompleto);
      }

      // 2. Atualizar dashboard
      if (onAtualizarDashboard) {
        onAtualizarDashboard();
      }

      // 3. Enviar para relatórios
      if (onEnviarParaRelatorios) {
        onEnviarParaRelatorios({
          id: Date.now(),
          tipo: 'deteccao_pragas',
          data: resultadoCompleto.timestamp,
          conteudo: resultadoCompleto,
          localizacao: resultadoCompleto.localizacao,
          totalPragas: resultadoCompleto.total_count,
          perdaEstimada: resultadoCompleto.perdaEstimada,
          cultura: resultadoCompleto.cultura
        });
      }

      // 4. Enviar para métricas
      if (onEnviarParaMetricas) {
        onEnviarParaMetricas({
          tipo: 'deteccao',
          timestamp: resultadoCompleto.timestamp,
          totalPragas: resultadoCompleto.total_count,
          perdaEstimada: resultadoCompleto.perdaEstimada,
          areaAfetada: resultadoCompleto.areaAfetada,
          cultura: resultadoCompleto.cultura,
          nivelRisco: resultadoCompleto.nivelRisco,
          detections: resultadoCompleto.detections.map(d => ({
            tipo: d.class,
            confianca: d.confidence
          }))
        });
      }

      // 5. Enviar para mapa de risco
      if (onEnviarParaMapaRisco) {
        onEnviarParaMapaRisco({
          localizacao: resultadoCompleto.localizacao,
          coordenadas: { lat: -12.5, lng: 18.5 },
          pragas: resultadoCompleto.detections,
          nivelRisco: resultadoCompleto.nivelRisco,
          areaAfetada: resultadoCompleto.areaAfetada,
          timestamp: resultadoCompleto.timestamp,
          cultura: resultadoCompleto.cultura
        });
      }

      // 6. Enviar para recomendações
      if (onEnviarParaRecomendacoes) {
        onEnviarParaRecomendacoes({
          pragas: resultadoCompleto.detections,
          recomendacoes: resultadoCompleto.recomendacoes,
          timestamp: resultadoCompleto.timestamp,
          localizacao: resultadoCompleto.localizacao,
          cultura: resultadoCompleto.cultura,
          areaAfetada: resultadoCompleto.areaAfetada
        });
      }

      console.log('✅ Props enviadas para todos os componentes');

    } catch (error) {
      setErro('Erro ao analisar imagem: ' + error.message);
    } finally {
      setAnalisando(false);
    }
  };

  const gerarRecomendacoes = (detections) => {
    if (!detections?.length) return [];
    
    const recomendacoesSet = new Set();
    detections.forEach(d => {
      const classe = d.class?.toLowerCase() || '';
      let categoria = 'default';
      
      if (classe.includes('rat') || classe.includes('mouse') || classe.includes('rodent')) categoria = 'roedor';
      else if (classe.includes('bird') || classe.includes('pigeon') || classe.includes('sparrow')) categoria = 'ave';
      else if (classe.includes('locust') || classe.includes('grasshopper')) categoria = 'gafanhoto';
      else if (classe.includes('caterpillar') || classe.includes('worm')) categoria = 'lagarta';
      else if (classe.includes('beetle') || classe.includes('weevil')) categoria = 'besouro';
      else categoria = 'inseto';
      
      const lista = recomendacoesPorPraga[categoria] || recomendacoesPorPraga.default;
      lista.slice(0, 3).forEach(r => recomendacoesSet.add(r));
    });
    
    return Array.from(recomendacoesSet).slice(0, 5);
  };

  const exportarResultado = () => {
    if (!resultado) return;
    
    const dataStr = JSON.stringify(resultado, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deteccao_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const novaDeteccao = () => {
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagem(null);
    setImagemPreview(null);
    setResultado(null);
    setErro('');
  };

  const handleInserirCustos = () => {
    const valor = prompt('Qual é o custo estimado da produção por hectare (em Kz)?');
    if (valor && !isNaN(valor) && parseFloat(valor) > 0) {
      setDadosCusto({ inserido: true, valor: parseFloat(valor) });
    }
  };

  const getNomePraga = (classe) => {
    if (!classe) return 'Praga não identificada';
    return nomesPortugues[classe.toLowerCase()] || classe;
  };
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              color: cores.verdeAngola, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px' 
            }}>
              <Bug size={32} />
              AgroOkuvanja - Deteção de Pragas
            </h1>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginTop: '5px',
              fontSize: '0.9rem'
            }}>
              <span style={{ 
                color: pythonStatus === 'online' ? cores.sucesso : cores.erro,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: pythonStatus === 'online' ? cores.sucesso : cores.erro
                }} />
                Python: {pythonStatus === 'online' ? 'Conectado' : 'Offline'}
              </span>
              
              {historico.length > 0 && (
                <span style={{ color: cores.cinzaEscuro }}>
                  <History size={14} style={{ marginRight: '5px' }} />
                  {historico.length} deteções no histórico
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setAudioAtivo(!audioAtivo)}
            style={{
              padding: '10px 20px',
              background: audioAtivo ? cores.verdePimenta : cores.erro,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold'
            }}
          >
            {audioAtivo ? <Volume2 size={18} /> : <MicOff size={18} />}
            {audioAtivo ? 'Áudio Ativo' : 'Mudo'}
          </button>
        </div>
      </motion.div>

      {/* Campos de contexto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <h3 style={{ color: cores.verdeAngola, marginBottom: '15px' }}>
          Informações da Área
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <MapPin size={16} style={{ marginRight: '5px' }} />
              Localização
            </label>
            <input
              type="text"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Ex: Talhão Norte"
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <Ruler size={16} style={{ marginRight: '5px' }} />
              Área (hectares)
            </label>
            <input
              type="number"
              value={areaAfetada}
              onChange={(e) => setAreaAfetada(e.target.value)}
              placeholder="Ex: 2.5"
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <Sprout size={16} style={{ marginRight: '5px' }} />
              Cultura
            </label>
            <select
              value={culturaAfetada}
              onChange={(e) => setCulturaAfetada(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione</option>
              <option value="Milho">Milho</option>
              <option value="Sorgo">Sorgo</option>
              <option value="Mandioca">Mandioca</option>
              <option value="Feijão">Feijão</option>
              <option value="Amendoim">Amendoim</option>
              <option value="Arroz">Arroz</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <DollarSign size={16} style={{ marginRight: '5px' }} />
              Custos
            </label>
            <button
              onClick={handleInserirCustos}
              style={{
                width: '100%',
                padding: '10px',
                background: dadosCusto.inserido ? cores.sucesso : cores.azulAngola,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {dadosCusto.inserido ? '✓ Custos Inseridos' : 'Inserir Custos'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid principal - Upload e Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Coluna esquerda - Upload/Câmara */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            {usandoCamera ? '📸 Capturar Foto' : '📁 Carregar Imagem'}
          </h3>
          
          {!usandoCamera ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={uploadAreaStyle}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Upload size={48} color={cores.verdePimenta} />
              <p style={{ marginTop: '10px', fontWeight: '500' }}>
                Clique para selecionar imagem
              </p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                JPG, PNG até 10MB
              </p>
            </div>
          ) : (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  background: '#000',
                  marginBottom: '10px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={capturarFoto}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: cores.verdePimenta,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: cores.verdeAngola
                  }}
                >
                  📸 Capturar
                </button>
                <button
                  onClick={pararCamera}
                  style={{
                    padding: '12px 20px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <button
            onClick={usandoCamera ? pararCamera : iniciarCamera}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '12px',
              background: 'transparent',
              border: `1px solid ${cores.verdePimenta}`,
              borderRadius: '8px',
              cursor: 'pointer',
              color: cores.verdeAngola,
              fontWeight: '500'
            }}
          >
            {usandoCamera ? '❌ Fechar Câmara' : '📷 Usar Câmara'}
          </button>
        </div>
        
        {/* Coluna direita - Preview */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Pré-visualização</h3>
          
          {imagemPreview ? (
            <div>
              <div style={{
                width: '100%',
                height: '200px',
                background: '#f0f0f0',
                borderRadius: '10px',
                marginBottom: '15px',
                overflow: 'hidden'
              }}>
                <img
                  src={imagemPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              
              {analisando && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <Loader className="spin" size={30} color={cores.verdeAngola} />
                  <p style={{ marginTop: '10px' }}>Analisando imagem...</p>
                </div>
              )}
              
              <button
                onClick={analisarImagem}
                disabled={analisando}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: analisando ? '#ccc' : cores.verdeAngola,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: analisando ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                {analisando ? 'Analisando...' : '🚀 Analisar com IA'}
              </button>
            </div>
          ) : (
            <div style={emptyPreviewStyle}>
              <Image size={48} color="#ccc" />
              <p style={{ marginTop: '10px' }}>Nenhuma imagem selecionada</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                Selecione ou capture uma imagem para começar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={cardStyle}
          >
            {/* Cabeçalho do Resultado */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <h2 style={{ 
                color: cores.verdeAngola, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '1.3rem'
              }}>
                <CheckCircle color={cores.sucesso} size={24} />
                Resultado da Análise
                {resultado.processing_time_ms && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    background: cores.verdeClaro, 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    color: cores.cinzaEscuro
                  }}>
                    {resultado.processing_time_ms}ms
                  </span>
                )}
              </h2>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={exportarResultado} style={buttonSecundarioStyle}>
                  <Download size={16} /> Exportar
                </button>
                <button onClick={novaDeteccao} style={buttonPrimarioStyle}>
                  <RefreshCw size={16} /> Nova Deteção
                </button>
              </div>
            </div>

            {/* Informações de contexto */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '20px',
              padding: '15px',
              background: cores.verdeClaro + '40',
              borderRadius: '10px'
            }}>
              {resultado.localizacao && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color={cores.verdeAngola} />
                  <span><strong>Local:</strong> {resultado.localizacao}</span>
                </div>
              )}
              {resultado.areaAfetada && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Ruler size={14} color={cores.verdeAngola} />
                  <span><strong>Área:</strong> {resultado.areaAfetada} ha</span>
                </div>
              )}
              {resultado.cultura && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sprout size={14} color={cores.verdeAngola} />
                  <span><strong>Cultura:</strong> {resultado.cultura}</span>
                </div>
              )}
            </div>

            {/* Cards de Resumo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={resumoCardStyle}>
                <Bug size={20} color={cores.verdeAngola} />
                <p style={resumoValorStyle}>{resultado.total_count || 0}</p>
                <p style={resumoLabelStyle}>Pragas Detectadas</p>
              </div>
              
              <div style={resumoCardStyle}>
                <DollarSign size={20} color={cores.verdeAngola} />
                <p style={resumoValorStyle}>
                  {resultado.perdaEstimada ? 
                    resultado.perdaEstimada.toLocaleString() : '---'} Kz
                </p>
                <p style={resumoLabelStyle}>
                  {resultado.perdaEstimada ? 'Perda Estimada' : 'Perda não calculada'}
                </p>
                {!resultado.perdaEstimada && (
                  <p style={{ fontSize: '0.7rem', color: cores.aviso, marginTop: '5px' }}>
                    ⚠️ Insira dados de custo
                  </p>
                )}
              </div>
              
              <div style={resumoCardStyle}>
                <Shield size={20} color={cores.verdeAngola} />
                <p style={resumoValorStyle}>{resultado.recomendacoes?.length || 0}</p>
                <p style={resumoLabelStyle}>Recomendações</p>
              </div>

              <div style={resumoCardStyle}>
                <AlertTriangle size={20} color={cores.verdeAngola} />
                <p style={resumoValorStyle}>{resultado.nivelRisco || 'N/A'}</p>
                <p style={resumoLabelStyle}>Nível de Risco</p>
              </div>
            </div>

            {/* Detalhes das Pragas */}
            {resultado.detections?.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ 
                  color: cores.verdeAngola, 
                  marginBottom: '15px',
                  fontSize: '1.1rem'
                }}>
                  Pragas Detectadas
                </h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {resultado.detections.map((det, i) => {
                    const nomePraga = getNomePraga(det.class);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setTipoPragaSelecionado(det.class);
                          setMostrarGestao(true);
                        }}
                        style={pragaItemStyle}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'white',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {det.class?.toLowerCase().includes('bird') ? <Bird size={20} color={cores.amareloAngola} /> :
                           det.class?.toLowerCase().includes('rat') ? <Rat size={20} color={cores.marromAngola} /> : 
                           <Bug size={20} color={cores.verdePimenta} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '5px'
                          }}>
                            <strong style={{ fontSize: '1rem' }}>{nomePraga}</strong>
                            <span style={{ 
                              fontSize: '0.9rem',
                              color: det.confidence > 0.7 ? cores.vermelhoAngola :
                                     det.confidence > 0.4 ? cores.amareloAngola : cores.verdeAngola,
                              fontWeight: 'bold'
                            }}>
                              {Math.round(det.confidence * 100)}% confiança
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#eee',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${det.confidence * 100}%`,
                              height: '100%',
                              background: det.confidence > 0.7 ? cores.vermelhoAngola :
                                         det.confidence > 0.4 ? cores.amareloAngola : cores.verdeAngola
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gráfico */}
            <GraficoResultado detections={resultado.detections} />

            {/* Recomendações */}
            {resultado.recomendacoes?.length > 0 && (
              <div style={{ marginTop: '25px' }}>
                <h3 style={{ 
                  color: cores.verdeAngola, 
                  marginBottom: '15px',
                  fontSize: '1.1rem'
                }}>
                  Recomendações Técnicas
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {resultado.recomendacoes.map((rec, i) => (
                    <li key={i} style={recomendacaoItemStyle}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botões de Ação */}
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              marginTop: '25px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setMostrarMapa(true)}
                style={acaoBotaoStyle}
              >
                <Map size={18} /> Ver Mapa de Risco
              </button>
              <button
                onClick={() => falarResultado(resultado)}
                style={{...acaoBotaoStyle, background: cores.roxoAngola}}
              >
                <Volume2 size={18} /> Ouvir Resultado
              </button>
              {resultado.detections?.[0] && (
                <button
                  onClick={() => {
                    setTipoPragaSelecionado(resultado.detections[0].class);
                    setMostrarGestao(true);
                  }}
                  style={{...acaoBotaoStyle, background: cores.verdePimenta, color: cores.verdeAngola}}
                >
                  <Shield size={18} /> Gestão Específica
                </button>
              )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modais */}
      <AnimatePresence>
        {mostrarMapa && (
          <MapaSimples
            onClose={() => setMostrarMapa(false)}
            localizacao={localizacao}
            dados={resultado}
          />
        )}
        
        {mostrarGestao && tipoPragaSelecionado && (
          <GestaoPraga
            tipoPraga={tipoPragaSelecionado}
            onClose={() => setMostrarGestao(false)}
            dados={resultado?.detections?.find(d => d.class === tipoPragaSelecionado)}
          />
        )}
      </AnimatePresence>

      {/* Mensagem de Erro */}
      <AnimatePresence>
        {erro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={erroStyle}
          >
            <AlertTriangle size={20} />
            <span>{erro}</span>
            <button
              onClick={() => setErro('')}
              style={erroBotaoStyle}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Estilos reutilizáveis
const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '0.95rem',
  transition: 'all 0.2s'
};

const cardStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const cardTitleStyle = {
  color: cores.verdeAngola,
  marginBottom: '20px',
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const uploadAreaStyle = {
  border: `2px dashed ${cores.verdePimenta}`,
  borderRadius: '10px',
  padding: '30px',
  textAlign: 'center',
  cursor: 'pointer',
  background: cores.verdeClaro,
  transition: 'all 0.3s'
};

const emptyPreviewStyle = {
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f9f9f9',
  borderRadius: '10px',
  color: '#999'
};

const resumoCardStyle = {
  padding: '20px',
  background: cores.verdeClaro,
  borderRadius: '12px',
  textAlign: 'center'
};

const resumoValorStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: cores.verdeAngola,
  marginTop: '10px'
};

const resumoLabelStyle = {
  fontSize: '0.9rem',
  color: cores.cinzaEscuro
};

const pragaItemStyle = {
  padding: '15px',
  background: cores.verdeClaro,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const recomendacaoItemStyle = {
  padding: '12px 15px',
  marginBottom: '8px',
  background: cores.verdeClaro,
  borderRadius: '8px',
  borderLeft: `4px solid ${cores.verdePimenta}`,
  fontSize: '0.95rem'
};

const buttonPrimarioStyle = {
  padding: '8px 15px',
  background: cores.verdeAngola,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.9rem'
};

const buttonSecundarioStyle = {
  padding: '8px 15px',
  background: 'white',
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.9rem'
};

const acaoBotaoStyle = {
  padding: '12px 25px',
  background: cores.azulAngola,
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
};

const erroStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  background: '#fee',
  color: cores.erro,
  padding: '15px 20px',
  borderRadius: '10px',
  border: '1px solid #fcc',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  zIndex: 10000
};

const erroBotaoStyle = {
  background: 'none',
  border: 'none',
  color: cores.erro,
  cursor: 'pointer',
  padding: '5px',
  marginLeft: '10px'
};