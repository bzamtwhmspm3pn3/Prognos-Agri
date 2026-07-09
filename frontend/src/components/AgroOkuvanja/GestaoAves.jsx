// src/components/AgroOkuvanja/GestaoAves.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bird, AlertTriangle, MapPin, Calendar, TrendingUp,
  Volume2, Download, Share2, Filter, CheckCircle,
  Bell, BellRing, Clock, X, RefreshCw, DollarSign
} from 'lucide-react';
import vozService from '../../services/vozService';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444',
  amarelo: '#F59E0B',
  azul: '#3B82F6',
  cinza: '#6B7280',
  marrom: '#8B4513',
  sucesso: '#10B981',
  info: '#3B82F6'
};

// Função para identificar se é uma ave
const isAve = (item) => {
  // Se vier do formato de deteccao (com detections array)
  if (item.detections && Array.isArray(item.detections)) {
    return item.detections.some(det => {
      const classe = det.class?.toLowerCase() || '';
      const classPt = det.class_pt?.toLowerCase() || '';
      const nome = det.nome?.toLowerCase() || '';
      
      return classe.includes('bird') || classe.includes('pigeon') || 
             classPt.includes('pássaro') || classPt.includes('ave') || 
             classPt.includes('pombo') || nome.includes('pássaro');
    });
  }
  
  // Se vier do formato de alerta (com pragas array)
  if (item.pragas && Array.isArray(item.pragas)) {
    return item.pragas.some(p => {
      const classe = p.class?.toLowerCase() || '';
      const classPt = p.class_pt?.toLowerCase() || '';
      
      return classe.includes('bird') || classe.includes('pigeon') || 
             classPt.includes('pássaro') || classPt.includes('ave');
    });
  }
  
  // Se vier como deteção simples
  const classe = item.class?.toLowerCase() || '';
  const classPt = item.class_pt?.toLowerCase() || '';
  const nome = item.nome?.toLowerCase() || '';
  
  return classe.includes('bird') || classe.includes('pigeon') || 
         classPt.includes('pássaro') || classPt.includes('ave') || 
         nome.includes('pássaro');
};

// Função para extrair deteções individuais de um item
const extrairDeteccoes = (item) => {
  const deteccoes = [];
  const timestamp = item.timestamp || new Date().toISOString();
  
  // Se tem detections array (formato da DeteccaoPragas)
  if (item.detections && Array.isArray(item.detections)) {
    item.detections.forEach((det, index) => {
      deteccoes.push({
        id: `${timestamp}-${det.class}-${index}`,
        unique: `${timestamp}-${det.class}-${item.localizacao}`,
        class: det.class,
        class_pt: det.class_pt || (det.class === 'bird' ? 'Pássaro' : 'Ave'),
        confidence: det.confidence || 0.8,
        localizacao: item.localizacao || 'Não especificada',
        timestamp: timestamp,
        severidade: det.confidence > 0.7 ? 'alta' : det.confidence > 0.4 ? 'media' : 'baixa',
        status: 'ativo',
        area: item.areaAfetada || 'Área não especificada',
        cultura: item.cultura || 'Não especificada',
        perda: item.perdaEstimada || 0,
        camera: item.camera
      });
    });
  }
  
  // Se tem pragas array (formato do MapaRisco)
  else if (item.pragas && Array.isArray(item.pragas)) {
    item.pragas.forEach((p, index) => {
      deteccoes.push({
        id: `${timestamp}-${p.class}-${index}`,
        unique: `${timestamp}-${p.class}-${item.localizacao}`,
        class: p.class,
        class_pt: p.class_pt || (p.class === 'bird' ? 'Pássaro' : 'Ave'),
        confidence: p.confidence || 0.7,
        localizacao: item.localizacao || 'Não especificada',
        timestamp: timestamp,
        severidade: item.nivelRisco?.toLowerCase() || 'media',
        status: 'ativo',
        area: item.areaAfetada || 'Área não especificada',
        cultura: item.cultura || 'Não especificada',
        perda: item.perdaEstimada || 0,
        camera: item.camera
      });
    });
  }
  
  // Formato simples
  else {
    deteccoes.push({
      id: `${timestamp}-${item.class}-0`,
      unique: `${timestamp}-${item.class}-${item.localizacao}`,
      class: item.class || 'bird',
      class_pt: item.class_pt || (item.class === 'bird' ? 'Pássaro' : 'Ave'),
      confidence: item.confidence || 0.8,
      localizacao: item.localizacao || 'Não especificada',
      timestamp: timestamp,
      severidade: item.severidade || (item.confidence > 0.7 ? 'alta' : 'media'),
      status: 'ativo',
      area: item.areaAfetada || 'Área não especificada',
      cultura: item.cultura || 'Não especificada',
      perda: item.perdaEstimada || 0,
      camera: item.camera
    });
  }
  
  return deteccoes;
};

