import React, { useState, useEffect } from 'react';
import RelatoriosColheita from '../../components/AgroOkuvanja/RelatoriosColheita';
import { useIntegracao } from '../contexts/IntegracaoContext';
import { Loader, AlertCircle, Sprout, BarChart3, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { deteccaoApi } from '../../services/deteccaoApi';
import * as plantioService from '../../services/plantioService';
import { jsPDF } from 'jspdf';

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

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    const addLine = () => { doc.setDrawColor(74, 124, 89); doc.setLineWidth(0.5); doc.line(14, y, pageW - 14, y); y += 4; };
    const checkPage = (needed) => { if (y + needed > 270) { doc.addPage(); y = 20; } };

    // Header
    doc.setFontSize(18); doc.setTextColor(0, 51, 102); doc.text('Relatório Geral de Plantios', 14, y); y += 8;
    doc.setFontSize(9); doc.setTextColor(100); doc.text(`Gerado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, 14, y); y += 8;
    addLine();

    // Stats
    const totalArea = plantios.reduce((a, p) => a + (p.area || 0), 0);
    const totalInvestimento = plantios.reduce((a, p) => a + (p.plano?.investimento?.total || p.orcamento || 0), 0);
    const totalRenda = plantios.reduce((a, p) => a + (p.plano?.producao?.rendaBrutaEstimada || 0), 0);
    const totalLucro = plantios.reduce((a, p) => a + (p.plano?.producao?.lucroEstimado || 0), 0);

    doc.setFontSize(10); doc.setTextColor(0);
    doc.setFont(undefined, 'bold'); doc.text(`Total de Plantios: ${plantios.length}`, 14, y); doc.setFont(undefined, 'normal'); y += 6;
    doc.text(`Área Total: ${totalArea} ha`, pageW / 2, y); y += 6;
    doc.text(`Investimento Total: ${Number(totalInvestimento).toLocaleString()} Kz`, 14, y); y += 6;
    doc.text(`Renda Bruta: ${Number(totalRenda).toLocaleString()} Kz`, pageW / 2, y); y += 6;
    doc.text(`Lucro Estimado: ${Number(totalLucro).toLocaleString()} Kz`, 14, y); y += 8;
    addLine();

    // Table
    checkPage(30);
    doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.setTextColor(0, 51, 102);
    doc.text('Resumo dos Plantios', 14, y); y += 7;

    // Header row
    doc.setFontSize(8); doc.setFont(undefined, 'bold'); doc.setTextColor(255);
    doc.setFillColor(74, 124, 89); doc.rect(14, y, pageW - 28, 7, 'F');
    doc.text('Nome', 16, y + 5); doc.text('Cultura', 60, y + 5); doc.text('Província', 90, y + 5);
    doc.text('Área', 120, y + 5); doc.text('Orçamento', 140, y + 5); doc.text('Status', 170, y + 5);
    y += 7;

    doc.setFont(undefined, 'normal'); doc.setTextColor(0);
    plantios.forEach((p, i) => {
      checkPage(7);
      if (i % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(14, y - 4, pageW - 28, 6, 'F'); }
      doc.text(p.nome || '-', 16, y);
      doc.text(p.cultura || '-', 60, y);
      doc.text(p.provincia || '-', 90, y);
      doc.text(p.area ? p.area + ' ha' : '-', 120, y);
      doc.text(p.orcamento ? Number(p.orcamento).toLocaleString() : '-', 140, y);
      const st = p.status === 'concluido' ? 'Concluído' : p.status === 'cancelado' ? 'Cancelado' : p.status === 'arquivado' ? 'Arquivado' : 'Em curso';
      doc.text(st, 170, y);
      y += 6;
    });
    y += 6;
    addLine();

    // Footer
    y = 270;
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text('Prognos Agri 2.0 — Relatório gerado automaticamente', pageW / 2, y, { align: 'center' });

    doc.save(`Relatorio_Plantios_${new Date().toISOString().slice(0, 10)}.pdf`);
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
