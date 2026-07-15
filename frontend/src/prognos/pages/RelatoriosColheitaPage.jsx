import React, { useState, useEffect } from 'react';
import RelatoriosColheita from '../../components/AgroOkuvanja/RelatoriosColheita';
import { useIntegracao } from '../contexts/IntegracaoContext';
import { Loader, AlertCircle, Sprout, BarChart3, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { deteccaoApi } from '../../services/deteccaoApi';
import * as plantioService from '../../services/plantioService';

function PieChartCSS({ data, size = 120 }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + d.valor, 0);
  if (!total) return null;
  let conic = data.map((d, i) => {
    const pct = (d.valor / total) * 360;
    const prev = data.slice(0, i).reduce((s, d) => s + (d.valor / total) * 360, 0);
    return `${d.cor} ${prev}deg ${prev + pct}deg`;
  }).join(', ');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${conic})`, flexShrink: 0 }} />
      <div>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginBottom: '3px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.cor }} />
            <span>{d.label}: {Math.round((d.valor / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RelatoriosColheitaPage() {
  const [deteccoes, setDeteccoes] = useState([]);
  const [plantios, setPlantios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [tab, setTab] = useState('plantio');
  const { refreshDashboard } = useIntegracao();

  useEffect(() => {
    carregarDados();
  }, [refreshDashboard]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [detRes, plantRes] = await Promise.allSettled([
        deteccaoApi.listar(),
        plantioService.listarPlantios()
      ]);

      if (detRes.status === 'fulfilled') {
        setDeteccoes(detRes.value.data || detRes.value.deteccoes || []);
      } else {
        const saved = JSON.parse(localStorage.getItem('prognos_deteccoes') || '[]');
        setDeteccoes(saved);
      }

      if (plantRes.status === 'fulfilled') {
        setPlantios(plantRes.value.plantios || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErro('Erro ao carregar dados dos relatórios.');
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorioPlantios = () => {
    if (!plantios.length) return;

    const totalArea = plantios.reduce((a, p) => a + (p.area || 0), 0);
    const totalOrcamento = plantios.reduce((a, p) => a + (p.orcamento || 0), 0);
    const totalInvestimento = plantios.reduce((a, p) => a + (p.plano?.investimento?.total || 0), 0);
    const totalRenda = plantios.reduce((a, p) => a + (p.plano?.producao?.rendaBrutaEstimada || 0), 0);
    const totalLucro = plantios.reduce((a, p) => a + (p.plano?.producao?.lucroEstimado || 0), 0);
    const porStatus = { planeado: 0, ativo: 0, concluido: 0, cancelado: 0, arquivado: 0 };
    plantios.forEach(p => { porStatus[p.status] = (porStatus[p.status] || 0) + 1; });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8">
<title>Relatório Geral - Prognos Agri</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
  h1 { color: #003366; border-bottom: 3px solid #4A7C59; padding-bottom: 10px; }
  h2 { color: #4A7C59; margin-top: 24px; border-left: 4px solid #4A7C59; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.85rem; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; }
  .stat-card { padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center; }
  .stat-card .value { font-size: 1.3rem; font-weight: 700; color: #003366; }
  .stat-card .label { font-size: 0.8rem; color: #666; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>📊 Relatório Geral de Plantios</h1>
<p style="color: #666">Gerado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}</p>

<div class="stat-grid">
  <div class="stat-card"><div class="value">${plantios.length}</div><div class="label">Total de Plantios</div></div>
  <div class="stat-card"><div class="value">${totalArea} ha</div><div class="label">Área Total</div></div>
  <div class="stat-card"><div class="value">${Number(totalOrcamento || totalInvestimento).toLocaleString()} Kz</div><div class="label">Investimento Total</div></div>
  <div class="stat-card"><div class="value">${Number(totalRenda).toLocaleString()} Kz</div><div class="label">Renda Bruta Estimada</div></div>
  <div class="stat-card"><div class="value">${Number(totalLucro).toLocaleString()} Kz</div><div class="label">Lucro Estimado</div></div>
  <div class="stat-card"><div class="value">${porStatus.ativo || 0}</div><div class="label">Em Curso</div></div>
</div>

<h2>📋 Resumo dos Plantios</h2>
<table>
  <thead>
    <tr><th>Nome</th><th>Cultura</th><th>Província</th><th>Área</th><th>Orçamento</th><th>Status</th></tr>
  </thead>
  <tbody>
    ${plantios.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.cultura}</td>
        <td>${p.provincia || '-'}</td>
        <td>${p.area ? p.area + ' ha' : '-'}</td>
        <td>${p.orcamento ? Number(p.orcamento).toLocaleString() + ' Kz' : '-'}</td>
        <td>${p.status === 'concluido' ? '✅ Concluído' : p.status === 'cancelado' ? '❌ Cancelado' : p.status === 'arquivado' ? '📦 Arquivado' : '🔄 Em curso'}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

${deteccoes.length ? `
<h2>🐛 Deteções de Pragas</h2>
<table>
  <thead><tr><th>Data</th><th>Pragas Detetadas</th><th>Nível de Risco</th></tr></thead>
  <tbody>
    ${deteccoes.slice(0, 20).map(d => `
      <tr>
        <td>${d.timestamp ? new Date(d.timestamp).toLocaleDateString('pt-PT') : '-'}</td>
        <td>${d.total_count || d.detections?.length || 0}</td>
        <td>${d.impact?.nivel_risco || d.analysis?.level || '-'}</td>
      </tr>
    `).join('')}
  </tbody>
