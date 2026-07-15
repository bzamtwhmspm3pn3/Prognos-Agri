import React, { useState, useEffect } from 'react';
import RelatoriosColheita from '../../components/AgroOkuvanja/RelatoriosColheita';
import { useIntegracao } from '../contexts/IntegracaoContext';
import { Loader, AlertCircle } from 'lucide-react';
import { deteccaoApi } from '../../services/deteccaoApi';

export default function RelatoriosColheitaPage() {
  const [deteccoes, setDeteccoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const { refreshDashboard } = useIntegracao();

  useEffect(() => {
    carregarDeteccoes();
  }, [refreshDashboard]);

  const carregarDeteccoes = async () => {
    try {
      setLoading(true);
      const data = await deteccaoApi.listar();
      setDeteccoes(data.data || data.deteccoes || []);
    } catch (err) {
      console.error('Erro ao carregar deteções:', err);
      const saved = JSON.parse(localStorage.getItem('prognos_deteccoes') || '[]');
      if (saved.length > 0) {
        setDeteccoes(saved);
      } else {
        setErro('Nenhuma deteção encontrada. Faça uma deteção primeiro.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Loader className="spinner" size={32} color="var(--secondary)" />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>A carregar deteções...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            📋 Relatórios
          </h1>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          padding: '60px 20px', textAlign: 'center'
        }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-secondary)' }}>{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          📋 Relatórios de Deteções
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Gere relatórios detalhados das pragas detetadas com gráficos e exportação PDF
        </p>
      </div>

      <RelatoriosColheita
        deteccoes={deteccoes}
        onAtualizarDashboard={() => console.log('Dashboard atualizado')}
      />
    </div>
  );
}
