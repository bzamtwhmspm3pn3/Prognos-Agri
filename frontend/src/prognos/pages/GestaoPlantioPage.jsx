import React, { useState, useEffect, useCallback } from 'react';
import {
  Sprout, Plus, ChevronRight, CheckCircle2, Circle, Clock,
  Sparkles, Loader, AlertCircle, X, ArrowLeft, Send, BookOpen,
  Target, Truck, Droplets, Factory, Package, ShoppingBag, HelpCircle,
  Download, BarChart3, PieChart, TrendingUp, AlertTriangle, Users,
  Calendar, MapPin, DollarSign, Trash2, Edit3, Archive, Ban, FileText, Camera, Eye
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import PrognosCard from '../components/PrognosCard';
import * as plantioService from '../../services/plantioService';

const ICONES_FASE = {
  planeamento: Target, aquisicao_insumos: ShoppingBag, logistica_insumos: Truck,
  preparo_solo: Sprout, plantio: Sprout, manejo_cultura: Droplets,
  colheita: Sprout, pos_colheita: Package, industrializacao: Package,
  distribuicao: Truck, comercializacao: ShoppingBag
};

function getStatusIcon(status) {
  switch (status) {
    case 'concluido': return <CheckCircle2 size={18} color="#4A7C59" />;
    case 'em_andamento': return <Clock size={18} color="#3b82f6" />;
    case 'pulado': return <X size={18} color="#64748b" />;
    default: return <Circle size={18} color="#cbd5e1" />;
  }
}

function PieChartCSS({ data, size = 160 }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + d.valor, 0);
  if (!total) return null;
  let conic = data.map((d, i) => {
    const pct = (d.valor / total) * 360;
    const prev = data.slice(0, i).reduce((s, d) => s + (d.valor / total) * 360, 0);
    return `${d.cor} ${prev}deg ${prev + pct}deg`;
  }).join(', ');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `conic-gradient(${conic})`, flexShrink: 0
      }} />
      <div>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginBottom: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.cor }} />
            <span>{d.label}: {d.percentual || Math.round((d.valor / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, height = 180, color = 'var(--secondary)' }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.valor));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height, paddingTop: '8px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', maxWidth: '60px', borderRadius: '4px 4px 0 0',
            height: `${(d.valor / max) * 100}%`,
            background: d.cor || color, minHeight: '4px',
            transition: 'height 0.5s'
          }} />
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center', wordBreak: 'break-word' }}>
            {d.label?.substring(0, 10)}
          </div>
        </div>
      ))}
    </div>
  );
}

