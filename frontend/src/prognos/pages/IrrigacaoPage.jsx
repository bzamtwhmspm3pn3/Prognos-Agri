import React, { useState, useEffect, useCallback } from 'react';
import { Droplets, Thermometer, Wind, CloudRain, Gauge, Plus, Trash2, Play, Pause, Settings, Loader, AlertTriangle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { getIrrigacaoStatus, criarSensor, atualizarSensor, removerSensor, controlarIrrigacao } from '../../services/irrigacaoService';

const tipoSensorOptions = [
  { value: 'humidade_solo', label: 'Humidade do Solo', icon: Droplets, cor: '#3b82f6' },
  { value: 'temperatura', label: 'Temperatura', icon: Thermometer, cor: '#ef4444' },
  { value: 'humidade_ar', label: 'Humidade do Ar', icon: Wind, cor: '#06b6d4' },
  { value: 'chuva', label: 'Pluviómetro', icon: CloudRain, cor: '#8b5cf6' },
  { value: 'fluxo_agua', label: 'Fluxo de Água', icon: Gauge, cor: '#10b981' },
];

function getIcon(tipo) {
  const found = tipoSensorOptions.find(t => t.value === tipo);
  return found || tipoSensorOptions[0];
}

export default function IrrigacaoPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [irrigando, setIrrigando] = useState(false);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [novoSensor, setNovoSensor] = useState({ nome: '', tipo: 'humidade_solo', localizacao: '' });
  const [sensorEditando, setSensorEditando] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getIrrigacaoStatus();
      if (res.success) {
        setData(res.data);
        setIrrigando(res.data.irrigacaoAtiva);
      }
    } catch (err) {
      console.error('Erro ao carregar irrigação:', err);
      setError('Erro ao carregar dados de irrigação');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleControlar = async (acao) => {
    try {
      const res = await controlarIrrigacao(acao);
      if (res.success) setIrrigando(acao === 'ligar');
    } catch (err) {
      console.error('Erro ao controlar:', err);
    }
  };

  const handleAdicionarSensor = async (e) => {
    e.preventDefault();
    try {
      const res = await criarSensor(novoSensor);
      if (res.success) {
        setShowAddSensor(false);
        setNovoSensor({ nome: '', tipo: 'humidade_solo', localizacao: '' });
        carregar();
      }
    } catch (err) {
      console.error('Erro ao criar sensor:', err);
    }
  };

  const handleRemoverSensor = async (id) => {
    if (!window.confirm('Remover este sensor?')) return;
    try {
      await removerSensor(id);
      carregar();
    } catch (err) {
      console.error('Erro ao remover:', err);
    }
  };

  if (loading && !data) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Loader className="spinner" /></div>;
  }

  const sensores = data?.sensores || [];
  const alertas = data?.alertas || [];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            💧 Irrigação Inteligente
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {data?.sensores?.[0]?.simulado !== false
              ? 'Modo simulação — sensores virtuais activos. Configure sensores reais para dados reais.'
              : 'Sensores reais conectados'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={carregar}><RefreshCw size={16} /> Actualizar</button>
          <button className="btn btn-primary" onClick={() => setShowAddSensor(true)}><Plus size={16} /> Adicionar Sensor</button>
        </div>
      </div>

      {data?.sensores?.[0]?.simulado !== false && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
          borderRadius: 'var(--radius)', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--accent-dark)'
        }}>
          <AlertTriangle size={18} />
          <span>Modo simulação activo. Quando tiveres sensores IoT reais, adiciona-os e a simulação será automaticamente substituída.</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius)', marginBottom: '16px', color: '#ef4444', fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Estado da Irrigação */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div style={{
          padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: irrigando ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)',
          borderColor: irrigando ? '#3b82f6' : 'var(--border)'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Estado</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: irrigando ? '#3b82f6' : 'var(--text-primary)' }}>
            {irrigando ? '💧 A Irrigar' : '☀️ Parado'}
          </div>
        </div>
        <div style={{ padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Sensores</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{sensores.length}</div>
        </div>
        <div style={{ padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Alertas</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: alertas.length > 0 ? '#ef4444' : '#4A7C59' }}>
            {alertas.length}
          </div>
        </div>
        <div style={{
          padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--bg-card)', display: 'flex', gap: '8px', alignItems: 'center'
        }}>
          <button className={`btn ${irrigando ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }}
            onClick={() => handleControlar(irrigando ? 'desligar' : 'ligar')}>
            {irrigando ? <Pause size={16} /> : <Play size={16} />}
            {irrigando ? 'Desligar' : 'Ligar Irrigação'}
          </button>
        </div>
      </div>

      {/* Sensores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {sensores.map(sensor => {
          const iconConfig = getIcon(sensor.tipo);
          const valor = sensor.ultimoValor?.valor ?? 0;
          const limiteInf = sensor.config?.limiteInferior || 0;
          const limiteSup = sensor.config?.limiteSuperior || 100;
          const emAlerta = valor < limiteInf || valor > limiteSup;
          const percent = Math.min(100, Math.max(0, ((valor - 0) / (limiteSup - 0)) * 100));

          return (
            <div key={sensor._id} style={{
              padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
              background: 'var(--bg-card)', position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${iconConfig.cor}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <iconConfig.icon size={20} color={iconConfig.cor} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sensor.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {sensor.localizacao || iconConfig.label}
                      {!sensor.simulado && <span style={{ color: '#4A7C59', marginLeft: '4px' }}>• Real</span>}
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => handleRemoverSensor(sensor._id)}
                  style={{ padding: '6px', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '2rem', fontWeight: 800, color: emAlerta ? '#ef4444' : 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'baseline', gap: '4px'
                }}>
                  {valor}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {sensor.config?.unidade || '%'}
                  </span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div style={{
                width: '100%', height: '6px', background: 'var(--bg-body)',
                borderRadius: '3px', overflow: 'hidden', marginBottom: '8px'
              }}>
                <div style={{
                  width: `${percent}%`, height: '100%',
                  background: emAlerta ? '#ef4444' : 'linear-gradient(90deg, #3b82f6, #4A7C59)',
                  borderRadius: '3px', transition: 'width 0.5s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Mín: {limiteInf}</span>
                <span>Máx: {limiteSup}</span>
              </div>

              {emAlerta && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px',
                  padding: '6px 10px', background: 'rgba(239,68,68,0.1)',
                  borderRadius: 'var(--radius)', fontSize: '0.8rem', color: '#ef4444'
                }}>
                  <AlertTriangle size={14} />
                  {valor < limiteInf ? 'Abaixo do mínimo' : 'Acima do máximo'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <PrognosCard title="Alertas Activos" icon={<AlertTriangle size={18} />} style={{ marginBottom: '24px' }}>
          {alertas.map((a, i) => (
            <div key={i} className="alert-card alert-critical" style={{ marginBottom: '8px' }}>
              <strong>{a.nome}</strong><br />
              <span style={{ fontSize: '0.85rem' }}>{a.mensagem}</span>
            </div>
          ))}
        </PrognosCard>
      )}

      {/* Modal Adicionar Sensor */}
      {showAddSensor && (
        <div className="modal-overlay" onClick={() => setShowAddSensor(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Adicionar Sensor</h2>
              <button className="modal-close" onClick={() => setShowAddSensor(false)}>✕</button>
            </div>
            <form onSubmit={handleAdicionarSensor} style={{ display: 'grid', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Nome do Sensor</label>
                <input type="text" className="input" placeholder="Ex: Sensor Sul" required
                  value={novoSensor.nome} onChange={e => setNovoSensor(prev => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input" value={novoSensor.tipo}
                  onChange={e => setNovoSensor(prev => ({ ...prev, tipo: e.target.value }))}>
                  {tipoSensorOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Localização</label>
                <input type="text" className="input" placeholder="Ex: Talhão Norte"
                  value={novoSensor.localizacao} onChange={e => setNovoSensor(prev => ({ ...prev, localizacao: e.target.value }))} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Quando conectares um sensor real, os dados simulados serão substituídos automaticamente.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Adicionar</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddSensor(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