export default function GestaoAves({ 
  deteccoesExternas = [],    // Da DeteccaoPragas
  monitoramentos = [],       // Do MonitoramentoCampo
  alertasMapa = []           // Do MapaRisco
}) {
  const [filtro, setFiltro] = useState('todos');
  const [audioAtivo, setAudioAtivo] = useState(true);
  const [deteccoes, setDeteccoes] = useState([]);
  const [resolvidos, setResolvidos] = useState({});

  // Processar todas as fontes de dados
  useEffect(() => {
    console.log('🐦 GestaoAves - Props recebidas:', {
      deteccoesExternas: deteccoesExternas?.length,
      monitoramentos: monitoramentos?.length,
      alertasMapa: alertasMapa?.length
    });
    
    const todasDeteccoes = [];
    const idsVistos = new Set();
    
    // Função auxiliar para adicionar apenas se não existir
    const adicionarSeUnico = (deteccoes) => {
      deteccoes.forEach(d => {
        if (!idsVistos.has(d.unique)) {
          idsVistos.add(d.unique);
          todasDeteccoes.push(d);
        }
      });
    };
    
    // Processar deteccoesExternas
    deteccoesExternas.forEach(item => {
      if (isAve(item)) {
        const extraidas = extrairDeteccoes(item);
        adicionarSeUnico(extraidas);
      }
    });
    
    // Processar monitoramentos
    monitoramentos.forEach(item => {
      if (isAve(item)) {
        const extraidas = extrairDeteccoes(item);
        adicionarSeUnico(extraidas);
      }
    });
    
    // Processar alertasMapa
    alertasMapa.forEach(item => {
      if (isAve(item)) {
        const extraidas = extrairDeteccoes(item);
        adicionarSeUnico(extraidas);
      }
    });
    
    // Ordenar por data (mais recentes primeiro)
    const ordenadas = todasDeteccoes.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    setDeteccoes(ordenadas);
    console.log(`🐦 Total de aves processadas: ${ordenadas.length}`, ordenadas);
    
  }, [deteccoesExternas, monitoramentos, alertasMapa]);

  // Aplicar status resolvido
  const deteccoesComStatus = useMemo(() => {
    return deteccoes.map(d => ({
      ...d,
      status: resolvidos[d.id] ? 'resolvido' : 'ativo'
    }));
  }, [deteccoes, resolvidos]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const ativas = deteccoesComStatus.filter(d => d.status === 'ativo');
    const criticas = ativas.filter(d => d.severidade === 'alta' || d.severidade === 'critica');
    const perdaTotal = ativas.reduce((acc, d) => acc + (d.perda || 0), 0);
    
    // Contar espécies únicas
    const especies = new Set(ativas.map(d => d.class_pt));
    
    return {
      totalDetecoes: deteccoesComStatus.length,
      ativos: ativas.length,
      resolvidos: deteccoesComStatus.filter(d => d.status === 'resolvido').length,
      areasCriticas: criticas.length,
      perdaTotal,
      especiesIdentificadas: Array.from(especies)
    };
  }, [deteccoesComStatus]);

  // Filtrar por status/severidade
  const deteccoesFiltradas = useMemo(() => {
    let filtradas = deteccoesComStatus;
    
    switch(filtro) {
      case 'ativos':
        filtradas = filtradas.filter(d => d.status === 'ativo');
        break;
      case 'resolvidos':
        filtradas = filtradas.filter(d => d.status === 'resolvido');
        break;
      case 'criticos':
        filtradas = filtradas.filter(d => 
          d.status === 'ativo' && (d.severidade === 'alta' || d.severidade === 'critica')
        );
        break;
      default:
        break;
    }
    
    return filtradas;
  }, [deteccoesComStatus, filtro]);

  const falarResumo = () => {
    if (!audioAtivo) return;
    
    const mensagem = `Gestão de Aves. Temos ${estatisticas.ativos} focos ativos. ` +
      `Áreas críticas: ${estatisticas.areasCriticas}. ` +
      `Espécies identificadas: ${estatisticas.especiesIdentificadas.join(', ')}. ` +
      (deteccoesFiltradas[0] ? `Última deteção em ${deteccoesFiltradas[0].localizacao}.` : '');
    
    vozService.falar(mensagem);
  };

  const marcarComoResolvido = (id) => {
    setResolvidos(prev => ({ ...prev, [id]: true }));
    vozService.falar('Ocorrência marcada como resolvida');
  };

  const getSeveridadeCor = (severidade) => {
    switch(severidade?.toLowerCase()) {
      case 'alta':
      case 'critica':
        return cores.vermelho;
      case 'media':
        return cores.amarelo;
      default:
        return cores.verdeAlface;
    }
  };

  const getSeveridadeBg = (severidade) => {
    switch(severidade?.toLowerCase()) {
      case 'alta':
      case 'critica':
        return '#FEF2F2';
      case 'media':
        return '#FEF3C7';
      default:
        return '#F0FDF4';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.verdeAlface, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bird size={32} color={cores.amarelo} />
            Gestão de Aves
          </h1>
          <p style={{ color: '#666', marginTop: '5px' }}>
            {estatisticas.totalDetecoes} deteções • {estatisticas.ativos} ativos • {estatisticas.especiesIdentificadas.length} espécies
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setAudioAtivo(!audioAtivo)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: audioAtivo ? cores.verdePimenta : cores.vermelho,
              color: audioAtivo ? cores.verdeAlface : 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {audioAtivo ? <Volume2 size={18} /> : <Bell size={18} />}
            {audioAtivo ? 'Áudio Ativo' : 'Alertas Mudos'}
          </button>

          <button
            onClick={falarResumo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: cores.verdeAlface,
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <BellRing size={18} />
            Falar Resumo
          </button>
        </div>
      </motion.div>

      {/* Cards de estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <motion.div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.verdeAlface }}>
            {estatisticas.totalDetecoes}
          </div>
          <div style={{ color: '#666' }}>Total de Deteções</div>
        </motion.div>

        <motion.div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.amarelo }}>
            {estatisticas.ativos}
          </div>
          <div style={{ color: '#666' }}>Focos Ativos</div>
        </motion.div>

        <motion.div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.vermelho }}>
            {estatisticas.areasCriticas}
          </div>
          <div style={{ color: '#666' }}>Áreas Críticas</div>
        </motion.div>

        <motion.div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.azul }}>
            {estatisticas.especiesIdentificadas.length}
          </div>
          <div style={{ color: '#666' }}>Espécies</div>
        </motion.div>
      </div>

      {/* Espécies identificadas */}
      {estatisticas.especiesIdentificadas.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '15px',
          marginBottom: '20px',
          border: `1px solid ${cores.verdeClaro}`
        }}>
          <h3 style={{ color: cores.verdeAlface, marginBottom: '10px' }}>🔍 Espécies Identificadas</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {estatisticas.especiesIdentificadas.map((especie, index) => (
              <span
                key={index}
                style={{
                  padding: '5px 15px',
                  background: cores.verdeClaro,
                  color: cores.verdeAlface,
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}
              >
                {especie}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {['todos', 'ativos', 'resolvidos', 'criticos'].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            style={{
              padding: '8px 15px',
              background: filtro === tipo ? cores.verdePimenta : 'white',
              color: filtro === tipo ? cores.verdeAlface : '#666',
              border: `1px solid ${cores.verdeClaro}`,
              borderRadius: '20px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: filtro === tipo ? 'bold' : 'normal'
            }}
          >
            {tipo}
          </button>
        ))}
        <Filter size={20} color="#999" style={{ marginLeft: 'auto' }} />
      </div>

      {/* Lista de deteções */}
      {deteccoesFiltradas.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: cores.verdeClaro,
          borderRadius: '15px',
          color: cores.cinza
        }}>
          <Bird size={48} color={cores.cinza} style={{ marginBottom: '15px' }} />
          <h3 style={{ color: cores.verdeAlface, marginBottom: '10px' }}>Nenhuma deteção de aves</h3>
          <p>As deteções de aves aparecerão aqui automaticamente quando forem identificadas pela IA.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {deteccoesFiltradas.map((deteccao, index) => (
            <motion.div
              key={deteccao.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                ...ocorrenciaCardStyle,
                background: getSeveridadeBg(deteccao.severidade),
                border: `1px solid ${getSeveridadeCor(deteccao.severidade)}30`,
                opacity: deteccao.status === 'resolvido' ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'white',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bird size={24} color={getSeveridadeCor(deteccao.severidade)} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: cores.verdeAlface }}>
                      {deteccao.class_pt}
                      {deteccao.camera && <span style={{ fontSize: '0.7rem', color: cores.cinza, marginLeft: '5px' }}>({deteccao.camera})</span>}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      background: deteccao.confidence > 0.7 ? '#FEE2E2' : '#FEF3C7',
                      color: deteccao.confidence > 0.7 ? cores.vermelho : cores.amarelo
                    }}>
                      {Math.round((deteccao.confidence || 0.8) * 100)}%
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: '#666', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={12} /> {deteccao.localizacao}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {new Date(deteccao.timestamp).toLocaleString()}
                    </span>
                    {deteccao.area && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <TrendingUp size={12} /> {deteccao.area}
                      </span>
                    )}
                    {deteccao.perda > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: cores.vermelho }}>
                        <DollarSign size={12} /> {deteccao.perda.toLocaleString()} Kz
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {deteccao.status !== 'resolvido' && (
                <button
                  onClick={() => marcarComoResolvido(deteccao.id)}
                  style={{
                    padding: '8px 12px',
                    background: cores.verdePimenta,
                    color: cores.verdeAlface,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 'bold'
                  }}
                >
                  <CheckCircle size={14} /> Resolver
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const statCardStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const ocorrenciaCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '15px',
  background: 'white',
  borderRadius: '12px',
  marginBottom: '10px',
  transition: 'all 0.2s'
};