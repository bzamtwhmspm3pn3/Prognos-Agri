import React, { useState } from 'react';
import { Cloud, Sun, Droplets, Wind, AlertTriangle, Thermometer, Calendar, Loader } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { getPrevisaoClimatica } from '../../services/weatherService';

const provinciasAngola = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const wmoIcons = {
  0: { icone: '☀️', label: 'Céu limpo' },
  1: { icone: '🌤️', label: 'Maioritariamente limpo' },
  2: { icone: '⛅', label: 'Parcialmente nublado' },
  3: { icone: '☁️', label: 'Nublado' },
  45: { icone: '🌫️', label: 'Nevoeiro' },
  48: { icone: '🌫️', label: 'Nevoeiro com geada' },
  51: { icone: '🌦️', label: 'Chuvisco leve' },
  53: { icone: '🌦️', label: 'Chuvisco moderado' },
  55: { icone: '🌧️', label: 'Chuvisco intenso' },
  56: { icone: '🌧️', label: 'Chuvisco gelado leve' },
  57: { icone: '🌧️', label: 'Chuvisco gelado intenso' },
  61: { icone: '🌦️', label: 'Chuva leve' },
  63: { icone: '🌧️', label: 'Chuva moderada' },
  65: { icone: '🌧️', label: 'Chuva forte' },
  66: { icone: '🌧️', label: 'Chuva gelada leve' },
  67: { icone: '🌧️', label: 'Chuva gelada forte' },
  71: { icone: '🌨️', label: 'Neve leve' },
  73: { icone: '🌨️', label: 'Neve moderada' },
  75: { icone: '❄️', label: 'Neve forte' },
  80: { icone: '🌦️', label: 'Aguaceiros leves' },
  81: { icone: '🌧️', label: 'Aguaceiros moderados' },
  82: { icone: '🌧️', label: 'Aguaceiros violentos' },
  95: { icone: '⛈️', label: 'Trovoada' },
  96: { icone: '⛈️', label: 'Trovoada com granizo leve' },
  99: { icone: '⛈️', label: 'Trovoada com granizo forte' },
};

function getWeatherInfo(code) {
  return wmoIcons[code] || { icone: '❓', label: 'Desconhecido' };
}

export default function Predictions() {
  const [provincia, setProvincia] = useState('Bié');
  const [previsao, setPrevisao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarPrevisao = async () => {
    if (!provincia) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPrevisaoClimatica({ provincia });
      if (res.success) setPrevisao(res.data);
      else setError(res.message || 'Erro ao obter previsão');
    } catch (err) {
      console.error('Erro previsão:', err);
      setError('Não foi possível carregar a previsão. Verifica a tua ligação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          🔮 Previsão Climática
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Previsão do tempo para 7 dias com dados reais da Open-Meteo
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1, maxWidth: '300px' }}>
          <label className="input-label">Seleccionar Província</label>
          <select className="input" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
            <option value="">Seleccionar</option>
            {provinciasAngola.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={buscarPrevisao} disabled={loading || !provincia}>
          {loading ? <><Loader size={16} className="spinner" /> A carregar...</> : 'Ver Previsão'}
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius)', marginBottom: '16px', color: '#ef4444', fontSize: '0.9rem'
        }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {previsao && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className="alert-card alert-accent" style={{ flex: 1, minWidth: '200px' }}>
              <strong>🌤️ Agora</strong><br />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {previsao.atual?.temperatura ?? '--'}°C
              </span>
              <span style={{ fontSize: '0.85rem', marginLeft: '8px' }}>
                {getWeatherInfo(previsao.atual?.weathercode).label}
              </span>
              <br />
              <span style={{ fontSize: '0.8rem' }}>💨 {previsao.atual?.vento ?? '--'} km/h</span>
            </div>
            <div className="alert-card alert-accent" style={{ flex: 1, minWidth: '200px' }}>
              <strong>🌾 Estação</strong><br />
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                {previsao.recomendacao?.estacao === 'cacimbo' ? 'Cacimbo (seca)' : 'Chuvosa'}
              </span>
              <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {previsao.recomendacao?.estacao === 'cacimbo'
                  ? 'Período seco. Sem chuva prevista.'
                  : 'Período de chuvas. Possibilidade de precipitação.'}
              </span>
            </div>
          </div>

          <PrognosCard title={`Previsão para ${previsao.provincia}`} subtitle="Próximos 7 dias" icon={<Calendar size={18} />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
              {previsao.dias.map((dia, i) => {
                const weather = getWeatherInfo(dia.weathercode);
                return (
                  <div key={i} style={{
                    textAlign: 'center', padding: '16px 8px',
                    borderRadius: 'var(--radius)',
                    background: i === 0 ? 'rgba(0,51,102,0.05)' : 'transparent',
                    border: i === 0 ? '1px solid rgba(0,51,102,0.1)' : 'none'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {dia.dia}
                    </div>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{weather.icone}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {dia.tempMax}°
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {dia.tempMin}°
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span>💧 {dia.humidade}%</span>
                      <span>💨 {dia.vento} km/h</span>
                      {dia.precipitacao > 0 && <span>🌧️ {dia.precipitacao}mm</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </PrognosCard>

          <div className="grid-2" style={{ marginTop: '16px' }}>
            <PrognosCard title="Recomendação de Plantio" subtitle="Baseada nas condições climáticas" icon={<Sun size={18} />}>
              <div style={{ padding: '12px 0' }}>
                <div className={`badge ${previsao.recomendacao?.favoravel ? 'badge-success' : 'badge-warning'}`}
                  style={{ marginBottom: '12px' }}>
                  {previsao.recomendacao?.favoravel ? '✅ Condições favoráveis' : '⚠️ Condições moderadas'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                  {previsao.recomendacao?.mensagem}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Culturas recomendadas: {previsao.recomendacao?.culturas?.join(', ')}
                </p>
              </div>
            </PrognosCard>

            <PrognosCard title="Risco de Pragas" subtitle="Probabilidade estimada" icon={<AlertTriangle size={18} />}>
              <div style={{ padding: '12px 0' }}>
                <div className={`badge ${previsao.recomendacao?.riscoPragas === 'alto' ? 'badge-danger' : previsao.recomendacao?.riscoPragas === 'medio' ? 'badge-warning' : 'badge-success'}`}
                  style={{ marginBottom: '12px' }}>
                  {previsao.recomendacao?.riscoPragas === 'alto' ? '🐛 Risco Alto' : previsao.recomendacao?.riscoPragas === 'medio' ? '🐛 Risco Médio' : '✅ Risco Baixo'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {previsao.recomendacao?.riscoPragas === 'alto'
                    ? 'Condições de humidade elevada e temperaturas amenas criam ambiente propício para fungos e lagartas. Reforçar monitorização.'
                    : previsao.recomendacao?.riscoPragas === 'medio'
                    ? 'Humidade moderada pode favorecer o aparecimento de pragas. Recomenda-se monitorização regular.'
                    : 'Condições actualmente desfavoráveis ao desenvolvimento de pragas. Manter vigilância padrão.'}
                </p>
              </div>
            </PrognosCard>
          </div>
        </>
      )}

      {!previsao && !loading && !error && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--border)'
        }}>
          <Cloud size={64} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Selecione uma província
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Escolha a província acima e clique em "Ver Previsão" para ver os dados climáticos reais
          </p>
        </div>
      )}
    </div>
  );
}
