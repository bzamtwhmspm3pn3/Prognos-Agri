import React, { useState } from 'react';
import { Cloud, Sun, Droplets, Wind, AlertTriangle, Thermometer, Calendar } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';

const provinciasAngola = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

export default function Predictions() {
  const [provincia, setProvincia] = useState('');
  const [previsao, setPrevisao] = useState(null);
  const [loading, setLoading] = useState(false);

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const simularPrevisao = () => {
    setLoading(true);
    setTimeout(() => {
      const dias = [...Array(7)].map((_, i) => {
        const tempBase = 22 + Math.random() * 12;
        return {
          dia: diasSemana[new Date(Date.now() + i * 86400000).getDay()],
          data: new Date(Date.now() + i * 86400000).toLocaleDateString('pt-PT'),
          tempMin: Math.round(tempBase - 4),
          tempMax: Math.round(tempBase + 4),
          condicao: ['Céu limpo', 'Parcialmente nublado', 'Nublado', 'Chuva fraca', 'Chuva moderada'][Math.floor(Math.random() * 5)],
          icone: ['☀️', '⛅', '☁️', '🌦️', '🌧️'][Math.floor(Math.random() * 5)],
          humidade: Math.round(50 + Math.random() * 40),
          vento: Math.round(5 + Math.random() * 20),
          precipitacao: Math.round(Math.random() * 30)
        };
      });
      setPrevisao({ provincia, dias, alertas: gerarAlertasSimulados() });
      setLoading(false);
    }, 800);
  };

  const gerarAlertasSimulados = () => {
    return [
      { tipo: 'calor_extremo', nivel: 'moderado', mensagem: 'Temperaturas elevadas previstas para os próximos dias' },
      { tipo: 'chuva_intensa', nivel: 'leve', mensagem: 'Possibilidade de chuva moderada no fim de semana' }
    ];
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          🔮 Previsão Climática
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Previsão do tempo para 7 dias com alertas de condições extremas
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1, maxWidth: '300px' }}>
          <label className="input-label">Seleccionar Província</label>
          <select className="input" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
            <option value="">Todas as províncias</option>
            {provinciasAngola.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={simularPrevisao} disabled={loading}>
          {loading ? 'A carregar...' : 'Ver Previsão'}
        </button>
      </div>

      {previsao && (
        <>
          <div className="grid-3" style={{ marginBottom: '16px' }}>
            {previsao.alertas.map((alerta, i) => (
              <div key={i} className={`alert-card alert-${alerta.nivel}`} style={{ borderLeftColor: 'var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="var(--accent-dark)" />
                  <strong style={{ fontSize: '0.85rem' }}>{alerta.tipo.replace('_', ' ')}</strong>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {alerta.mensagem}
                </p>
              </div>
            ))}
          </div>

          <PrognosCard title={`Previsão para ${previsao.provincia || 'Angola'}`} subtitle="Próximos 7 dias" icon={<Calendar size={18} />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
              {previsao.dias.map((dia, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: '16px 8px',
                  borderRadius: 'var(--radius)',
                  background: i === 0 ? 'rgba(0,51,102,0.05)' : 'transparent',
                  border: i === 0 ? '1px solid rgba(0,51,102,0.1)' : 'none'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {dia.dia}
                  </div>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{dia.icone}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {dia.tempMax}°
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {dia.tempMin}°
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span>💧 {dia.humidade}%</span>
                    <span>💨 {dia.vento} km/h</span>
                    {dia.precipitacao > 0 && <span>🌧️ {dia.precipitacao}mm</span>}
                  </div>
                </div>
              ))}
            </div>
          </PrognosCard>

          <div className="grid-2" style={{ marginTop: '16px' }}>
            <PrognosCard title="Recomendação de Plantio" subtitle="Baseada nas condições climáticas" icon={<Sun size={18} />}>
              <div style={{ padding: '12px 0' }}>
                <div className={`badge ${previsao.dias[0].tempMax > 20 && previsao.dias[0].tempMax < 35 ? 'badge-success' : 'badge-warning'}`}
                  style={{ marginBottom: '12px' }}>
                  {previsao.dias[0].tempMax > 20 && previsao.dias[0].tempMax < 35 ? '✅ Condições favoráveis' : '⚠️ Condições moderadas'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  As condições climáticas estão adequadas para o plantio de milho, feijão e mandioca.
                  Mantenha irrigação complementar se necessário.
                </p>
              </div>
            </PrognosCard>

            <PrognosCard title="Risco de Pragas" subtitle="Probabilidade estimada" icon={<AlertTriangle size={18} />}>
              <div style={{ padding: '12px 0' }}>
                <div className="badge badge-warning" style={{ marginBottom: '12px' }}>
                  🐛 Risco Médio
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Condições de humidade elevada podem favorecer o aparecimento de fungos e lagartas.
                  Recomenda-se monitorização regular das culturas.
                </p>
              </div>
            </PrognosCard>
          </div>
        </>
      )}

      {!previsao && !loading && (
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
            Escolha a província acima e clique em "Ver Previsão" para ver os dados climáticos
          </p>
        </div>
      )}
    </div>
  );
}
