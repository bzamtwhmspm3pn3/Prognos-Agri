// src/components/AgroOkuvanja/RecomendacoesIA.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Brain, Target, CheckCircle, Clock,
  Volume2, Download, Share2, RefreshCw
} from 'lucide-react';
import vozService from '../../services/vozService';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  azul: '#3B82F6',
  roxo: '#8B5CF6'
};

export default function RecomendacoesIA({ onAtualizarDashboard }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    carregarRecomendacoes();
  }, []);

  const carregarRecomendacoes = async () => {
    setCarregando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDados({
        data: new Date().toLocaleDateString('pt-AO'),
        resumo: 'Com base na análise dos últimos 7 dias, identificamos oportunidades de melhoria.',
        recomendacoes: [
          {
            id: 1,
            titulo: 'Aumentar monitoramento noturno',
            descricao: 'Roedores estão mais ativos entre 20h e 23h no Talhão Norte',
            prioridade: 'alta',
            impacto: 'Reduzir perdas em até 25%',
            prazo: 'Imediato'
          },
          {
            id: 2,
            titulo: 'Aplicar repelente natural nas bordas',
            descricao: 'Aves estão atacando o milho nas áreas periféricas',
            prioridade: 'media',
            impacto: 'Proteger 2.5 hectares',
            prazo: 'Até 3 dias'
          },
          {
            id: 3,
            titulo: 'Ajustar calendário de irrigação',
            descricao: 'Previsão de temperaturas elevadas nos próximos dias',
            prioridade: 'media',
            impacto: 'Evitar stress hídrico',
            prazo: 'Esta semana'
          },
          {
            id: 4,
            titulo: 'Inspecionar armadilhas',
            descricao: 'Armadilhas no Talhão Sul precisam de manutenção',
            prioridade: 'baixa',
            impacto: 'Manter eficiência do sistema',
            prazo: '7 dias'
          }
        ],
        insights: [
          'Produtividade 15% acima da média regional',
          'Perdas reduzidas em 12% este mês',
          'Otimização de recursos: água reduzida em 8%'
        ]
      });
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  };

  const atualizarRecomendacoes = async () => {
    setAtualizando(true);
    await carregarRecomendacoes();
    setAtualizando(false);
  };

  const falarRecomendacoes = () => {
    if (!dados) return;
    
    const principais = dados.recomendacoes.slice(0, 2);
    const mensagem = `Recomendações da IA. ${dados.resumo} ` +
      `Prioridade alta: ${principais[0].titulo}. ` +
      `${principais[1].titulo}.`;
    
    vozService.falar(mensagem);
  };

  const getPrioridadeCor = (prioridade) => {
    switch(prioridade) {
      case 'alta': return cores.vermelho;
      case 'media': return cores.amarelo;
      default: return cores.azul;
    }
  };

  if (carregando) return <div>Carregando...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2rem', color: cores.roxo, marginBottom: '5px' }}>
            🤖 Recomendações IA
          </h1>
          <p style={{ color: '#666' }}>Análise preditiva • Atualizado {dados.data}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={atualizarRecomendacoes} style={atualizarButtonStyle} disabled={atualizando}>
            <RefreshCw size={16} className={atualizando ? 'spin' : ''} />
            {atualizando ? 'A atualizar...' : 'Atualizar'}
          </button>
          <button onClick={falarRecomendacoes} style={audioButtonStyle}>
            <Volume2 size={16} /> Falar
          </button>
        </div>
      </div>

      <div style={resumoStyle}>
        <Brain size={24} color={cores.roxo} style={{ marginRight: '10px' }} />
        <span style={{ color: '#666', fontSize: '1.1rem' }}>{dados.resumo}</span>
      </div>

      <div style={recomendacoesListStyle}>
        {dados.recomendacoes.map(rec => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            style={recomendacaoCardStyle}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ color: cores.verdeAlface, fontSize: '1.1rem', marginBottom: '8px' }}>
                {rec.titulo}
              </h3>
              <span style={{
                padding: '4px 12px',
                background: `${getPrioridadeCor(rec.prioridade)}20`,
                color: getPrioridadeCor(rec.prioridade),
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {rec.prioridade.toUpperCase()}
              </span>
            </div>
            
            <p style={{ color: '#666', marginBottom: '12px', fontSize: '0.95rem' }}>
              {rec.descricao}
            </p>
            
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Target size={14} color={cores.verdePimenta} />
                <span style={{ color: '#666' }}>{rec.impacto}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color={cores.azul} />
                <span style={{ color: '#666' }}>{rec.prazo}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={insightsStyle}>
        <h3 style={{ color: cores.azul, marginBottom: '15px' }}>💡 Insights Rápidos</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {dados.insights.map((insight, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              background: 'white',
              borderRadius: '8px'
            }}>
              <CheckCircle size={16} color={cores.verdePimenta} />
              <span style={{ color: '#666' }}>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '15px'
};

const atualizarButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: 'white',
  color: cores.verdeAlface,
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '30px',
  cursor: 'pointer'
};

const audioButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: cores.roxo,
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer'
};

const resumoStyle = {
  background: cores.verdeClaro,
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center'
};

const recomendacoesListStyle = {
  display: 'grid',
  gap: '15px',
  marginBottom: '20px'
};

const recomendacaoCardStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  border: `1px solid ${cores.verdeClaro}`,
  cursor: 'pointer'
};

const insightsStyle = {
  background: cores.verdeClaro,
  borderRadius: '15px',
  padding: '20px'
};