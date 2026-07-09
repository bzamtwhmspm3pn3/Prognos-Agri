import React from 'react';
import MonitoramentoCampo from '../../components/AgroOkuvanja/MonitoramentoCampo';

export default function MonitoramentoCampoPage() {
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
        onNovaDeteccao={(data) => console.log('Nova deteção de campo:', data)}
        onAtualizarDashboard={() => console.log('Dashboard atualizado')}
      />
    </div>
  );
}