function GanttChart({ tasks }) {
  if (!tasks?.length) return null;
  const start = new Date(tasks[0].inicio);
  const end = new Date(tasks[tasks.length - 1].fim);
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#4A7C59', '#06b6d4'];

  return (
    <div style={{ position: 'relative', padding: '4px 0' }}>
      {tasks.map((t, i) => {
        const tStart = new Date(t.inicio);
        const tEnd = new Date(t.fim);
        const offset = Math.max(0, Math.ceil((tStart - start) / (1000 * 60 * 60 * 24)));
        const dur = Math.max(1, Math.ceil((tEnd - tStart) / (1000 * 60 * 60 * 24)));
        const left = (offset / totalDays) * 100;
        const width = (dur / totalDays) * 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.8rem' }}>
            <div style={{ width: '110px', flexShrink: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{t.atividade}</div>
            <div style={{ flex: 1, height: '22px', background: 'var(--bg-body)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', left: `${left}%`, width: `${Math.max(width, 3)}%`,
                height: '100%', borderRadius: '4px',
                background: colors[i % colors.length],
                opacity: 0.8, minWidth: '8px'
              }} />
            </div>
            <div style={{ width: '40px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }}>{t.dias}d</div>
          </div>
        );
      })}
    </div>
  );
}

export default function GestaoPlantioPage() {
  const [plantios, setPlantios] = useState([]);
  const [plantioAtivo, setPlantioAtivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iaStep, setIaStep] = useState(null);
  const [iaData, setIaData] = useState({ cultura: '', provincia: '', municipio: '', area: '', orcamento: '', dataInicio: '' });
  const [iaLoading, setIaLoading] = useState(false);
  const [iaPlano, setIaPlano] = useState(null);
  const [iaError, setIaError] = useState(null);
  const [observacoesPorFase, setObservacoesPorFase] = useState({});
  const [iaFaseLoading, setIaFaseLoading] = useState(null);
  const [iaFaseResposta, setIaFaseResposta] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPlanoDetalhes, setShowPlanoDetalhes] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);

  const carregarPlantios = useCallback(async () => {
    try {
      const data = await plantioService.listarPlantios();
      setPlantios(data.plantios || []);
    } catch (err) {
      console.error('Erro ao carregar plantios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarPlantios(); }, [carregarPlantios]);

  const iniciarIA = () => {
    setIaStep('perguntar');
    setIaPlano(null);
    setIaError(null);
    setIaData({ cultura: '', provincia: '', municipio: '', area: '', orcamento: '', dataInicio: '' });
  };

  const handleIaInput = (field, value) => {
    setIaData(prev => ({ ...prev, [field]: value }));
  };

  const gerarPlano = async () => {
    if (!iaData.cultura || !iaData.provincia || !iaData.area) return;
    setIaLoading(true);
    setIaError(null);
    setIaStep('gerando');
    try {
      const res = await plantioService.planearCompleto({
        cultura: iaData.cultura,
        provincia: iaData.provincia,
        municipio: iaData.municipio,
        area: parseFloat(iaData.area) || 0,
        orcamento: parseFloat(iaData.orcamento) || 0,
        dataInicio: iaData.dataInicio
      });
      if (res.success && res.plano) {
        setIaPlano(res.plano);
        setIaStep('plano');
      } else {
        setIaError('IA não conseguiu gerar o plano. Tenta novamente.');
        setIaStep('erro');
      }
    } catch (err) {
      setIaError('Erro ao contactar IA. Verifica a conexão.');
      setIaStep('erro');
    } finally {
      setIaLoading(false);
    }
  };

  const salvarPlano = async () => {
    if (!iaPlano) return;
    try {
      const nome = `Plano ${iaData.cultura} - ${iaData.provincia} ${new Date().toLocaleDateString('pt-PT')}`;
      const res = await plantioService.salvarPlanoCompleto({
        nome, cultura: iaData.cultura, provincia: iaData.provincia,
        municipio: iaData.municipio, area: parseFloat(iaData.area) || 0,
        orcamento: parseFloat(iaData.orcamento) || 0,
        dataInicio: iaData.dataInicio || null,
        plano: iaPlano
      });
      if (res.plantio) {
        setPlantios(prev => [res.plantio, ...prev]);
        setPlantioAtivo(res.plantio);
        setIaStep(null);
        setIaPlano(null);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  const handleCriarNormal = async () => {
    if (!editForm.nome || !editForm.cultura) return;
    try {
      const res = await plantioService.criarPlantio(editForm);
      if (res.plantio) {
        setPlantios(prev => [res.plantio, ...prev]);
        setPlantioAtivo(res.plantio);
        setShowEdit(false);
        setEditForm({});
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleAtualizarFase = async (codigo, status) => {
    if (!plantioAtivo) return;
    try {
      const obsTexto = observacoesPorFase[codigo] || '';
      const data = await plantioService.atualizarFase(plantioAtivo._id, {
        codigo, status, observacoes: obsTexto,
        dataInicio: status === 'em_andamento' ? new Date().toISOString() : undefined
      });
      setPlantioAtivo(data.plantio);
      setPlantios(prev => prev.map(p => p._id === data.plantio._id ? data.plantio : p));
      setObservacoesPorFase(prev => ({ ...prev, [codigo]: '' }));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handlePerguntarIA = async (codigoFase) => {
    if (!plantioAtivo) return;
    setIaFaseLoading(codigoFase);
    setIaFaseResposta(null);
    try {
      const data = await plantioService.perguntarIA({
        codigoFase, cultura: plantioAtivo.cultura,
        provincia: plantioAtivo.provincia, observacoes: observacoesPorFase[codigoFase] || ''
      });
      setIaFaseResposta({ codigoFase, ...data });
    } catch (err) {
      console.error('Erro IA:', err);
    } finally {
      setIaFaseLoading(null);
    }
  };

  const handleMudarStatus = async (status) => {
    if (!plantioAtivo) return;
    try {
      const data = await plantioService.mudarStatus(plantioAtivo._id, status);
      setPlantioAtivo(data.plantio);
      setPlantios(prev => prev.map(p => p._id === data.plantio._id ? data.plantio : p));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleAtualizarPlantio = async () => {
    if (!plantioAtivo) return;
    try {
      const data = await plantioService.atualizarPlantio(plantioAtivo._id, editForm);
      setPlantioAtivo(data.plantio);
      setPlantios(prev => prev.map(p => p._id === data.plantio._id ? data.plantio : p));
      setShowEdit(false);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleEliminarPlantio = async (id) => {
    if (!window.confirm('Tem certeza que deseja eliminar este plantio? Esta ação não pode ser desfeita.')) return;
    try {
      await plantioService.eliminarPlantio(id);
      setPlantios(prev => prev.filter(p => p._id !== id));
      if (plantioAtivo?._id === id) setPlantioAtivo(null);
    } catch (err) {
      console.error('Erro ao eliminar:', err);
    }
  };

  const exportarPDF = async () => {
    if (!plantioAtivo) return;
    setExportandoPDF(true);
    try {
      await new Promise(r => setTimeout(r, 300));

      // Capturar gráficos do DOM
      const chartEls = document.querySelectorAll('[data-report-chart]');
      const chartImages = {};
      for (const el of chartEls) {
        const key = el.getAttribute('data-report-chart');
        try {
          const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false });
          chartImages[key] = canvas.toDataURL('image/png');
        } catch { chartImages[key] = null; }
      }

      const p = plantioAtivo;
      const plano = p.plano || {};
      const inv = plano.investimento || {};
      const prod = plano.producao || {};
      const capH = plano.capitalHumano || {};
      const cronograma = plano.cronograma || [];
      const riscos = plano.riscos || [];

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const m = 20;
      let y = 25;

      const GREEN = [74, 124, 89];
      const DARK = [25, 35, 45];
      const GRAY = [100, 116, 139];
      const LIGHT_BG = [245, 248, 245];

      const fN = (v) => { if (v == null) return '0,00'; const n = Number(v); return isNaN(n) ? '0,00' : n.toLocaleString('pt-AO', { minimumFractionDigits: 2 }); };
      const fI = (v) => { if (v == null) return '0'; const n = Number(v); return isNaN(n) ? '0' : n.toLocaleString('pt-AO'); };
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

      const addChartImg = (key, w = 160, h = 65) => {
        if (!chartImages[key]) return;
        checkPage(h + 10);
        doc.addImage(chartImages[key], 'PNG', (pw - w) / 2, y, w, h);
        y += h + 8;
      };

      const textBlock = (text) => {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pw - 2 * m);
        for (const line of lines) { checkPage(5); doc.text(line, m, y); y += 5; }
      };

      // =============================================
      // CAPA
      // =============================================
      doc.setFillColor(245, 248, 245); doc.rect(0, 0, pw, ph, 'F');
      doc.setFillColor(...GREEN); doc.rect(0, 0, pw, 6, 'F');

      // Logo circle
      doc.setFillColor(...GREEN); doc.circle(pw / 2, 55, 20, 'F');
      doc.setFillColor(255, 255, 255); doc.circle(pw / 2, 55, 14, 'F');
      doc.setFillColor(...GREEN); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('PA', pw / 2, 59, { align: 'center' });

      doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
      doc.text('RELATORIO DE PLANTIO', pw / 2, 100, { align: 'center' });

      doc.setDrawColor(...GREEN); doc.setLineWidth(0.8); doc.line(50, 110, pw - 50, 110);

      doc.setFontSize(16); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GREEN);
      doc.text(p.nome || 'Plantio', pw / 2, 125, { align: 'center' });

      doc.setFontSize(11); doc.setTextColor(...GRAY);
      doc.text(`${(p.cultura || '').toUpperCase()} | ${p.provincia || ''}${p.municipio ? ', ' + p.municipio : ''}`, pw / 2, 140, { align: 'center' });
      doc.text(`Area: ${p.area ? p.area + ' ha' : '-'} | Orcamento: ${p.orcamento ? fN(p.orcamento) + ' Kz' : '-'}`, pw / 2, 152, { align: 'center' });

      const statusText = p.status === 'concluido' ? 'CONCLUIDO' : p.status === 'cancelado' ? 'CANCELADO' : p.status === 'arquivado' ? 'ARQUIVADO' : 'EM CURSO';
      const statusColor = p.status === 'concluido' ? GREEN : p.status === 'cancelado' ? [220, 38, 38] : [59, 130, 246];
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(statusText, pw / 2, 168, { align: 'center' });

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
      doc.text(`Prognos Agri 2.0`, pw / 2, 190, { align: 'center' });
      doc.text(new Date().toLocaleString('pt-PT'), pw / 2, 198, { align: 'center' });

      // =============================================
      // PAGINA 2+
      // =============================================
      doc.addPage(); y = 25;

      // 1. RESUMO EXECUTIVO
      sec('RESUMO EXECUTIVO', '1');
      const progresso = Math.round((p.fases.filter(f => f.status === 'concluido' || f.status === 'pulado').length / p.fases.length) * 100);
      const concluidas = p.fases.filter(f => f.status === 'concluido').length;
      const andamento = p.fases.filter(f => f.status === 'em_andamento').length;
      const pendentes = p.fases.filter(f => f.status === 'pendente').length;

      // Alerta de inadequação
      if (plano.culturaAdequada === false) {
        checkPage(20);
        doc.setFillColor(255, 245, 238); doc.rect(m, y - 2, pw - 2 * m, 18, 'F');
        doc.setDrawColor(239, 68, 68); doc.setLineWidth(0.5); doc.line(m, y - 2, m, y + 16);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 38, 38);
        doc.text('CULTURA NAO RECOMENDADA PARA ESTA LOCALIZACAO', m + 4, y + 4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
        if (plano.motivoAdequacao) textBlock(plano.motivoAdequacao);
        if (plano.provinciaRecomendada && plano.provinciaRecomendada !== p.provincia) {
          doc.setFont('helvetica', 'bold'); doc.text(`Provincia recomendada: ${plano.provinciaRecomendada}`, m + 4, y + 12);
        }
        if (plano.culturaAlternativa) {
          doc.setFont('helvetica', 'normal'); doc.text(`Cultura sugerida para ${p.provincia}: ${plano.culturaAlternativa}`, m + 4, y + 16);
        }
        y += 22;
      } else if (plano.culturaAdequada === true && plano.motivoAdequacao) {
        checkPage(14);
        doc.setFillColor(240, 248, 240); doc.rect(m, y - 2, pw - 2 * m, 10, 'F');
        doc.setDrawColor(...GREEN); doc.setLineWidth(0.5); doc.line(m, y - 2, m, y + 8);
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN);
        doc.text('CULTURA ADEQUADA PARA ESTA LOCALIZACAO', m + 4, y + 3);
        y += 12;
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
        textBlock(plano.motivoAdequacao);
        y += 4;
      }

      if (plano.resumo) {
        textBlock(plano.resumo);
        y += 4;
      }

      tbl(['Indicador', 'Valor'], [
        ['Cultura', p.cultura || '-'],
        ['Provencia', p.provincia || '-'],
        ['Municipio', p.municipio || '-'],
        ['Area total', `${p.area || 0} ha`],
        ['Orcamento', `${p.orcamento ? fN(p.orcamento) + ' Kz' : '-'}`],
        ['Progresso geral', `${progresso}%`],
        ['Fases concluidas', `${concluidas} de ${p.fases.length}`],
        ['Fases em andamento', `${andamento}`],
        ['Fases pendentes', `${pendentes}`],
        ['Data de inicio', p.dataInicio ? new Date(p.dataInicio).toLocaleDateString('pt-PT') : '-'],
      ]);

      // 2. RECOMENDACAO DE LOCALIZACAO
      if (plano.recomendacaoLocalizacao) {
        sec('RECOMENDACAO DE LOCALIZACAO', '2');
        textBlock(plano.recomendacaoLocalizacao);
        y += 4;

        if (plano.municipiosRecomendados?.length) {
          const munBody = plano.municipiosRecomendados.map(m => [m.nome, m.justificativa || '-']);
          tbl(['Municipio', 'Justificativa'], munBody);
        }
      }

      // 3. PROGRESSO DAS FASES
      sec('PROGRESSO DAS FASES', plano.recomendacaoLocalizacao ? '3' : '2');
      const fasesBody = p.fases.map(f => {
        const st = f.status === 'concluido' ? 'Concluido' : f.status === 'em_andamento' ? 'Em andamento' : f.status === 'pulado' ? 'Pulado' : 'Pendente';
        return [f.nome, st, f.observacoes || '-', f.recomendacaoIA || '-'];
      });
      tbl(['Fase', 'Status', 'Observacoes', 'Recomendacao IA'], fasesBody, {
        columns: { 0: { cellWidth: 35 }, 1: { cellWidth: 25 }, 2: { cellWidth: 50 }, 3: { cellWidth: 55 } }
      });

      // 4. INVESTIMENTO
      if (inv.total) {
        sec('INVESTIMENTO DETALHADO', '4');
        const invBody = [
          ['Sementes', `${fN(inv.sementes)} Kz`, '20%'],
          ['Fertilizantes', `${fN(inv.fertilizantes)} Kz`, '25%'],
          ['Defensivos', `${fN(inv.defensivos)} Kz`, '10%'],
          ['Mao de obra', `${fN(inv.maoObra)} Kz`, '25%'],
          ['Maquinario', `${fN(inv.maquinario)} Kz`, '10%'],
          ['Imprevistos', `${fN(inv.imprevistos)} Kz`, '10%'],
          ['TOTAL', `${fN(inv.total)} Kz`, '100%']
        ].filter(r => r[1] !== '0,00 Kz');
        tbl(['Item', 'Custo (Kz)', '%'], invBody, {
          columns: { 1: { halign: 'right' }, 2: { halign: 'right', cellWidth: 25 } },
          tableOptions: { didParseCell: (data) => { if (data.row.index === invBody.length - 1) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = LIGHT_BG; } } }
        });
        addChartImg('pie-investimento', 140, 60);
      }

      // 5. CAPITAL HUMANO
      if (capH.total) {
        sec('CAPITAL HUMANO', '5');
        tbl(['Categoria', 'Quantidade'], [
          ['Trabalhadores permanentes', fI(capH.trabalhadoresPermanentes)],
          ['Trabalhadores sazonais', fI(capH.trabalhadoresSazonais)],
          ['Tecnicos/operadores', fI(capH.tecnicosOperadores)],
          ['TOTAL', fI(capH.total)]
        ]);
      }

      // 6. PRODUCAO ESTIMADA
      if (prod.areaTotalHa) {
        sec('PRODUCAO ESTIMADA', '6');
        tbl(['Indicador', 'Valor'], [
          ['Produtividade', `${prod.produtividadeTonHa || 0} ton/ha`],
          ['Area total cultivada', `${prod.areaTotalHa} ha`],
          ['Producao total estimada', `${prod.ProducaoTotalTon || 0} ton`],
          ['Preco por kg', prod.precoPorKg ? `${fN(prod.precoPorKg)} Kz/kg` : '-'],
          ['Preco por tonelada', prod.precoPorTon ? `${fN(prod.precoPorTon)} Kz/ton` : '-'],
          ['Renda bruta estimada', `${fN(prod.rendaBrutaEstimada)} Kz`],
          ['Lucro estimado', `${fN(prod.lucroEstimado)} Kz`],
        ]);
        addChartImg('bar-projecao', 150, 60);
      }

      // 7. CRONOGRAMA
      if (cronograma.length) {
        sec('CRONOGRAMA DE ATIVIDADES', '7');
        const cronBody = cronograma.map(c => [
          c.atividade,
          new Date(c.inicio).toLocaleDateString('pt-PT'),
          new Date(c.fim).toLocaleDateString('pt-PT'),
          `${c.dias} dias`
        ]);
        tbl(['Atividade', 'Inicio', 'Fim', 'Duracao'], cronBody, {
          columns: { 3: { halign: 'right', cellWidth: 30 } }
        });
        addChartImg('gantt-cronograma', 170, 55);
      }

      // 8. ANALISE DE RISCOS
      if (riscos.length) {
        sec('ANALISE DE RISCOS', '8');
        const riscosBody = riscos.map(r => {
          const tipo = r.tipo === 'climatico' ? 'Climatico' : r.tipo === 'praga' ? 'Praga' : 'Doenca';
          return [tipo, r.descricao, r.mitigacao];
        });
        tbl(['Tipo', 'Descricao', 'Mitigacao'], riscosBody, {
          columns: { 0: { cellWidth: 25 }, 1: { cellWidth: 60 }, 2: { cellWidth: 75 } }
        });
      }

      // 9. PRODUCAO REAL (se existir)
      if (p.producaoReal || p.receitaReal) {
        sec('RESULTADOS REAIS', '9');
        tbl(['Indicador', 'Valor'], [
          ['Producao real', `${p.producaoReal ? fN(p.producaoReal) + ' ton' : '-'}`],
          ['Receita real', `${p.receitaReal ? fN(p.receitaReal) + ' Kz' : '-'}`],
        ]);
      }

      // RODAPE em todas as paginas
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 210); doc.setLineWidth(0.3);
        doc.line(m, ph - 12, pw - m, ph - 12);
        doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
        doc.text(`Prognos Agri 2.0`, m, ph - 6);
        doc.text(`Pagina ${i} de ${pages}`, pw - m, ph - 6, { align: 'right' });
      }

      doc.save(`Plantio_${(p.nome || 'relatorio').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) { console.error('Erro ao gerar PDF:', e); } finally { setExportandoPDF(false); }
  };

  const progresso = plantioAtivo
    ? Math.round((plantioAtivo.fases.filter(f => f.status === 'concluido' || f.status === 'pulado').length / plantioAtivo.fases.length) * 100)
    : 0;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader size={32} className="spinner" color="var(--secondary)" /></div>;

  const renderFormIA = () => (
    <PrognosCard title="🌱 Novo Plano com IA" icon={<Sparkles size={18} />} style={{ marginBottom: '24px' }}>
      <div style={{ display: 'grid', gap: '12px' }}>
        <div className="grid-2" style={{ gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">🌾 Cultura</label>
            <select className="input" value={iaData.cultura} onChange={e => handleIaInput('cultura', e.target.value)}>
              <option value="">Seleccionar cultura</option>
              <option value="milho">Milho</option>
              <option value="feijao">Feijão</option>
              <option value="mandioca">Mandioca</option>
              <option value="batata-doce">Batata-doce</option>
              <option value="amendoim">Amendoim</option>
              <option value="tomate">Tomate</option>
              <option value="arroz">Arroz</option>
              <option value="soja">Soja</option>
              <option value="cafe">Café</option>
              <option value="outra">Outra</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">📐 Área (hectares)</label>
            <input type="number" className="input" placeholder="Ex: 10" value={iaData.area}
              onChange={e => handleIaInput('area', e.target.value)} />
          </div>
        </div>
        <div className="grid-2" style={{ gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">📍 Província</label>
            <input className="input" placeholder="Ex: Bié" value={iaData.provincia}
              onChange={e => handleIaInput('provincia', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">📍 Município</label>
            <input className="input" placeholder="Ex: Cuíto" value={iaData.municipio}
              onChange={e => handleIaInput('municipio', e.target.value)} />
          </div>
        </div>
        <div className="grid-2" style={{ gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">💰 Orçamento (Kz)</label>
            <input type="number" className="input" placeholder="Ex: 2000000" value={iaData.orcamento}
              onChange={e => handleIaInput('orcamento', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">📅 Data de início</label>
            <input type="date" className="input" value={iaData.dataInicio}
              onChange={e => handleIaInput('dataInicio', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button className="btn btn-ghost" onClick={() => { setIaStep(null); setIaPlano(null); }}>Cancelar</button>
          <button className="btn btn-primary" onClick={gerarPlano} disabled={!iaData.cultura || !iaData.provincia || !iaData.area}>
            <Sparkles size={16} /> Gerar Plano com IA
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          A IA vai gerar um plano completo com investimento, cronograma, produção estimada e análise de riscos.
        </p>
      </div>
    </PrognosCard>
  );

  const renderPlano = () => {
    if (!iaPlano) return null;
    const p = iaPlano;
    const investData = p.investimento?.itens?.map(item => ({
      label: item.nome, valor: item.custo, percentual: item.percentagem,
      cor: item.nome === 'Sementes' ? '#4A7C59' : item.nome === 'Fertilizantes' ? '#3b82f6' : item.nome === 'Defensivos' ? '#ef4444' : item.nome === 'Mão de obra' ? '#f59e0b' : item.nome === 'Maquinário' ? '#8b5cf6' : '#64748b'
    })) || [];

    return (
      <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
        <PrognosCard title="📋 Plano Gerado pela IA" icon={<Sparkles size={18} />}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.resumo}</p>
        </PrognosCard>

        <PrognosCard title="📍 Recomendação de Localização">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{p.localizacao?.recomendacao}</p>
          {p.localizacao?.municipios?.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: i < p.localizacao.municipios.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <MapPin size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{m.nome}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.justificativa}</p>
              </div>
            </div>
          ))}
        </PrognosCard>

        <PrognosCard title="💰 Investimento" icon={<DollarSign size={18} />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>Custo (Kz)</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {p.investimento?.itens?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 4px' }}>{item.nome}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>{Number(item.custo).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>{item.percentagem}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--primary)' }}>
                    <td style={{ padding: '6px 4px' }}>TOTAL</td>
                    <td style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--primary)' }}>{Number(p.investimento?.total).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '6px 4px' }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Distribuição dos Custos</h4>
              <PieChartCSS data={investData} size={140} />
            </div>
          </div>
        </PrognosCard>

        <div className="grid-2" style={{ gap: '16px' }}>
          <PrognosCard title="👥 Capital Humano" icon={<Users size={18} />}>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Trabalhadores permanentes</span>
                <strong>{p.capitalHumano?.permanentes || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Trabalhadores sazonais</span>
                <strong>{p.capitalHumano?.sazonais || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Técnicos/operadores</span>
                <strong>{p.capitalHumano?.tecnicos || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>Total de pessoas</span>
                <strong style={{ color: 'var(--primary)' }}>{p.capitalHumano?.total || 0}</strong>
              </div>
            </div>
          </PrognosCard>

          <PrognosCard title="📈 Produção Estimada" icon={<TrendingUp size={18} />}>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Produtividade esperada</span>
                <strong>{p.producao?.produtividade} {p.producao?.unidade || 'ton/ha'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Área total</span>
                <strong>{p.producao?.area} ha</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Produção total</span>
                <strong>{p.producao?.producaoTotal} ton</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Preço estimado</span>
                <strong>{Number(p.producao?.precoEstimado || 0).toLocaleString()} Kz/ton</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>Renda bruta</span>
                <strong style={{ color: '#4A7C59' }}>{Number(p.producao?.rendaBruta || 0).toLocaleString()} Kz</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>Lucro estimado</span>
                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{Number(p.producao?.lucroEstimado || 0).toLocaleString()} Kz</strong>
              </div>
            </div>
            <div style={{ marginTop: '12px' }} data-report-chart="bar-projecao-preview">
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Investimento vs Retorno</h4>
              <BarChart data={[
                { label: 'Investimento', valor: p.investimento?.total || 0, cor: '#3b82f6' },
                { label: 'Renda Bruta', valor: p.producao?.rendaBruta || 0, cor: '#4A7C59' },
                { label: 'Lucro', valor: p.producao?.lucroEstimado || 0, cor: '#10b981' }
              ]} height={150} />
            </div>
          </PrognosCard>
        </div>

        <PrognosCard title="📅 Cronograma" icon={<Calendar size={18} />}>
          <GanttChart tasks={p.cronograma || []} />
          <details style={{ marginTop: '12px' }}>
            <summary style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>Ver tabela detalhada</summary>
            <table style={{ width: '100%', fontSize: '0.8rem', marginTop: '8px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Atividade</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Início</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Fim</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Dias</th>
                </tr>
              </thead>
              <tbody>
                {p.cronograma?.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px' }}>{t.atividade}</td>
                    <td style={{ padding: '6px' }}>{t.inicio}</td>
                    <td style={{ padding: '6px' }}>{t.fim}</td>
                    <td style={{ textAlign: 'right', padding: '6px' }}>{t.dias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </PrognosCard>

        <PrognosCard title="⚠️ Análise de Riscos" icon={<AlertTriangle size={18} />}>
          <div className="grid-3" style={{ gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: '#f59e0b' }}>🌤️ Riscos Climáticos</h4>
              {p.riscos?.climaticos?.map((r, i) => (
                <div key={i} style={{ padding: '8px', background: 'rgba(245,166,35,0.08)', borderRadius: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '1.2rem' }}>{r.icone}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.mitigacao}</div>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: '#ef4444' }}>🐛 Pragas</h4>
              {p.riscos?.pragas?.map((r, i) => (
                <div key={i} style={{ padding: '8px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '1.2rem' }}>{r.icone}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.mitigacao}</div>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: '#8b5cf6' }}>🍄 Doenças</h4>
              {p.riscos?.doencas?.map((r, i) => (
                <div key={i} style={{ padding: '8px', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '1.2rem' }}>{r.icone}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.mitigacao}</div>
                </div>
              ))}
            </div>
          </div>
        </PrognosCard>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={salvarPlano}>
            <Sprout size={16} /> Salvar Plano e Iniciar
          </button>
          <button className="btn btn-ghost" onClick={() => setIaStep('perguntar')}>
            <Edit3 size={16} /> Editar Parâmetros
          </button>
          <button className="btn btn-ghost" onClick={() => { setIaStep(null); setIaPlano(null); }}>
            <X size={16} /> Descartar
          </button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!plantioAtivo) return null;
    const stats = {
      concluidas: plantioAtivo.fases.filter(f => f.status === 'concluido').length,
      andamento: plantioAtivo.fases.filter(f => f.status === 'em_andamento').length,
      pendentes: plantioAtivo.fases.filter(f => f.status === 'pendente').length,
      total: plantioAtivo.fases.length
    };

    return (
      <div>
        <button className="btn btn-ghost" onClick={() => setPlantioAtivo(null)} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Voltar à lista
        </button>

        <PrognosCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>{plantioAtivo.nome}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {plantioAtivo.cultura} {plantioAtivo.provincia && `• ${plantioAtivo.provincia}`}
                {plantioAtivo.municipio && `, ${plantioAtivo.municipio}`}
                {plantioAtivo.area && ` • ${plantioAtivo.area} ha`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '4px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                background: plantioAtivo.status === 'concluido' ? 'rgba(74,124,89,0.15)' :
                            plantioAtivo.status === 'cancelado' ? 'rgba(239,68,68,0.15)' :
                            plantioAtivo.status === 'arquivado' ? 'rgba(100,116,139,0.15)' :
                            'rgba(59,130,246,0.15)',
                color: plantioAtivo.status === 'concluido' ? '#4A7C59' :
                       plantioAtivo.status === 'cancelado' ? '#ef4444' :
                       plantioAtivo.status === 'arquivado' ? '#64748b' : '#3b82f6'
              }}>
                {plantioAtivo.status === 'ativo' || !plantioAtivo.status ? 'Em curso' :
                 plantioAtivo.status === 'concluido' ? 'Concluído' :
                 plantioAtivo.status === 'cancelado' ? 'Cancelado' : 'Arquivado'}
              </div>
              {plantioAtivo.plano && (
                <button className="btn btn-sm btn-ghost" onClick={() => setShowPlanoDetalhes(!showPlanoDetalhes)} title="Ver dados do plano IA">
                  <FileText size={14} /> {showPlanoDetalhes ? 'Ocultar' : 'Ver Plano'}
                </button>
              )}
              <button className="btn btn-sm btn-ghost" onClick={exportarPDF} title="Exportar PDF" disabled={exportandoPDF}>
                {exportandoPDF ? <Loader size={14} className="spinner" /> : <Download size={14} />} {exportandoPDF ? 'A gerar...' : 'PDF'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => { setEditForm(plantioAtivo); setShowEdit(true); }} title="Editar">
                <Edit3 size={14} />
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => handleMudarStatus('concluido')} title="Concluir">
                <CheckCircle2 size={14} color="#4A7C59" />
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => handleMudarStatus('arquivado')} title="Arquivar">
                <Archive size={14} />
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => { if (window.confirm('Cancelar este plantio?')) handleMudarStatus('cancelado'); }} title="Cancelar">
                <Ban size={14} color="#ef4444" />
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => handleEliminarPlantio(plantioAtivo._id)} title="Eliminar" style={{ color: '#ef4444' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', transition: 'width 0.5s', width: `${progresso}%`, background: 'linear-gradient(90deg, var(--secondary), var(--primary))' }} />
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '0.85rem' }}>
            <span>✅ {stats.concluidas} concluídas</span>
            <span style={{ color: '#3b82f6' }}>⏳ {stats.andamento} em andamento</span>
            <span style={{ color: 'var(--text-muted)' }}>⭕ {stats.pendentes} pendentes</span>
            <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{progresso}% completo</span>
          </div>
        </PrognosCard>

        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          {plantioAtivo.fases.map((fase, idx) => {
            const Icone = ICONES_FASE[fase.codigo] || HelpCircle;
            const isActive = plantioAtivo.faseAtual === idx || fase.status === 'em_andamento';
            const isIaLoading = iaFaseLoading === fase.codigo;
            const mostraIA = iaFaseResposta?.codigoFase === fase.codigo;

            return (
              <PrognosCard key={fase.codigo} style={{
                borderLeft: `4px solid ${fase.status === 'concluido' ? '#4A7C59' : fase.status === 'em_andamento' ? '#3b82f6' : fase.status === 'pulado' ? '#64748b' : '#e2e8f0'}`
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: fase.status === 'concluido' ? 'rgba(74,124,89,0.15)' : isActive ? 'rgba(59,130,246,0.15)' : 'var(--bg-body)',
                    color: fase.status === 'concluido' ? '#4A7C59' : isActive ? '#3b82f6' : 'var(--text-muted)'
                  }}>
                    <Icone size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fase.nome}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusIcon(fase.status)}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: fase.status === 'concluido' ? '#4A7C59' : fase.status === 'em_andamento' ? '#3b82f6' : fase.status === 'pulado' ? '#64748b' : '#94a3b8' }}>
                          {fase.status === 'concluido' ? 'Concluído' : fase.status === 'em_andamento' ? 'Em andamento' : fase.status === 'pulado' ? 'Pulado' : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    {fase.observacoes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
                        "{fase.observacoes}"
                      </div>
                    )}

                    {mostraIA && iaFaseResposta?.recomendacao && (
                      <div style={{ padding: '12px', borderRadius: 'var(--radius)', marginTop: '8px', marginBottom: '8px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600, color: '#8b5cf6' }}>
                          <Sparkles size={14} /> Recomendação IA
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>{iaFaseResposta.recomendacao}</div>
                        {iaFaseResposta.dicas?.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <strong style={{ fontSize: '0.8rem' }}>Dicas:</strong>
                            <ul style={{ margin: '4px 0 0 16px', fontSize: '0.8rem' }}>
                              {iaFaseResposta.dicas.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {fase.status === 'em_andamento' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <textarea className="input" rows={2} placeholder="Observações desta fase..."
                          value={observacoesPorFase[fase.codigo] || ''}
                          onChange={e => setObservacoesPorFase(prev => ({ ...prev, [fase.codigo]: e.target.value }))}
                          style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                        <button className="btn btn-sm btn-secondary" onClick={() => handlePerguntarIA(fase.codigo)} disabled={isIaLoading}>
                          {isIaLoading ? <Loader size={14} className="spinner" /> : <Sparkles size={14} />}
                          {isIaLoading ? 'IA a pensar...' : 'Pedir ajuda à IA'}
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleAtualizarFase(fase.codigo, 'concluido')}>
                          <CheckCircle2 size={14} /> Concluir fase
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleAtualizarFase(fase.codigo, 'pulado')}>
                          <X size={14} /> Pular
                        </button>
                      </div>
                    )}

                    {fase.status === 'pendente' && isActive && (
                      <div style={{ marginTop: '8px' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleAtualizarFase(fase.codigo, 'em_andamento')}>
                          <Clock size={14} /> Iniciar esta fase
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </PrognosCard>
            );
          })}
        </div>

        {showPlanoDetalhes && plantioAtivo.plano && (() => {
          const plano = plantioAtivo.plano;
          const inv = plano.investimento || {};
          const prod = plano.producao || {};
          const capH = plano.capitalHumano || {};
          const cronograma = plano.cronograma || [];
          const riscos = plano.riscos || [];
          const invItens = [
            { nome: 'Sementes', custo: inv.sementes, pct: 20, cor: '#4A7C59' },
            { nome: 'Fertilizantes', custo: inv.fertilizantes, pct: 25, cor: '#3b82f6' },
            { nome: 'Defensivos', custo: inv.defensivos, pct: 10, cor: '#ef4444' },
            { nome: 'Mão de obra', custo: inv.maoObra, pct: 25, cor: '#f59e0b' },
            { nome: 'Maquinário', custo: inv.maquinario, pct: 10, cor: '#8b5cf6' },
            { nome: 'Imprevistos', custo: inv.imprevistos, pct: 10, cor: '#64748b' }
          ].filter(i => i.custo);

          return (
            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
              {plano.resumo && (
                <PrognosCard title="📋 Análise do Plano" icon={<FileText size={18} />}>
                  {plano.culturaAdequada === false && (
                    <div style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem', marginBottom: '6px' }}>
                        ⚠️ Cultura não recomendada para esta localização
                      </div>
                      {plano.motivoAdequacao && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{plano.motivoAdequacao}</p>
                      )}
                      {plano.provinciaRecomendada && plano.provinciaRecomendada !== plantioAtivo.provincia && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong>Província recomendada para {plantioAtivo.cultura}:</strong> {plano.provinciaRecomendada}
                        </div>
                      )}
                      {plano.culturaAlternativa && (
                        <div style={{ fontSize: '0.85rem', color: '#4A7C59', marginTop: '6px', fontWeight: 600 }}>
                          💡 Cultura sugerida para {plantioAtivo.provincia}: {plano.culturaAlternativa}
                        </div>
                      )}
                    </div>
                  )}
                  {plano.culturaAdequada === true && plano.motivoAdequacao && (
                    <div style={{ padding: '12px', background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.2)', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#4A7C59', fontSize: '0.9rem', marginBottom: '4px' }}>
                        ✅ Cultura adequada para esta localização
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{plano.motivoAdequacao}</p>
                    </div>
                  )}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{plano.resumo}</p>
                </PrognosCard>
              )}

              {plano.recomendacaoLocalizacao && (
                <PrognosCard title="📍 Análise de Localização">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{plano.recomendacaoLocalizacao}</p>
                  {plano.municipiosRecomendados?.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      {plano.municipiosRecomendados.map((m, i) => (
                        <div key={i} style={{ padding: '8px', background: 'var(--bg-body)', borderRadius: '8px', marginBottom: '6px', fontSize: '0.85rem' }}>
                          <strong>{m.nome}</strong> — {m.justificativa}
                        </div>
                      ))}
                    </div>
                  )}
                </PrognosCard>
              )}

              {inv.total ? (
                <PrognosCard title="💰 Investimento" icon={<DollarSign size={18} />}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                    <div>
                      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '6px 4px' }}>Item</th>
                            <th style={{ textAlign: 'right', padding: '6px 4px' }}>Custo (Kz)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invItens.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '6px 4px' }}>{item.nome}</td>
                              <td style={{ textAlign: 'right', padding: '6px 4px' }}>{Number(item.custo).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ fontWeight: 700, borderTop: '2px solid var(--primary)' }}>
                            <td style={{ padding: '6px 4px' }}>TOTAL</td>
                            <td style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--primary)' }}>{Number(inv.total).toLocaleString()} Kz</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div>
                      <div data-report-chart="pie-investimento">
                        <PieChartCSS data={invItens.map(i => ({ label: i.nome, valor: i.custo, cor: i.cor }))} size={140} />
                      </div>
                    </div>
                  </div>
                </PrognosCard>
              ) : null}

              {(capH.total || prod.areaTotalHa) ? (
                <div className="grid-2" style={{ gap: '16px' }}>
                  {capH.total ? (
                    <PrognosCard title="👥 Capital Humano" icon={<Users size={18} />}>
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Trabalhadores permanentes</span><strong>{capH.trabalhadoresPermanentes || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Trabalhadores sazonais</span><strong>{capH.trabalhadoresSazonais || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Técnicos/operadores</span><strong>{capH.tecnicosOperadores || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700 }}>
                          <span>Total</span><strong style={{ color: 'var(--primary)' }}>{capH.total}</strong>
                        </div>
                      </div>
                    </PrognosCard>
                  ) : null}

                  {prod.areaTotalHa ? (
                    <PrognosCard title="📈 Produção Estimada" icon={<TrendingUp size={18} />}>
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Produtividade</span><strong>{prod.produtividadeTonHa || 0} ton/ha</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Área total</span><strong>{prod.areaTotalHa} ha</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Produção total</span><strong>{prod.ProducaoTotalTon || 0} ton</strong>
                        </div>
                        {prod.precoPorKg ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                            <span>Preço por kg</span><strong>{Number(prod.precoPorKg).toLocaleString()} Kz/kg</strong>
                          </div>
                        ) : null}
                        {prod.precoPorTon ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                            <span>Preço por tonelada</span><strong>{Number(prod.precoPorTon).toLocaleString()} Kz/ton</strong>
                          </div>
                        ) : null}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>Renda bruta</span><strong style={{ color: '#4A7C59' }}>{Number(prod.rendaBrutaEstimada || 0).toLocaleString()} Kz</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span>Lucro estimado</span><strong style={{ color: '#10b981' }}>{Number(prod.lucroEstimado || 0).toLocaleString()} Kz</strong>
                        </div>
                      </div>
                      {inv.total ? (
                        <div style={{ marginTop: '12px' }} data-report-chart="bar-projecao">
                          <BarChart data={[
                            { label: 'Investimento', valor: inv.total || 0, cor: '#3b82f6' },
                            { label: 'Renda Bruta', valor: prod.rendaBrutaEstimada || 0, cor: '#4A7C59' },
                            { label: 'Lucro', valor: prod.lucroEstimado || 0, cor: '#10b981' }
                          ]} height={120} />
                        </div>
                      ) : null}
                    </PrognosCard>
                  ) : null}
                </div>
              ) : null}

              {cronograma.length ? (
                <PrognosCard title="📅 Cronograma" icon={<Calendar size={18} />}>
                  <div data-report-chart="gantt-cronograma">
                    <GanttChart tasks={cronograma} />
                  </div>
                </PrognosCard>
              ) : null}

              {riscos.length ? (
                <PrognosCard title="⚠️ Análise de Riscos" icon={<AlertTriangle size={18} />}>
                  <div className="grid-3" style={{ gap: '12px' }}>
                    {[
                      { tipo: 'climatico', label: '🌤️ Riscos Climáticos', cor: '#f59e0b' },
                      { tipo: 'praga', label: '🐛 Pragas', cor: '#ef4444' },
                      { tipo: 'doenca', label: '🍄 Doenças', cor: '#8b5cf6' }
                    ].map(({ tipo, label, cor }) => {
                      const itens = riscos.filter(r => r.tipo === tipo);
                      if (!itens.length) return null;
                      return (
                        <div key={tipo}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: cor }}>{label}</h4>
                          {itens.map((r, i) => (
                            <div key={i} style={{ padding: '8px', background: `${cor}10`, borderRadius: '8px', marginBottom: '6px', fontSize: '0.8rem' }}>
                              <strong>{r.descricao}</strong>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{r.mitigacao}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </PrognosCard>
              ) : null}
            </div>
          );
        })()}

        {showEdit && (
          <div className="modal-overlay" onClick={() => setShowEdit(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">✏️ Editar Plantio</h2>
                <button className="modal-close" onClick={() => setShowEdit(false)}>✕</button>
              </div>
              <div className="grid-2" style={{ gap: '12px', padding: '16px' }}>
                <input className="input" placeholder="Nome" value={editForm.nome || ''} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
                <select className="input" value={editForm.cultura || ''} onChange={e => setEditForm({ ...editForm, cultura: e.target.value })}>
                  <option value="">Cultura</option>
                  <option value="milho">Milho</option>
                  <option value="feijao">Feijão</option>
                  <option value="mandioca">Mandioca</option>
                  <option value="batata-doce">Batata-doce</option>
                  <option value="amendoim">Amendoim</option>
                  <option value="tomate">Tomate</option>
                  <option value="arroz">Arroz</option>
                  <option value="soja">Soja</option>
                  <option value="cafe">Café</option>
                  <option value="outra">Outra</option>
                </select>
                <input className="input" placeholder="Província" value={editForm.provincia || ''} onChange={e => setEditForm({ ...editForm, provincia: e.target.value })} />
                <input className="input" placeholder="Município" value={editForm.municipio || ''} onChange={e => setEditForm({ ...editForm, municipio: e.target.value })} />
                <input className="input" type="number" placeholder="Área (ha)" value={editForm.area || ''} onChange={e => setEditForm({ ...editForm, area: e.target.value })} />
                <input className="input" type="number" placeholder="Orçamento (Kz)" value={editForm.orcamento || ''} onChange={e => setEditForm({ ...editForm, orcamento: e.target.value })} />
                <input className="input" type="date" placeholder="Data de início" value={editForm.dataInicio ? editForm.dataInicio.substring(0, 10) : ''} onChange={e => setEditForm({ ...editForm, dataInicio: e.target.value })} />
                <input className="input" type="number" placeholder="Produção real (ton)" value={editForm.producaoReal || ''} onChange={e => setEditForm({ ...editForm, producaoReal: e.target.value })} />
                <input className="input" type="number" placeholder="Receita real (Kz)" value={editForm.receitaReal || ''} onChange={e => setEditForm({ ...editForm, receitaReal: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', padding: '0 16px 16px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAtualizarPlantio}>
                  <Edit3 size={14} /> Salvar Alterações
                </button>
                <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (iaStep === 'perguntar') return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn-ghost" onClick={() => { setIaStep(null); setIaPlano(null); }}><ArrowLeft size={16} /> Voltar</button>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
          <Sprout style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          Novo Plano de Plantio
        </h1>
      </div>
      {renderFormIA()}
    </div>
  );

  if (iaStep === 'gerando') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
      <Loader size={48} className="spinner" color="var(--secondary)" />
      <h3 style={{ marginTop: '20px', fontWeight: 600 }}>IA a gerar o teu plano...</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
        A analisar {iaData.cultura}, {iaData.provincia}, {iaData.area}ha...
      </p>
    </div>
  );

  if (iaStep === 'plano') return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn-ghost" onClick={() => { setIaStep(null); setIaPlano(null); }}><ArrowLeft size={16} /> Voltar</button>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
          <Sparkles style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          Plano Gerado pela IA
        </h1>
      </div>
      {renderPlano()}
    </div>
  );

  if (iaStep === 'erro') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
      <AlertCircle size={48} color="#ef4444" />
      <h3 style={{ marginTop: '16px', fontWeight: 600, color: '#ef4444' }}>Erro ao gerar plano</h3>
      <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px', maxWidth: '400px' }}>{iaError}</p>
      <button className="btn btn-primary" onClick={() => setIaStep('perguntar')}>Tentar novamente</button>
    </div>
  );

  if (plantioAtivo) return renderDashboard();

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            <Sprout style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Gestão de Plantio
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Planeie e acompanhe todo o ciclo produtivo com IA
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={iniciarIA}>
            <Sparkles size={16} /> Novo com IA
          </button>
          <button className="btn btn-outline" onClick={() => { setEditForm({ nome: '', cultura: '', provincia: '', municipio: '', area: '' }); setShowEdit('criar'); }}>
            <Plus size={16} /> Criar Manual
          </button>
        </div>
      </div>

      {showEdit === 'criar' && (
        <PrognosCard title="Criar Plantio Manualmente" icon={<Plus size={18} />} style={{ marginBottom: '24px' }}>
          <div className="grid-2" style={{ gap: '12px' }}>
            <input className="input" placeholder="Nome (ex: Safra 2026)" value={editForm.nome || ''} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
            <select className="input" value={editForm.cultura || ''} onChange={e => setEditForm({ ...editForm, cultura: e.target.value })}>
              <option value="">Seleccionar cultura</option>
              <option value="milho">Milho</option>
              <option value="feijao">Feijão</option>
              <option value="mandioca">Mandioca</option>
              <option value="batata-doce">Batata-doce</option>
              <option value="amendoim">Amendoim</option>
              <option value="tomate">Tomate</option>
              <option value="arroz">Arroz</option>
              <option value="soja">Soja</option>
              <option value="cafe">Café</option>
              <option value="outra">Outra</option>
            </select>
            <input className="input" placeholder="Província" value={editForm.provincia || ''} onChange={e => setEditForm({ ...editForm, provincia: e.target.value })} />
            <input className="input" placeholder="Município" value={editForm.municipio || ''} onChange={e => setEditForm({ ...editForm, municipio: e.target.value })} />
            <input className="input" type="number" placeholder="Área (hectares)" value={editForm.area || ''} onChange={e => setEditForm({ ...editForm, area: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarNormal} disabled={!editForm.nome || !editForm.cultura}>
              <Sprout size={16} /> Criar Plantio
            </button>
          </div>
        </PrognosCard>
      )}

      {plantios.length === 0 ? (
        <PrognosCard>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Sprout size={64} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Nenhum plantio registado</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Cria o teu primeiro plano de cultivo. Usa a IA para um plano completo ou cria manualmente.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={iniciarIA}>
                <Sparkles size={18} /> Novo com IA
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => { setEditForm({ nome: '', cultura: '', provincia: '', municipio: '', area: '' }); setShowEdit('criar'); }}>
                <Plus size={18} /> Criar Manual
              </button>
            </div>
          </div>
        </PrognosCard>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['milho', 'feijao', 'mandioca', 'soja', 'cafe'].map(c => {
              const count = plantios.filter(p => p.cultura === c).length;
              if (!count) return null;
              return (
                <div key={c} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '0.85rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border)'
                }}>
                  <strong>{c.charAt(0).toUpperCase() + c.slice(1)}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{count} planos</span>
                </div>
              );
            })}
          </div>
          <div className="grid-2" style={{ gap: '16px' }}>
            {plantios.map(p => (
              <div key={p._id} style={{ cursor: 'pointer' }} onClick={() => setPlantioAtivo(p)}>
                <PrognosCard style={{ position: 'relative', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{p.nome}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {p.cultura} {p.provincia && `• ${p.provincia}`} {p.area && `• ${p.area} ha`}
                      </div>
                      {p.plano && <span style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 600 }}>✨ Plano IA</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                        background: p.status === 'concluido' ? 'rgba(74,124,89,0.15)' :
                                    p.status === 'cancelado' ? 'rgba(239,68,68,0.15)' :
                                    p.status === 'arquivado' ? 'rgba(100,116,139,0.15)' :
                                    'rgba(59,130,246,0.15)',
                        color: p.status === 'concluido' ? '#4A7C59' :
                               p.status === 'cancelado' ? '#ef4444' :
                               p.status === 'arquivado' ? '#64748b' : '#3b82f6'
                      }}>
                        {p.status === 'concluido' ? 'Concluído' :
                         p.status === 'cancelado' ? 'Cancelado' :
                         p.status === 'arquivado' ? 'Arquivado' : 'Em curso'}
                      </div>
                      <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); handleEliminarPlantio(p._id); }} title="Eliminar" style={{ color: '#ef4444', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {(!p.status || p.status !== 'cancelado') && (
                    <div style={{ marginTop: '12px', height: '6px', background: 'var(--bg-body)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px', transition: 'width 0.5s',
                        width: `${Math.round(p.fases.filter(f => f.status === 'concluido' || f.status === 'pulado').length / p.fases.length * 100)}%`,
                        background: p.status === 'concluido' ? '#4A7C59' : 'linear-gradient(90deg, var(--secondary), var(--primary))'
                      }} />
                    </div>
                  )}
                </PrognosCard>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.9rem; background: var(--bg-body); color: var(--text-primary); font-family: inherit; box-sizing: border-box; }
        .input:focus { outline: none; border-color: var(--secondary); }
        select.input { cursor: pointer; }
        textarea.input { font-family: inherit; }
        .btn-sm { padding: 6px 12px !important; font-size: 0.8rem !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: var(--bg-card); border-radius: var(--radius); max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--border); }
        .modal-title { font-weight: 700; font-size: 1.1rem; }
        .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); }
        .input-group { display: flex; flex-direction: column; gap: 4px; }
        .input-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 768px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}
