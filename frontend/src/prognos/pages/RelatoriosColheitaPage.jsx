import React, { useState, useEffect } from 'react';
import RelatoriosColheita from '../../components/AgroOkuvanja/RelatoriosColheita';
import { useIntegracao } from '../contexts/IntegracaoContext';
import { Loader, AlertCircle, Sprout, BarChart3, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { deteccaoApi } from '../../services/deteccaoApi';
import * as plantioService from '../../services/plantioService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [exportandoPDF, setExportandoPDF] = useState(false);

  const exportarRelatorioPlantios = async () => {
    if (!plantios.length) return;
    setExportandoPDF(true);
    try {
      await new Promise(r => setTimeout(r, 300));

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const m = 20;
      let y = 25;

      const GREEN = [74, 124, 89];
      const DARK = [25, 35, 45];
      const GRAY = [100, 116, 139];

      const fN = (v) => { if (v == null) return '0,00'; const n = Number(v); return isNaN(n) ? '0,00' : n.toLocaleString('pt-AO', { minimumFractionDigits: 2 }); };
      const checkPage = (sp = 20) => { if (y + sp > ph - 15) { doc.addPage(); y = 25; } };

      const sec = (title, num) => {
        checkPage(18); y += 4;
        doc.setFillColor(...GREEN); doc.rect(m - 3, y - 4, 3, 11, 'F');
        doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN);
        doc.text(`${num}. ${title}`, m, y + 2); y += 8;
        doc.setDrawColor(...GREEN); doc.setLineWidth(0.3); doc.line(m, y, pw - m, y); y += 6;
        doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
      };

      const tbl = (head, body, opts = {}) => {
        checkPage(30);
        autoTable(doc, {
          startY: y, head: [head], body, theme: 'striped',
          headStyles: { fillColor: opts.headColor || GREEN, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'left' },
          bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: 3 },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          columnStyles: opts.columns || {},
          margin: { left: m, right: m },
          ...opts.tableOptions
        });
        y = doc.lastAutoTable.finalY + 8;
      };

      const totalArea = plantios.reduce((a, p) => a + (p.area || 0), 0);
      const totalInvestimento = plantios.reduce((a, p) => a + (p.plano?.investimento?.total || p.orcamento || 0), 0);
      const totalRenda = plantios.reduce((a, p) => a + (p.plano?.producao?.rendaBrutaEstimada || 0), 0);
      const totalLucro = plantios.reduce((a, p) => a + (p.plano?.producao?.lucroEstimado || 0), 0);
      const concluidos = plantios.filter(p => p.status === 'concluido').length;
      const emCurso = plantios.filter(p => p.status !== 'concluido' && p.status !== 'cancelado' && p.status !== 'arquivado').length;

      // =============================================
      // CAPA
      // =============================================
      doc.setFillColor(245, 248, 245); doc.rect(0, 0, pw, ph, 'F');
      doc.setFillColor(...GREEN); doc.rect(0, 0, pw, 6, 'F');

      doc.setFillColor(...GREEN); doc.circle(pw / 2, 55, 20, 'F');
      doc.setFillColor(255, 255, 255); doc.circle(pw / 2, 55, 14, 'F');
      doc.setFillColor(...GREEN); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('PA', pw / 2, 59, { align: 'center' });

      doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
      doc.text('RELATORIO GERAL DE PLANTIOS', pw / 2, 100, { align: 'center' });

      doc.setDrawColor(...GREEN); doc.setLineWidth(0.8); doc.line(50, 110, pw - 50, 110);

      doc.setFontSize(14); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GREEN);
      doc.text('Prognos Agri 2.0', pw / 2, 125, { align: 'center' });

      doc.setFontSize(11); doc.setTextColor(...GRAY);
      doc.text(new Date().toLocaleString('pt-PT'), pw / 2, 140, { align: 'center' });

      // =============================================
      // PAGINA 2+
      // =============================================
      doc.addPage(); y = 25;

      // 1. INDICADORES GERAIS
      sec('INDICADORES GERAIS', '1');
      tbl(['Indicador', 'Valor'], [
        ['Total de Plantios', `${plantios.length}`],
        ['Plantios Concluidos', `${concluidos}`],
        ['Plantios em Curso', `${emCurso}`],
        ['Area Total Cultivada', `${totalArea} ha`],
        ['Investimento Total', `${fN(totalInvestimento)} Kz`],
        ['Renda Bruta Estimada', `${fN(totalRenda)} Kz`],
        ['Lucro Estimado', `${fN(totalLucro)} Kz`],
      ]);

      // 2. DISTRIBUICAO POR CULTURA
      sec('DISTRIBUICAO POR CULTURA', '2');
      const culturas = {};
      plantios.forEach(p => { culturas[p.cultura] = (culturas[p.cultura] || 0) + 1; });
      const culturasBody = Object.entries(culturas).map(([nome, qtd]) => [nome.charAt(0).toUpperCase() + nome.slice(1), `${qtd}`, `${Math.round(qtd / plantios.length * 100)}%`]);
      tbl(['Cultura', 'Quantidade', '% do Total'], culturasBody);

      // 3. LISTAGEM COMPLETA
      sec('LISTAGEM DETALHADA', '3');
      const listBody = plantios.map(p => [
        p.nome || '-',
        (p.cultura || '-').charAt(0).toUpperCase() + (p.cultura || '-').slice(1),
        p.provincia || '-',
        p.area ? `${p.area} ha` : '-',
        p.orcamento ? `${fN(p.orcamento)} Kz` : '-',
        p.status === 'concluido' ? 'Concluido' : p.status === 'cancelado' ? 'Cancelado' : p.status === 'arquivado' ? 'Arquivado' : 'Em curso'
      ]);
      tbl(['Nome', 'Cultura', 'Provincia', 'Area', 'Orcamento', 'Status'], listBody, {
        columns: { 0: { cellWidth: 30 }, 4: { halign: 'right' } }
      });

      // 4. PLANTIOS COM PLANO IA
      const comPlano = plantios.filter(p => p.plano);
      if (comPlano.length) {
        sec('PLANOS IA - RESUMO FINANCEIRO', '4');
        const planoBody = comPlano.map(p => [
          p.nome || '-',
          p.cultura || '-',
          `${fN(p.plano?.investimento?.total || 0)} Kz`,
          `${fN(p.plano?.producao?.rendaBrutaEstimada || 0)} Kz`,
          `${fN(p.plano?.producao?.lucroEstimado || 0)} Kz`,
        ]);
        tbl(['Plantio', 'Cultura', 'Investimento', 'Renda Bruta', 'Lucro'], planoBody, {
          columns: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
        });
      }

      // RODAPE
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 210); doc.setLineWidth(0.3);
        doc.line(m, ph - 12, pw - m, ph - 12);
        doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
        doc.text(`Prognos Agri 2.0`, m, ph - 6);
        doc.text(`Pagina ${i} de ${pages}`, pw - m, ph - 6, { align: 'right' });
      }

      doc.save(`Relatorio_Plantios_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) { console.error('Erro ao gerar PDF:', e); } finally { setExportandoPDF(false); }
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
          <button className="btn btn-primary" onClick={exportarRelatorioPlantios} disabled={exportandoPDF}>
            {exportandoPDF ? <Loader size={16} className="spinner" /> : <Download size={16} />} {exportandoPDF ? 'A gerar...' : 'Exportar PDF'}
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
