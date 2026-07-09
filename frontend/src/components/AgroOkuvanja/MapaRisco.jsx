// src/components/AgroOkuvanja/MapaRisco.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, AlertTriangle, Thermometer, Droplets,
  Wind, Sun, Cloud, TrendingUp, Volume2,
  Download, Share2, Layers, Crosshair, Camera,
  MapPin, Navigation, Compass, Eye, Target,
  Radio, Wifi, Battery, Clock, Calendar,
  ChevronRight, Info, Maximize2, Minimize2,
  Bird, Rat, Bug, DollarSign, Shield
} from 'lucide-react';
import vozService from '../../services/vozService';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444',
  amarelo: '#F59E0B',
  laranja: '#F97316',
  azul: '#3B82F6',
  roxo: '#8B5CF6',
  rosa: '#EC4899',
  cinza: '#6B7280'
};

export default function MapaRisco({ deteccoes = [], onAtualizarDashboard }) {
  const [dados, setDados] = useState(null);
  const [camadaAtiva, setCamadaAtiva] = useState('risco');
  const [areaSelecionada, setAreaSelecionada] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [estatisticas, setEstatisticas] = useState({
    totalAreas: 0,
    totalDeteccoes: 0,
    totalPragas: 0,
    riscoCritico: 0,
    riscoAlto: 0,
    riscoMedio: 0,
    riscoBaixo: 0,
    riscoMinimo: 0,
    perdaTotal: 0,
    confiancaMedia: 0
  });

  useEffect(() => {
    processarDeteccoes();
  }, [deteccoes]);

  // Função para calcular nível de risco baseado na confiança
  const calcularNivelRisco = (deteccao) => {
    if (!deteccao.detections || deteccao.detections.length === 0) {
      return 'minimo';
    }

    // Média das confianças das detecções
    const somaConfianca = deteccao.detections.reduce((acc, det) => 
      acc + (det.confidence || 0), 0);
    const mediaConfianca = somaConfianca / deteccao.detections.length;

    // Quantidade de pragas detectadas
    const totalPragas = deteccao.total_count || 1;

    // Calcular risco baseado na confiança e quantidade
    if (mediaConfianca > 0.8 && totalPragas > 10) return 'critico';
    if (mediaConfianca > 0.7 && totalPragas > 5) return 'alto';
    if (mediaConfianca > 0.5 && totalPragas > 3) return 'medio';
    if (mediaConfianca > 0.3) return 'baixo';
    
    return 'minimo';
  };

  const processarDeteccoes = () => {
    try {
      console.log('🗺️ Processando deteções existentes:', deteccoes?.length || 0);

      if (!deteccoes || deteccoes.length === 0) {
        setDados(null);
        setEstatisticas({
          totalAreas: 0,
          totalDeteccoes: 0,
          totalPragas: 0,
          riscoCritico: 0,
          riscoAlto: 0,
          riscoMedio: 0,
          riscoBaixo: 0,
          riscoMinimo: 0,
          perdaTotal: 0,
          confiancaMedia: 0
        });
        return;
      }

      // Agrupar por localização
      const areas = {};
      let totalRiscoCritico = 0, totalRiscoAlto = 0, totalRiscoMedio = 0, 
          totalRiscoBaixo = 0, totalRiscoMinimo = 0;
      let somaConfianca = 0;
      let totalDeteccoesComConfianca = 0;

      deteccoes.forEach((deteccao, index) => {
        // Usar localização real da deteção
        const localizacao = deteccao.localizacao || 
          (deteccao.cultura ? `Talhão ${deteccao.cultura}` : `Área ${Math.floor(index / 3) + 1}`);
        const areaKey = localizacao.replace(/\s+/g, '_').toLowerCase();
        
        // Calcular nível de risco
        const nivelRisco = calcularNivelRisco(deteccao);
        
        // Atualizar contadores de risco
        if (nivelRisco === 'critico') totalRiscoCritico++;
        else if (nivelRisco === 'alto') totalRiscoAlto++;
        else if (nivelRisco === 'medio') totalRiscoMedio++;
        else if (nivelRisco === 'baixo') totalRiscoBaixo++;
        else totalRiscoMinimo++;

        // Calcular confiança média
        if (deteccao.detections && deteccao.detections.length > 0) {
          const confiancas = deteccao.detections.map(d => d.confidence || 0);
          const mediaDet = confiancas.reduce((a, b) => a + b, 0) / confiancas.length;
          somaConfianca += mediaDet;
          totalDeteccoesComConfianca++;
        }

        if (!areas[areaKey]) {
          areas[areaKey] = {
            id: areaKey,
            nome: localizacao,
            coordenadas: {
              lat: -8.8383 + ((index * 13) % 100) / 1000,
              lon: 13.2344 + ((index * 7) % 100) / 1000
            },
            deteccoes: [],
            totalPragas: 0,
            riscoPredominante: nivelRisco,
            niveisRisco: {
              critico: 0,
              alto: 0,
              medio: 0,
              baixo: 0,
              minimo: 0
            },
            confiancaMedia: 0,
            tiposPragas: {
              roedores: 0,
              aves: 0,
              outros: 0
            },
            perdaTotal: 0,
            ultimaDeteccao: deteccao.timestamp || new Date().toISOString()
          };
        }
        
        // Adicionar deteção à área
        areas[areaKey].deteccoes.push(deteccao);
        areas[areaKey].totalPragas += deteccao.total_count || 1;
        areas[areaKey].perdaTotal += deteccao.perdaEstimada || 0;
        
        // Atualizar contadores de risco da área
        areas[areaKey].niveisRisco[nivelRisco]++;
        
        // Calcular confiança média da área
        if (deteccao.detections && deteccao.detections.length > 0) {
          const confiancas = deteccao.detections.map(d => d.confidence || 0);
          const mediaDet = confiancas.reduce((a, b) => a + b, 0) / confiancas.length;
          areas[areaKey].confiancaMedia = areas[areaKey].confiancaMedia 
            ? (areas[areaKey].confiancaMedia + mediaDet) / 2 
            : mediaDet;
        }
        
        // Extrair tipos de pragas
        if (deteccao.detections) {
          deteccao.detections.forEach(det => {
            const classe = det.class?.toLowerCase() || '';
            const classPt = det.class_pt?.toLowerCase() || '';
            
            if (classe.includes('rat') || classe.includes('mouse') || 
                classPt.includes('rato') || classPt.includes('ratazana')) {
              areas[areaKey].tiposPragas.roedores++;
            } else if (classe.includes('bird') || classe.includes('pigeon') || 
                       classPt.includes('pássaro') || classPt.includes('ave')) {
              areas[areaKey].tiposPragas.aves++;
            } else {
              areas[areaKey].tiposPragas.outros++;
            }
          });
        }

        // Determinar risco predominante da área
        const niveis = areas[areaKey].niveisRisco;
        if (niveis.critico > 0) areas[areaKey].riscoPredominante = 'critico';
        else if (niveis.alto > 0) areas[areaKey].riscoPredominante = 'alto';
        else if (niveis.medio > 0) areas[areaKey].riscoPredominante = 'medio';
        else if (niveis.baixo > 0) areas[areaKey].riscoPredominante = 'baixo';
        else areas[areaKey].riscoPredominante = 'minimo';
      });

      // Calcular estatísticas finais
      const areasList = Object.values(areas);
      const totalPragas = deteccoes.reduce((acc, d) => acc + (d.total_count || 0), 0);
      const perdaTotal = deteccoes.reduce((acc, d) => acc + (d.perdaEstimada || 0), 0);
      const confiancaMedia = totalDeteccoesComConfianca > 0 
        ? (somaConfianca / totalDeteccoesComConfianca) 
        : 0;

      setEstatisticas({
        totalAreas: areasList.length,
        totalDeteccoes: deteccoes.length,
        totalPragas: totalPragas,
        riscoCritico: totalRiscoCritico,
        riscoAlto: totalRiscoAlto,
        riscoMedio: totalRiscoMedio,
        riscoBaixo: totalRiscoBaixo,
        riscoMinimo: totalRiscoMinimo,
        perdaTotal: perdaTotal,
        confiancaMedia: confiancaMedia
      });

      setDados({
        areas: areasList,
        centro: { lat: -8.8383, lon: 13.2344 },
        zoom: 13
      });

    } catch (error) {
      console.error('Erro ao processar deteções:', error);
    }
  };

  const getCorRisco = (risco) => {
    switch(risco) {
      case 'critico': return cores.vermelho;
      case 'alto': return cores.laranja;
      case 'medio': return cores.amarelo;
      case 'baixo': return cores.verdePimenta;
      default: return cores.azul;
    }
  };

  const getDescricaoRisco = (risco) => {
    switch(risco) {
      case 'critico': return 'CRÍTICO - Ação imediata necessária';
      case 'alto': return 'ALTO - Monitoramento intensivo';
      case 'medio': return 'MÉDIO - Atenção necessária';
      case 'baixo': return 'BAIXO - Monitoramento regular';
      default: return 'MÍNIMO - Sem risco aparente';
    }
  };

  const getNomeRisco = (risco) => {
    switch(risco) {
      case 'critico': return 'Crítico';
      case 'alto': return 'Alto';
      case 'medio': return 'Médio';
      case 'baixo': return 'Baixo';
      default: return 'Mínimo';
    }
  };

  const falarMapa = () => {
    if (!estatisticas.totalAreas) {
      vozService.falar('Não há deteções para análise de risco.');
      return;
    }
    
    const mensagem = `Análise de Risco baseada em ${estatisticas.totalDeteccoes} deteções. ` +
      `${estatisticas.riscoCritico} áreas de risco crítico, ${estatisticas.riscoAlto} de risco alto, ` +
      `${estatisticas.riscoMedio} de risco médio. ` +
      `Confiança média das deteções: ${Math.round(estatisticas.confiancaMedia * 100)} por cento.`;
    
    vozService.falar(mensagem);
  };

  const getConfiancaCor = (confianca) => {
    if (confianca > 0.8) return cores.vermelho;
    if (confianca > 0.6) return cores.laranja;
    if (confianca > 0.4) return cores.amarelo;
    return cores.verdePimenta;
  };

  // Se não há deteções
  if (!deteccoes || deteccoes.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'white',
        borderRadius: '24px',
        border: `2px dashed ${cores.verdeClaro}`
      }}>
        <Shield size={64} color={cores.verdeClaro} />
        <h3 style={{ color: cores.verdeAlface, margin: '20px 0' }}>
          Nenhuma deteção disponível
        </h3>
        <p style={{ color: cores.cinza }}>
          As deteções de pragas aparecerão automaticamente no mapa de risco.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2rem', color: cores.verdeAlface, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map size={32} color={cores.verdePimenta} />
            Mapa de Risco
          </h1>
          <p style={{ color: cores.cinza, marginTop: '5px' }}>
            {estatisticas.totalAreas} áreas analisadas • {estatisticas.totalDeteccoes} deteções
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={falarMapa} style={audioButtonStyle}>
            <Volume2 size={16} /> Falar Análise
          </button>
        </div>
      </div>

      {/* Cards de estatísticas de risco - CORRIGIDO */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <AlertTriangle size={20} color={cores.vermelho} />
          <div>
            <div style={statValueStyle}>{estatisticas.riscoCritico || 0}</div>
            <div style={statLabelStyle}>Risco Crítico</div>
          </div>
        </div>
        
        <div style={statCardStyle}>
          <AlertTriangle size={20} color={cores.laranja} />
          <div>
            <div style={statValueStyle}>{estatisticas.riscoAlto || 0}</div>
            <div style={statLabelStyle}>Risco Alto</div>
          </div>
        </div>
        
        <div style={statCardStyle}>
          <AlertTriangle size={20} color={cores.amarelo} />
          <div>
            <div style={statValueStyle}>{estatisticas.riscoMedio || 0}</div>
            <div style={statLabelStyle}>Risco Médio</div>
          </div>
        </div>
        
        <div style={statCardStyle}>
          <Shield size={20} color={cores.verdePimenta} />
          <div>
            <div style={statValueStyle}>
              {estatisticas.confiancaMedia ? Math.round(estatisticas.confiancaMedia * 100) : 0}%
            </div>
            <div style={statLabelStyle}>Confiança Média</div>
          </div>
        </div>
      </div>

      {/* Mapa de risco */}
      <div style={mapaContainerStyle}>
        {/* Grid de fundo */}
        <div style={mapaGridStyle}>
          {[...Array(10)].map((_, i) => (
            <div key={`h${i}`} style={{
              ...gridLinhaStyle,
              top: `${i * 10}%`
            }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v${i}`} style={{
              ...gridColunaStyle,
              left: `${i * 10}%`
            }} />
          ))}
        </div>

        {/* Marcadores de área com nível de risco */}
        {dados?.areas.map((area, index) => {
          const corRisco = getCorRisco(area.riscoPredominante);
          const tamanho = 40 + (Math.min(area.totalPragas, 20) * 2);
          
          return (
            <motion.div
              key={area.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              style={{
                position: 'absolute',
                left: `${20 + (index * 8) % 60}%`,
                top: `${20 + (Math.floor(index / 8) * 15) % 60}%`,
                cursor: 'pointer',
                zIndex: areaSelecionada?.id === area.id ? 10 : 1
              }}
              onClick={() => setAreaSelecionada(areaSelecionada?.id === area.id ? null : area)}
            >
              {/* Marcador principal */}
              <div style={{
                width: `${tamanho}px`,
                height: `${tamanho}px`,
                background: `${corRisco}40`,
                border: `3px solid ${corRisco}`,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: areaSelecionada?.id === area.id ? `0 0 20px ${corRisco}` : 'none',
                backdropFilter: 'blur(2px)'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: corRisco }}>
                  {area.totalPragas}
                </span>
                <span style={{ fontSize: '0.6rem', color: cores.cinza }}>{area.nome}</span>
              </div>

              {/* Tooltip com informações detalhadas */}
              <AnimatePresence>
                {areaSelecionada?.id === area.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    style={{
                      position: 'absolute',
                      bottom: '70px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      width: '300px',
                      zIndex: 100,
                      border: `1px solid ${corRisco}`
                    }}
                  >
                    <h4 style={{ color: cores.verdeAlface, marginBottom: '15px', fontSize: '1.1rem' }}>
                      {area.nome}
                    </h4>
                    
                    <div style={tooltipRowStyle}>
                      <Shield size={14} color={corRisco} />
                      <span>
                        <strong>Risco {getNomeRisco(area.riscoPredominante)}</strong>
                        <span style={{ fontSize: '0.7rem', color: cores.cinza, marginLeft: '5px' }}>
                          {getDescricaoRisco(area.riscoPredominante)}
                        </span>
                      </span>
                    </div>

                    <div style={tooltipRowStyle}>
                      <Target size={14} color={cores.cinza} />
                      <span>Confiança média: <strong>{Math.round((area.confiancaMedia || 0) * 100)}%</strong></span>
                    </div>
                    
                    <div style={tooltipDividerStyle} />

                    <div style={tooltipRowStyle}>
                      <Bug size={14} color={cores.cinza} />
                      <span><strong>{area.totalPragas || 0}</strong> pragas detectadas</span>
                    </div>
                    
                    <div style={tooltipRowStyle}>
                      <Clock size={14} color={cores.cinza} />
                      <span>Última: {new Date(area.ultimaDeteccao).toLocaleString()}</span>
                    </div>

                    {area.tiposPragas.roedores > 0 && (
                      <div style={tooltipRowStyle}>
                        <Rat size={14} color={cores.verdeAlface} />
                        <span>{area.tiposPragas.roedores} roedores</span>
                      </div>
                    )}
                    
                    {area.tiposPragas.aves > 0 && (
                      <div style={tooltipRowStyle}>
                        <Bird size={14} color={cores.azul} />
                        <span>{area.tiposPragas.aves} aves</span>
                      </div>
                    )}
                    
                    {area.tiposPragas.outros > 0 && (
                      <div style={tooltipRowStyle}>
                        <Bug size={14} color={cores.amarelo} />
                        <span>{area.tiposPragas.outros} outros</span>
                      </div>
                    )}

                    <div style={tooltipDividerStyle} />

                    <div style={tooltipRowStyle}>
                      <AlertTriangle size={14} color={cores.vermelho} />
                      <span>Riscos: Crítico {area.niveisRisco.critico || 0} | Alto {area.niveisRisco.alto || 0}</span>
                    </div>
                    
                    <div style={tooltipRowStyle}>
                      <AlertTriangle size={14} color={cores.amarelo} />
                      <span>Médio {area.niveisRisco.medio || 0} | Baixo {area.niveisRisco.baixo || 0}</span>
                    </div>

                    {area.perdaTotal > 0 && (
                      <div style={tooltipRowStyle}>
                        <DollarSign size={14} color={cores.vermelho} />
                        <span>Perda: {Math.round(area.perdaTotal).toLocaleString()} Kz</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Legenda do mapa */}
        <div style={legendaStyle}>
          <h4 style={{ color: cores.verdeAlface, marginBottom: '10px' }}>Legenda</h4>
          <div style={legendaItemStyle}>
            <div style={{ width: '12px', height: '12px', background: cores.vermelho, borderRadius: '50%' }} />
            <span>Crítico (confiança >80%)</span>
          </div>
          <div style={legendaItemStyle}>
            <div style={{ width: '12px', height: '12px', background: cores.laranja, borderRadius: '50%' }} />
            <span>Alto (confiança >70%)</span>
          </div>
          <div style={legendaItemStyle}>
            <div style={{ width: '12px', height: '12px', background: cores.amarelo, borderRadius: '50%' }} />
            <span>Médio (confiança >50%)</span>
          </div>
          <div style={legendaItemStyle}>
            <div style={{ width: '12px', height: '12px', background: cores.verdePimenta, borderRadius: '50%' }} />
            <span>Baixo (confiança >30%)</span>
          </div>
          <div style={legendaItemStyle}>
            <div style={{ width: '12px', height: '12px', background: cores.azul, borderRadius: '50%' }} />
            <span>Mínimo</span>
          </div>
        </div>
      </div>

      {/* Lista de áreas em risco */}
      <div style={listaContainerStyle}>
        <h3 style={{ color: cores.verdeAlface, marginBottom: '15px' }}>
          Análise por Área ({dados?.areas.length || 0})
        </h3>
        
        <div style={listaGridStyle}>
          {dados?.areas.map(area => {
            const corRisco = getCorRisco(area.riscoPredominante);
            
            return (
              <motion.div
                key={area.id}
                whileHover={{ scale: 1.02 }}
                style={{
                  ...areaCardStyle,
                  borderLeft: `4px solid ${corRisco}`
                }}
                onClick={() => setAreaSelecionada(area)}
              >
                <div style={areaCardHeaderStyle}>
                  <strong>{area.nome}</strong>
                  <span style={{
                    padding: '3px 8px',
                    background: `${corRisco}20`,
                    color: corRisco,
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {getNomeRisco(area.riscoPredominante).toUpperCase()}
                  </span>
                </div>
                
                <div style={areaCardInfoStyle}>
                  <span>🔬 {Math.round((area.confiancaMedia || 0) * 100)}% confiança</span>
                  <span>🐛 {area.totalPragas || 0} pragas</span>
                </div>
                
                <div style={areaCardTiposStyle}>
                  {area.tiposPragas.roedores > 0 && (
                    <span style={tipoPragaBadge(cores.verdeAlface)}>
                      <Rat size={10} /> {area.tiposPragas.roedores}
                    </span>
                  )}
                  {area.tiposPragas.aves > 0 && (
                    <span style={tipoPragaBadge(cores.azul)}>
                      <Bird size={10} /> {area.tiposPragas.aves}
                    </span>
                  )}
                  {area.tiposPragas.outros > 0 && (
                    <span style={tipoPragaBadge(cores.amarelo)}>
                      <Bug size={10} /> {area.tiposPragas.outros}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Estilos
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '15px'
};

const audioButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: cores.verdeAlface,
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '0.95rem'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '15px',
  marginBottom: '20px'
};

const statCardStyle = {
  background: 'white',
  padding: '15px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  border: `1px solid ${cores.verdeClaro}`
};

const statValueStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: cores.verdeAlface
};

const statLabelStyle = {
  fontSize: '0.8rem',
  color: cores.cinza
};

const mapaContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '500px',
  background: '#E8F0E8',
  borderRadius: '15px',
  marginBottom: '20px',
  overflow: 'hidden',
  border: `1px solid ${cores.verdeClaro}`
};

const mapaGridStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

const gridLinhaStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '1px',
  background: 'rgba(130, 183, 77, 0.2)'
};

const gridColunaStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '1px',
  background: 'rgba(130, 183, 77, 0.2)'
};

const tooltipRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
  color: cores.cinza,
  marginBottom: '8px'
};

const tooltipDividerStyle = {
  height: '1px',
  background: cores.verdeClaro,
  margin: '10px 0'
};

const legendaStyle = {
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  background: 'white',
  padding: '15px',
  borderRadius: '10px',
  border: `1px solid ${cores.verdeClaro}`,
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const legendaItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.8rem',
  color: cores.cinza,
  marginBottom: '5px'
};

const listaContainerStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  border: `1px solid ${cores.verdeClaro}`
};

const listaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '10px'
};

const areaCardStyle = {
  background: cores.cinzaClaro,
  padding: '12px',
  borderRadius: '10px',
  cursor: 'pointer'
};

const areaCardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px'
};

const areaCardInfoStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.8rem',
  color: cores.cinza,
  marginBottom: '8px'
};

const areaCardTiposStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap'
};

const tipoPragaBadge = (cor) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  padding: '2px 6px',
  background: `${cor}15`,
  color: cor,
  borderRadius: '12px',
  fontSize: '0.7rem'
});