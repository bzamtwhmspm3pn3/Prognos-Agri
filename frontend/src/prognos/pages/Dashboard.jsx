import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Bug, DollarSign, Ruler, AlertTriangle, TrendingUp, Cloud, ShoppingBag } from 'lucide-react';
import Stats from '../components/Stats';
import PrognosCard from '../components/PrognosCard';
import { usePrognos } from '../contexts/PrognosContext';
import { getDashboard } from '../../services/dashboardService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = usePrognos();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await getDashboard();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const stats = data && data.resumo ? [
    { icon: <Camera size={22} />, color: '#3b82f6', value: data.resumo.totalScans, label: 'Total de Scans', change: 12 },
    { icon: <Bug size={22} />, color: '#ef4444', value: data.resumo.totalPragas, label: 'Pragas Detectadas', change: -5 },
    { icon: <DollarSign size={22} />, color: '#F5A623', value: `${(data.resumo.perdaTotal || 0).toLocaleString()} Kz`, label: 'Perda Estimada', change: 8 },
    { icon: <Ruler size={22} />, color: '#4A7C59', value: data.resumo.areasMonitoradas || 0, label: 'Áreas Monitoradas', change: 3 },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          Bem-vindo, {user?.username || 'Agricultor'}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Aqui está o resumo da sua actividade no Prognos Agri.
        </p>
      </div>

      <Stats items={stats} />

      <div className="grid-2" style={{ marginTop: '24px' }}>
        <PrognosCard title="Tendência de Detecções" subtitle="Últimos 7 dias" icon={<TrendingUp size={18} />}>
          {data?.tendenciaDeteccoes && data.tendenciaDeteccoes.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '10px 0' }}>
              {data.tendenciaDeteccoes.map((item, i) => {
                const maxVal = Math.max(...data.tendenciaDeteccoes.map(d => d.quantidade), 1);
                const altura = (item.quantidade / maxVal) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '100%',
                      height: `${altura}%`,
                      background: `linear-gradient(to top, var(--primary), var(--secondary))`,
                      borderRadius: '4px 4px 0 0',
                      minHeight: altura > 0 ? '4px' : '2px',
                      opacity: item.quantidade > 0 ? 1 : 0.3
                    }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {item.data?.split('-')[2] || i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              Nenhuma detecção nos últimos 7 dias
            </p>
          )}
        </PrognosCard>

        <PrognosCard title="Alertas Recentes" subtitle="Condições de risco" icon={<AlertTriangle size={18} />}>
          {data?.resumo?.alertasAtivos > 0 ? (
            <div>
              <div className="alert-card alert-critical">
                <strong>{data.resumo.alertasAtivos} alerta(s) activo(s)</strong>
                <br />
                <span style={{ fontSize: '0.85rem' }}>Pragas com nível ALTO ou CRÍTICO detectadas</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Culturas afectadas: {data.resumo.culturasAfetadas?.join(', ') || 'Nenhuma'}
              </p>
            </div>
          ) : (
            <div className="alert-card alert-low">
              <strong>Nenhum alerta activo</strong>
              <br />
              <span style={{ fontSize: '0.85rem' }}>Tudo dentro da normalidade</span>
            </div>
          )}
        </PrognosCard>
      </div>

      <div className="grid-3" style={{ marginTop: '16px' }}>
        <PrognosCard title="Previsão Climática" subtitle="Condições actuais" icon={<Cloud size={18} />}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌤️</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>27°C</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Parcialmente nublado</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}
              onClick={() => navigate('/app/previsoes')}>
              Ver Previsão Completa
            </button>
          </div>
        </PrognosCard>

        <PrognosCard title="Mercado" subtitle="Preços em tempo real" icon={<ShoppingBag size={18} />}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Milho: 250 Kz/kg
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Feijão: 500 Kz/kg
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Mandioca: 150 Kz/kg
            </div>
            <button className="btn btn-secondary btn-sm"
              onClick={() => navigate('/app/mercado')}>
              Ver Mercado
            </button>
          </div>
        </PrognosCard>

        <PrognosCard title="Pragas por Tipo" subtitle="Distribuição" icon={<Bug size={18} />}>
          {data?.pragasPorTipo && data.pragasPorTipo.length > 0 ? (
            <div>
              {data.pragasPorTipo.slice(0, 5).map((praga, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                  fontSize: '0.85rem'
                }}>
                  <span>{praga.nome}</span>
                  <span className="badge badge-primary">{praga.quantidade}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              Nenhuma praga detectada
            </p>
          )}
        </PrognosCard>
      </div>
    </div>
  );
}
