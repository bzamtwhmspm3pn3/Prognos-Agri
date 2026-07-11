import React from 'react';
import MonitoramentoCampo from '../../components/AgroOkuvanja/MonitoramentoCampo';
import { useIntegracao } from '../contexts/IntegracaoContext';

export default function MonitoramentoCampoPage() {
  const { emitirDeteccao } = useIntegracao();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          🗺️ Monitoramento de Campo
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Acompanhe as condições do campo em tempo real com geolocalização e dados meteorológicos
        </p>
      </div>

      <MonitoramentoCampo
        onNovaDeteccao={(detData) => emitirDeteccao({
          ...detData,
          timestamp: new Date().toISOString()
        })}
        onAtualizarDashboard={() => {
          // O refreshDashboard no contexto é incrementado automaticamente
          // pelo emitirDeteccao quando onNovaDeteccao é chamado
        }}
      />
    </div>
  );
}
