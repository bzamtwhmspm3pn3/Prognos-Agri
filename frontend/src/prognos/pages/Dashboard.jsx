import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Bug, DollarSign, Ruler, AlertTriangle, TrendingUp,
  Cloud, ShoppingBag, Sprout, Calendar, MapPin, BarChart3,
  CheckCircle2, Clock, ArrowRight, Leaf, Tractor, TrendingDown
} from 'lucide-react';
import Stats from '../components/Stats';
import PrognosCard from '../components/PrognosCard';
import { usePrognos } from '../contexts/PrognosContext';
import { useIntegracao } from '../contexts/IntegracaoContext';
import { getDashboard } from '../../services/dashboardService';

const CULTURA_ICONS = {
  milho: '🌽', feijao: '🫘', mandioca: '🌿', batata_doce: '🍠',
  amendoim: '🥜', tomate: '🍅', arroz: '🌾', soja: '🫛',
  cafe: '☕', outra: '🌱'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = usePrognos();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshDashboard, deteccoesRecentes } = useIntegracao();

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDashboard();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshDashboard]);

  const recentCount = deteccoesRecentes.length;
  const resumo = data?.resumo || {};

  if (loading && !data) return <div className="spinner" />;

  const stats = [
    { icon: <Sprout size={22} />, color: '#4A7C59', value: resumo.totalPlantios || 0, label: 'Plantios', change: null },
    { icon: <Ruler size={22} />, color: '#3b82f6', value: `${resumo.areaTotal || 0} ha`, label: 'Área Total', change: null },
    { icon: <DollarSign size={22} />, color: '#F5A623', value: `${(resumo.investimentoTotal || 0).toLocaleString()} Kz`, label: 'Investimento', change: null },
    { icon: <TrendingUp size={22} />, color: '#10b981', value: `${(resumo.lucroTotal || 0).toLocaleString()} Kz`, label: 'Lucro Estimado', change: null },
    { icon: <Camera size={22} />, color: '#8b5cf6', value: resumo.totalScans || 0, label: 'Deteções', change: null },
    { icon: <Bug size={22} />, color: '#ef4444', value: resumo.totalPragas || 0, label: 'Pragas', change: resumo.totalPragas > 0 ? -1 : null },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          Bem-vindo, {user?.username || 'Agricultor'}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          Visão geral de toda a sua actividade no Prognos Agri.
          {recentCount > 0 && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px',
              borderRadius: '50px', background: 'rgba(239,68,68,0.1)',
              color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
              {recentCount} deteção(ões) recente(s)
            </span>
          )}
        </p>
      </div>

      <Stats items={stats} />

      {/* Plantios Recentes */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
            <Sprout size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Plantios Recentes
          </h2>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/app/plantio')}>
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        {data?.ultimosPlantios?.length > 0 ? (
          <div className="grid-2" style={{ gap: '12px' }}>
            {data.ultimosPlantios.map(p => (
              <PrognosCard key={p._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/app/plantio')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{CULTURA_ICONS[p.cultura] || '🌱'}</span>
                      <strong style={{ fontSize: '0.95rem' }}>{p.nome}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.cultura} {p.provincia && `• ${p.provincia}`} {p.area && `• ${p.area} ha`}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600,
                    background: p.status === 'concluido' ? 'rgba(74,124,89,0.15)' :
                                p.status === 'cancelado' ? 'rgba(239,68,68,0.15)' :
                                'rgba(59,130,246,0.15)',
                    color: p.status === 'concluido' ? '#4A7C59' :
                           p.status === 'cancelado' ? '#ef4444' : '#3b82f6'
                  }}>
                    {p.status === 'concluido' ? 'Concluído' :
                     p.status === 'cancelado' ? 'Cancelado' : 'Em curso'}
                  </span>
                </div>
                {p.fases?.length > 0 && (
                  <div style={{ marginTop: '8px', height: '4px', background: 'var(--bg-body)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px',
                      width: `${Math.round(p.fases.filter(f => f.status === 'concluido' || f.status === 'pulado').length / p.fases.length * 100)}%`,
                      background: 'linear-gradient(90deg, #4A7C59, #10b981)'
                    }} />
                  </div>
                )}
              </PrognosCard>
            ))}
          </div>
        ) : (
          <PrognosCard>
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <Sprout size={40} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Nenhum plantio registado ainda</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/plantio')}>
                Criar primeiro plantio
              </button>
            </div>
          </PrognosCard>
        )}
      </div>

      {/* Deteções e Alertas */}
      <div className="grid-2" style={{ marginTop: '24px' }}>
        <PrognosCard title="Tendência de Detecções" subtitle="Últimos 7 dias" icon={<TrendingUp size={18} />}>
          {data?.tendenciaDeteccoes && data.tendenciaDeteccoes.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px', padding: '8px 0' }}>
              {data.tendenciaDeteccoes.map((item, i) => {
                const maxVal = Math.max(...data.tendenciaDeteccoes.map(d => d.quantidade), 1);
                const altura = (item.quantidade / maxVal) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{
                      width: '100%', height: `${altura}%`,
                      background: `linear-gradient(to top, var(--primary), var(--secondary))`,
                      borderRadius: '3px 3px 0 0', minHeight: altura > 0 ? '3px' : '1px',
                      opacity: item.quantidade > 0 ? 1 : 0.2
                    }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {item.data?.split('-')[2] || i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
              Nenhuma detecção nos últimos 7 dias
            </p>
          )}
        </PrognosCard>

        <PrognosCard title="Alertas Recentes" subtitle="Condições de risco" icon={<AlertTriangle size={18} />}>
          {resumo.alertasAtivos > 0 ? (
            <div>
              <div style={{ padding: '10px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', borderLeft: '3px solid #ef4444', marginBottom: '8px' }}>
                <strong style={{ color: '#ef4444', fontSize: '0.9rem' }}>{resumo.alertasAtivos} alerta(s) activo(s)</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Pragas com nível ALTO ou CRÍTICO detectadas
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Culturas: {resumo.culturasAfetadas?.join(', ') || 'Nenhuma'}
              </p>
            </div>
          ) : (
            <div style={{ padding: '10px', background: 'rgba(74,124,89,0.08)', borderRadius: '8px', borderLeft: '3px solid #4A7C59' }}>
              <strong style={{ color: '#4A7C59', fontSize: '0.9rem' }}>Nenhum alerta activo</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tudo dentro da normalidade
              </div>
            </div>
          )}
        </PrognosCard>
      </div>

      {/* Resumo Plantios + Pragas */}
      <div className="grid-3" style={{ marginTop: '16px' }}>
        <PrognosCard title="Estado dos Plantios" icon={<BarChart3 size={18} />}>
          {totalPlantios > 0 ? (
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} color="#3b82f6" /> Em curso</span>
                <strong style={{ color: '#3b82f6' }}>{resumo.plantiosAtivos || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} color="#4A7C59" /> Concluídos</span>
                <strong style={{ color: '#4A7C59' }}>{resumo.plantiosConcluidos || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={14} color="#F5A623" /> Investimento</span>
                <strong style={{ color: '#F5A623', fontSize: '0.8rem' }}>{(resumo.investimentoTotal || 0).toLocaleString()} Kz</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={14} color="#10b981" /> Lucro previsto</span>
                <strong style={{ color: '#10b981', fontSize: '0.8rem' }}>{(resumo.lucroTotal || 0).toLocaleString()} Kz</strong>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
              Sem dados de plantio
            </p>
          )}
        </PrognosCard>

        <PrognosCard title="Culturas Plantadas" icon={<Leaf size={18} />}>
          {data?.plantiosPorCultura?.length > 0 ? (
            <div>
              {data.plantiosPorCultura.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: i < data.plantiosPorCultura.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {CULTURA_ICONS[c.nome] || '🌱'} {c.nome}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.quantidade} planos</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
              Nenhuma cultura registada
            </p>
          )}
        </PrognosCard>

        <PrognosCard title="Pragas por Tipo" icon={<Bug size={18} />}>
          {data?.pragasPorTipo?.length > 0 ? (
            <div>
              {data.pragasPorTipo.slice(0, 5).map((praga, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                  fontSize: '0.85rem'
                }}>
                  <span>{praga.nome}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    {praga.quantidade}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
              Nenhuma praga detectada
            </p>
          )}
        </PrognosCard>
      </div>

      {/* Acesso Rápido */}
      <div className="grid-3" style={{ marginTop: '16px' }}>
        <PrognosCard style={{ cursor: 'pointer' }} onClick={() => navigate('/app/plantio')}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <Sprout size={28} color="#4A7C59" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Gestão de Plantio</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Planos IA, cronograma, investimento</div>
          </div>
        </PrognosCard>

        <PrognosCard style={{ cursor: 'pointer' }} onClick={() => navigate('/app/deteccao')}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <Camera size={28} color="#8b5cf6" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Deteção de Pragas</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Análise IA de imagens</div>
          </div>
        </PrognosCard>

        <PrognosCard style={{ cursor: 'pointer' }} onClick={() => navigate('/app/relatorios')}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <BarChart3 size={28} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Relatórios</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Análises e exportação PDF</div>
          </div>
        </PrognosCard>
      </div>
    </div>
  );
}