</table>
` : ''}

<div style="margin-top: 30px; padding-top: 10px; border-top: 2px solid #4A7C59; font-size: 0.8rem; color: #999; text-align: center">
  Prognos Agri 2.0 — Relatório gerado automaticamente
</div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Loader className="spinner" size={32} color="var(--secondary)" />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>A carregar dados...</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-secondary)' }}>{erro}</p>
        </div>
      </div>
    );
  }

  const totalArea = plantios.reduce((a, p) => a + (p.area || 0), 0);
  const totalInvestimento = plantios.reduce((a, p) => a + (p.plano?.investimento?.total || p.orcamento || 0), 0);
  const totalRenda = plantios.reduce((a, p) => a + (p.plano?.producao?.rendaBrutaEstimada || 0), 0);
  const totalLucro = plantios.reduce((a, p) => a + (p.plano?.producao?.lucroEstimado || 0), 0);
  const culturas = {};
  plantios.forEach(p => { culturas[p.cultura] = (culturas[p.cultura] || 0) + 1; });
  const culturasData = Object.entries(culturas).map(([nome, qtd], i) => ({
    label: nome, valor: qtd, cor: ['#4A7C59', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6]
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            📋 Relatórios
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Visão geral dos plantios e deteções de pragas
          </p>
        </div>
        {tab === 'plantio' && plantios.length > 0 && (
          <button className="btn btn-primary" onClick={exportarRelatorioPlantios}>
            <Download size={16} /> Exportar PDF
          </button>
        )}
      </div>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab ${tab === 'plantio' ? 'active' : ''}`} onClick={() => setTab('plantio')}>
          <Sprout size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Plantios ({plantios.length})
        </button>
        <button className={`tab ${tab === 'deteccoes' ? 'active' : ''}`} onClick={() => setTab('deteccoes')}>
          <BarChart3 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Deteções ({deteccoes.length})
        </button>
      </div>

      {tab === 'plantio' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <Sprout size={24} color="var(--secondary)" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{plantios.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Plantios</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <Calendar size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{totalArea} ha</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Área Total</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <DollarSign size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>{Number(totalInvestimento).toLocaleString()} Kz</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Investimento</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <TrendingUp size={24} color="#4A7C59" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4A7C59' }}>{Number(totalRenda).toLocaleString()} Kz</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Renda Bruta</div>
            </div>
          </div>

          {culturasData.length > 0 && (
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem' }}>Distribuição por Cultura</h3>
              <PieChartCSS data={culturasData} size={100} />
            </div>
          )}

          {plantios.length > 0 && (
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem' }}>Todos os Plantios</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px' }}>Nome</th>
                      <th style={{ textAlign: 'left', padding: '8px 6px' }}>Cultura</th>
                      <th style={{ textAlign: 'left', padding: '8px 6px' }}>Local</th>
                      <th style={{ textAlign: 'right', padding: '8px 6px' }}>Área</th>
                      <th style={{ textAlign: 'right', padding: '8px 6px' }}>Investimento</th>
                      <th style={{ textAlign: 'right', padding: '8px 6px' }}>Lucro</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plantios.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{p.nome}</td>
                        <td style={{ padding: '8px 6px' }}>{p.cultura}</td>
                        <td style={{ padding: '8px 6px' }}>{p.provincia || '-'}{p.municipio ? `, ${p.municipio}` : ''}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right' }}>{p.area ? `${p.area} ha` : '-'}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right' }}>{p.plano?.investimento?.total ? Number(p.plano.investimento.total).toLocaleString() + ' Kz' : p.orcamento ? Number(p.orcamento).toLocaleString() + ' Kz' : '-'}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#4A7C59', fontWeight: 600 }}>{p.plano?.producao?.lucroEstimado ? Number(p.plano.producao.lucroEstimado).toLocaleString() + ' Kz' : '-'}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600,
                            background: p.status === 'concluido' ? 'rgba(74,124,89,0.15)' : p.status === 'cancelado' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                            color: p.status === 'concluido' ? '#4A7C59' : p.status === 'cancelado' ? '#ef4444' : '#3b82f6'
                          }}>
                            {p.status === 'concluido' ? 'Concluído' : p.status === 'cancelado' ? 'Cancelado' : 'Em curso'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'deteccoes' && (
        <RelatoriosColheita
          deteccoes={deteccoes}
          onAtualizarDashboard={() => carregarDados()}
        />
      )}
    </div>
  );
}
