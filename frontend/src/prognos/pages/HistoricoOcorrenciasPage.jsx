import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Loader, AlertCircle, CheckCircle, X, Bug, Bird, Rat, Download, Trash2 } from 'lucide-react';
import { deteccaoApi } from '../../services/deteccaoApi';
import { useIntegracao } from '../contexts/IntegracaoContext';

const nomesPortugues = {
  'bird': 'Pássaro', 'rat': 'Ratazana', 'mouse': 'Camundongo', 'rodent': 'Roedor',
  'locust': 'Gafanhoto', 'beetle': 'Besouro', 'caterpillar': 'Lagarta',
  'ant': 'Formiga', 'spider': 'Aranha', 'aphid': 'Pulgão',
  'default': 'Praga não identificada'
};

function getIconForClass(cls) {
  const c = cls?.toLowerCase() || '';
  if (['bird', 'pigeon', 'sparrow', 'weaver', 'crow', 'dove'].includes(c)) return 'bird';
  if (['rat', 'mouse', 'rodent', 'squirrel'].includes(c)) return 'rat';
  return 'bug';
}

function getColorForClass(cls) {
  const c = cls?.toLowerCase() || '';
  if (['bird', 'pigeon', 'sparrow', 'weaver', 'crow', 'dove'].includes(c)) return '#F5A623';
  if (['rat', 'mouse', 'rodent', 'squirrel'].includes(c)) return '#8B4513';
  return '#3b82f6';
}

function getCorRisco(nivel) {
  switch (nivel) {
    case 'CRÍTICO': case 'ALTO': return '#ef4444';
    case 'MÉDIO': return '#F5A623';
    case 'BAIXO': return '#4A7C59';
    default: return '#64748b';
  }
}

export default function HistoricoOcorrenciasPage() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroRisco, setFiltroRisco] = useState('');
  const { refreshDashboard } = useIntegracao();

  useEffect(() => {
    carregarOcorrencias();
  }, [refreshDashboard]);

  const carregarOcorrencias = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await deteccaoApi.listar();
      setOcorrencias(data.data || data.deteccoes || []);
    } catch {
      const saved = JSON.parse(localStorage.getItem('prognos_deteccoes') || '[]');
      if (saved.length > 0) {
        setOcorrencias(saved.map((s, i) => ({ ...s, _id: `local_${i}`, resolvido: false })));
      } else {
        setErro('Nenhuma ocorrência encontrada.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async (id) => {
    try {
      await deteccaoApi.resolver(id);
      setOcorrencias(prev => prev.map(o => o._id === id ? { ...o, resolvido: true } : o));
    } catch {}
  };

  const handleApagar = async (id) => {
    try {
      await deteccaoApi.apagar(id);
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch {}
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(ocorrencias, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocorrencias_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ocorrenciasFiltradas = ocorrencias.filter(o => {
    if (filtro) {
      const query = filtro.toLowerCase();
      const dets = o.detections || [];
      const matchNome = dets.some(d => (d.class_pt || '').toLowerCase().includes(query));
      if (!matchNome) return false;
    }
    if (filtroRisco && o.nivelRisco !== filtroRisco) return false;
    return true;
  });

  const stats = {
    total: ocorrencias.length,
    resolvidas: ocorrencias.filter(o => o.resolvido).length,
    altas: ocorrencias.filter(o => o.nivelRisco === 'ALTO' || o.nivelRisco === 'CRÍTICO').length,
    totalPerda: ocorrencias.reduce((s, o) => s + (o.perdaEstimada || 0), 0)
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader className="spinner" size={32} color="var(--secondary)" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            📜 Histórico de Ocorrências
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Todas as pragas detetadas, monitoramento e resultados
          </p>
        </div>
        {ocorrencias.length > 0 && (
          <button className="btn btn-ghost" onClick={handleExport} style={{ fontSize: '0.85rem' }}>
            <Download size={16} /> Exportar
          </button>
        )}
      </div>

      {stats.total > 0 && (
        <div className="grid-4" style={{ gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Ocorrências', value: stats.total, color: 'var(--primary)' },
            { label: 'Resolvidas', value: stats.resolvidas, color: '#4A7C59' },
            { label: 'Alto Risco', value: stats.altas, color: '#ef4444' },
            { label: 'Perda Total', value: `${stats.totalPerda.toLocaleString()} Kz`, color: '#F5A623', small: true }
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '16px 20px', background: 'var(--bg-card)',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: stat.small ? '1rem' : '1.5rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Pesquisar por tipo de praga..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              background: 'var(--bg-card)', fontSize: '0.9rem'
            }}
          />
        </div>
        <select
          value={filtroRisco}
          onChange={e => setFiltroRisco(e.target.value)}
          style={{
            padding: '10px 12px', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', background: 'var(--bg-card)', fontSize: '0.9rem'
          }}
        >
          <option value="">Todos os níveis</option>
          <option value="BAIXO">Baixo Risco</option>
          <option value="MÉDIO">Médio Risco</option>
          <option value="ALTO">Alto Risco</option>
          <option value="CRÍTICO">Crítico</option>
        </select>
      </div>

      {erro ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-secondary)' }}>{erro}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ocorrenciasFiltradas.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              Nenhuma ocorrência encontrada com os filtros atuais.
            </p>
          ) : (
            ocorrenciasFiltradas.map((oc, i) => {
              const detections = oc.detections || [];
              const primeiro = detections[0] || {};
              const iconType = getIconForClass(primeiro.class);
              const color = getColorForClass(primeiro.class);
              return (
                <div key={oc._id || i} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', background: 'var(--bg-card)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  opacity: oc.resolvido ? 0.6 : 1
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
                  }}>
                    {iconType === 'bird' ? <Bird size={22} /> :
                     iconType === 'rat' ? <Rat size={22} /> : <Bug size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {detections.map((d, j) => (
                        <span key={j}>
                          {d.class_pt || nomesPortugues[d.class?.toLowerCase()] || nomesPortugues.default}
                          {j < detections.length - 1 && ', '}
                        </span>
                      ))}
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '50px',
                        background: `${getCorRisco(oc.nivelRisco)}20`,
                        color: getCorRisco(oc.nivelRisco), fontWeight: 600
                      }}>
                        {oc.nivelRisco}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {oc.total_count || detections.length} praga(s) • Perda: {(oc.perdaEstimada || 0).toLocaleString()} Kz
                      {oc.createdAt && ` • ${new Date(oc.createdAt).toLocaleDateString('pt-AO')}`}
                      {oc.timestamp && ` • ${new Date(oc.timestamp).toLocaleDateString('pt-AO')}`}
                      {oc.resolvido && ' • ✅ Resolvido'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {!oc.resolvido && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleResolver(oc._id)}
                        style={{ padding: '8px', color: '#4A7C59' }}
                        title="Marcar como resolvido"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      className="btn btn-ghost"
                      onClick={() => handleApagar(oc._id)}
                      style={{ padding: '8px', color: '#ef4444' }}
                      title="Apagar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
