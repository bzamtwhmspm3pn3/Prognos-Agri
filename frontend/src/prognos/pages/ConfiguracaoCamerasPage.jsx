import React from 'react';
import ConfiguracaoCameras from '../../components/AgroOkuvanja/ConfiguracaoCameras';
import { useIntegracao } from '../contexts/IntegracaoContext';
import { Camera, Info } from 'lucide-react';

export default function ConfiguracaoCamerasPage() {
  const { emitirDeteccao, atualizarMapaRisco, recarregarCameras } = useIntegracao();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          📷 Configuração de Câmaras
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Adicione e configure câmaras IP para monitoramento automático de pragas
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 'var(--radius)', marginBottom: '24px',
        fontSize: '0.9rem', color: 'var(--text-secondary)'
      }}>
        <Info size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
        <span>
          As câmaras capturam frames periodicamente e enviam para deteção automática de pragas via IA.
          As deteções são partilhadas automaticamente com o Dashboard, Monitoramento e Histórico.
        </span>
      </div>

      <ConfiguracaoCameras
        onAtualizarDashboard={() => recarregarCameras()}
        onDeteccaoRoedor={(d) => emitirDeteccao({
          ...d,
          tipo: 'roedor',
          timestamp: new Date().toISOString(),
          localizacao: d.localizacao || 'Área da câmara'
        })}
        onDeteccaoAve={(d) => emitirDeteccao({
          ...d,
          tipo: 'ave',
          timestamp: new Date().toISOString(),
          localizacao: d.localizacao || 'Área da câmara'
        })}
        onDeteccaoGeral={(d) => emitirDeteccao({
          ...d,
          timestamp: d.timestamp || new Date().toISOString(),
          localizacao: d.localizacao || 'Área da câmara'
        })}
        onAtualizarMapaRisco={(d) => atualizarMapaRisco(d)}
        onCamerasChange={() => recarregarCameras()}
      />
    </div>
  );
}
