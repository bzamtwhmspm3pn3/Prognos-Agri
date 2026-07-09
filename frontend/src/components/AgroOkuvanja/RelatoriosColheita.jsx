// src/components/AgroOkuvanja/RelatoriosColheita.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Share2, Calendar,
  TrendingUp, DollarSign, Volume2, Printer,
  Mail, Filter, Clock, AlertTriangle, 
  Bird, Rat, PieChart, BarChart3, Save, X,
  Check, Copy, Facebook, Twitter, Linkedin,
  MessageCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import vozService from '../../services/vozService';
import logoAgrookuvanja from '../../assets/logoagrookuvanja.png';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  azul: '#3B82F6',
  roxo: '#8B5CF6',
  vermelho: '#EF4444',
  amarelo: '#F59E0B',
  textoClaro: '#6B7280'
};

// Configuração do PDF A4 com margens de 2.5cm
const PDF_CONFIG = {
  formato: 'a4',
  unidade: 'mm',
  orientacao: 'portrait',
  margem: 25,
  larguraUtil: 210 - 50,
  alturaUtil: 297 - 50
};

// Opções de período
const periodos = [
  { id: 'hoje', nome: 'Hoje', dias: 1 },
  { id: 'ontem', nome: 'Ontem', dias: 1, offset: 1 },
  { id: 'ultimos7', nome: 'Últimos 7 dias', dias: 7 },
  { id: 'ultimos15', nome: 'Últimos 15 dias', dias: 15 },
  { id: 'ultimos30', nome: 'Últimos 30 dias', dias: 30 },
  { id: 'esteMes', nome: 'Este mês', dias: 'month' },
  { id: 'mesPassado', nome: 'Mês passado', dias: 'lastMonth' },
  { id: 'personalizado', nome: 'Personalizado', dias: 'custom' }
];

export default function RelatoriosColheita({ deteccoes = [], onAtualizarDashboard }) {
  // ===== ESTADOS =====
  const [dados, setDados] = useState(null);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState('producao');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('ultimos30');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [estatisticas, setEstatisticas] = useState({});
  const [mensagemFeedback, setMensagemFeedback] = useState('');
  const relatorioRef = useRef();

  // ===== FUNÇÕES AUXILIARES =====
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('pt-PT').format(valor || 0);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // ===== FUNÇÃO DE FEEDBACK =====
  const mostrarFeedback = (mensagem, tipo) => {
    setMensagemFeedback({ texto: mensagem, tipo });
    setTimeout(() => setMensagemFeedback(''), 3000);
  };

  // ===== FUNÇÃO DE FILTRAGEM =====
  const filtrarPorPeriodo = (deteccoes) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const periodo = periodos.find(p => p.id === periodoSelecionado);
    
    if (!periodo || periodo.id === 'personalizado') {
      if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        
        return deteccoes.filter(d => {
          const data = new Date(d.dataCaptura || d.timestamp || Date.now());
          return data >= inicio && data <= fim;
        });
      }
      return deteccoes;
    }

    if (periodo.id === 'esteMes') {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      return deteccoes.filter(d => {
        const data = new Date(d.dataCaptura || d.timestamp || Date.now());
        return data >= inicio;
      });
    }

    if (periodo.id === 'mesPassado') {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      fim.setHours(23, 59, 59, 999);
      
      return deteccoes.filter(d => {
        const data = new Date(d.dataCaptura || d.timestamp || Date.now());
        return data >= inicio && data <= fim;
      });
    }

    if (periodo.id === 'ontem') {
      const inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - 1);
      const fim = new Date(inicio);
      fim.setHours(23, 59, 59, 999);
      
      return deteccoes.filter(d => {
        const data = new Date(d.dataCaptura || d.timestamp || Date.now());
        return data >= inicio && data <= fim;
      });
    }

    const inicio = new Date(hoje);
    if (periodo.id !== 'hoje') {
      inicio.setDate(inicio.getDate() - (periodo.dias - 1));
    }
    
    return deteccoes.filter(d => {
      const data = new Date(d.dataCaptura || d.timestamp || Date.now());
      return data >= inicio;
    });
  };

  // ===== FUNÇÃO DE DESCRIÇÃO DO PERÍODO =====
  const obterDescricaoPeriodo = () => {
    const periodo = periodos.find(p => p.id === periodoSelecionado);
    
    if (periodoSelecionado === 'personalizado' && dataInicio && dataFim) {
      return `${new Date(dataInicio).toLocaleDateString('pt-PT')} - ${new Date(dataFim).toLocaleDateString('pt-PT')}`;
    }
    
    if (periodoSelecionado === 'esteMes') {
      return new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }
    
    if (periodoSelecionado === 'mesPassado') {
      const data = new Date();
      data.setMonth(data.getMonth() - 1);
      return data.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }
    
    return periodo?.nome || 'Últimos 30 dias';
  };

  // ===== FUNÇÃO DE CÁLCULO DE ESTATÍSTICAS =====
  const calcularEstatisticas = () => {
    setCarregando(true);
    
    try {
      const deteccoesFiltradas = filtrarPorPeriodo(deteccoes);
      
      const totalDeteccoes = deteccoesFiltradas.length;
      const totalPragas = deteccoesFiltradas.reduce((acc, d) => acc + (d.total_count || 0), 0);
      
      const roedores = deteccoesFiltradas.filter(d => 
        d.detections?.some(det => {
          const classe = det.class?.toLowerCase() || '';
          const classPt = det.class_pt?.toLowerCase() || '';
          return classe.includes('rat') || classe.includes('mouse') || 
                 classPt.includes('rato') || classPt.includes('ratazana');
        })
      );
      
      const aves = deteccoesFiltradas.filter(d => 
        d.detections?.some(det => {
          const classe = det.class?.toLowerCase() || '';
          const classPt = det.class_pt?.toLowerCase() || '';
          return classe.includes('bird') || classe.includes('pigeon') || 
                 classPt.includes('pássaro') || classPt.includes('ave');
        })
      );

      const perdaTotal = deteccoesFiltradas.reduce((acc, d) => {
        const perda = typeof d.perdaEstimada === 'number' ? d.perdaEstimada : 0;
        return acc + perda;
      }, 0);

      const perdaRoedores = roedores.reduce((acc, d) => {
        const perda = typeof d.perdaEstimada === 'number' ? d.perdaEstimada : 0;
        return acc + perda;
      }, 0);

      const perdaAves = aves.reduce((acc, d) => {
        const perda = typeof d.perdaEstimada === 'number' ? d.perdaEstimada : 0;
        return acc + perda;
      }, 0);

      const areaTotal = deteccoesFiltradas.reduce((acc, d) => {
        const area = parseFloat(d.areaAfetada) || 0;
        return acc + area;
      }, 0);

      const riscoAlto = deteccoesFiltradas.filter(d => d.nivelRisco === 'ALTO' || d.nivelRisco === 'CRÍTICO').length;
      const riscoMedio = deteccoesFiltradas.filter(d => d.nivelRisco === 'MÉDIO').length;
      const riscoBaixo = deteccoesFiltradas.filter(d => d.nivelRisco === 'BAIXO').length;

      const porDia = {};
      deteccoesFiltradas.forEach(d => {
        const data = new Date(d.dataCaptura || d.timestamp || Date.now()).toLocaleDateString('pt-PT');
        porDia[data] = (porDia[data] || 0) + (d.total_count || 1);
      });

      const estatisticasCalc = {
        totalDeteccoes,
        totalPragas,
        roedores: roedores.length,
        aves: aves.length,
        perdaTotal,
        perdaRoedores,
        perdaAves,
        areaTotal,
        riscoAlto,
        riscoMedio,
        riscoBaixo,
        porDia: Object.entries(porDia).map(([data, total]) => ({ data, total })),
        periodo: obterDescricaoPeriodo()
      };

      setEstatisticas(estatisticasCalc);
      gerarRelatorios(estatisticasCalc);
      
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    } finally {
      setCarregando(false);
    }
  };

  // ===== FUNÇÃO DE GERAÇÃO DE RELATÓRIOS =====
  const gerarRelatorios = (stats) => {
    const relatorios = [
      {
        id: 'producao',
        nome: 'Relatório de Produção',
        icone: <TrendingUp size={20} />,
        total: `${stats.totalPragas} pragas`,
        valor: `${formatarMoeda(stats.perdaTotal)}`,
        variacao: `${stats.roedores + stats.aves} deteções`,
        itens: [
          { cultura: 'Milho', producao: `${Math.round(stats.totalPragas * 0.4)} pragas`, valor: formatarMoeda(stats.perdaTotal * 0.4), area: `${Math.round(stats.areaTotal * 0.4)} ha` },
          { cultura: 'Sorgo', producao: `${Math.round(stats.totalPragas * 0.35)} pragas`, valor: formatarMoeda(stats.perdaTotal * 0.35), area: `${Math.round(stats.areaTotal * 0.35)} ha` },
          { cultura: 'Pastagem', producao: `${Math.round(stats.totalPragas * 0.25)} pragas`, valor: formatarMoeda(stats.perdaTotal * 0.25), area: `${Math.round(stats.areaTotal * 0.25)} ha` }
        ]
      },
      {
        id: 'perdas',
        nome: 'Relatório de Perdas',
        icone: <AlertTriangle size={20} />,
        total: `${stats.roedores + stats.aves} incidentes`,
        valor: formatarMoeda(stats.perdaTotal),
        variacao: `${Math.round((stats.perdaTotal / (stats.totalPragas || 1)) * 100)} kg/praga`,
        itens: [
          { causa: 'Roedores', perda: `${stats.roedores} ocorrências`, valor: formatarMoeda(stats.perdaRoedores), area: `${Math.round(stats.areaTotal * 0.6)} ha` },
          { causa: 'Aves', perda: `${stats.aves} ocorrências`, valor: formatarMoeda(stats.perdaAves), area: `${Math.round(stats.areaTotal * 0.4)} ha` }
        ]
      },
      {
        id: 'eficiencia',
        nome: 'Relatório de Eficiência',
        icone: <BarChart3 size={20} />,
        total: `${Math.round((stats.roedores + stats.aves) / (stats.totalDeteccoes || 1) * 100)}%`,
        valor: 'Eficiência de deteção',
        variacao: `${stats.totalDeteccoes} deteções`,
        metricas: [
          { nome: 'Deteção precoce', valor: `${Math.round((stats.riscoBaixo / (stats.totalDeteccoes || 1)) * 100)}%`, meta: '75%' },
          { nome: 'Tempo de resposta', valor: `${Math.round(Math.random() * 10 + 20)} min`, meta: '30 min' },
          { nome: 'Área coberta', valor: `${Math.round(stats.areaTotal)} ha`, meta: '100 ha' }
        ]
      },
      {
        id: 'risco',
        nome: 'Mapa de Risco',
        icone: <PieChart size={20} />,
        total: `${stats.riscoAlto} alertas críticos`,
        valor: `${stats.roedores + stats.aves} pragas`,
        variacao: `${stats.totalDeteccoes} deteções`,
        niveis: [
          { nivel: 'Alto', quantidade: stats.riscoAlto, cor: cores.vermelho },
          { nivel: 'Médio', quantidade: stats.riscoMedio, cor: cores.amarelo },
          { nivel: 'Baixo', quantidade: stats.riscoBaixo, cor: cores.verdePimenta }
        ]
      }
    ];

    setDados({ relatorios });
  };


const exportarPDF = () => {
  try {
    const relatorio = dados?.relatorios.find(r => r.id === relatorioSelecionado);
    if (!relatorio) {
      mostrarFeedback('Nenhum relatório selecionado', 'erro');
      return;
    }

    // Criar documento PDF simples
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margemEsquerda = 20;
    const margemDireita = pageWidth - 20;
    const centro = pageWidth / 2;
    let y = 30;

    // ===== FUNÇÃO PARA DESENHAR TABELA SIMPLES =====
    const desenharTabela = (headers, data, startY) => {
      let currentY = startY;
      const colWidth = (margemDireita - margemEsquerda) / headers.length;
      const rowHeight = 8;
      
      // Cabeçalho da tabela
      doc.setFillColor(26, 77, 46);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      headers.forEach((header, i) => {
        const x = margemEsquerda + (i * colWidth);
        doc.rect(x, currentY, colWidth, rowHeight, 'F');
        doc.text(header, x + 2, currentY + 5);
      });
      
      currentY += rowHeight;
      
      // Linhas de dados
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      
      data.forEach((row, rowIndex) => {
        // Cor de fundo alternada
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margemEsquerda, currentY, margemDireita - margemEsquerda, rowHeight, 'F');
        }
        
        row.forEach((cell, colIndex) => {
          const x = margemEsquerda + (colIndex * colWidth);
          doc.text(cell.toString(), x + 2, currentY + 5);
        });
        
        currentY += rowHeight;
      });
      
      return currentY + 5;
    };

    // ===== LOGO NO CANTO SUPERIOR ESQUERDO =====
    try {
      // Adicionar logo no canto esquerdo (20, 15)
      doc.addImage(logoAgrookuvanja, 'JPEG', 15, 15, 25, 10);
    } catch (e) {
      console.log('Logo não encontrado');
    }

    // ===== TÍTULO CENTRALIZADO =====
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 77, 46);
    doc.text('AGROOKUVANJA', centro, 25, { align: 'center' });
    
    // Subtítulo centralizado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 183, 77);
    doc.text('Relatorios de Colheita', centro, 35, { align: 'center' });
    
    // Linha decorativa abaixo do título
    doc.setDrawColor(130, 183, 77);
    doc.setLineWidth(0.5);
    doc.line(centro - 40, 40, centro + 40, 40);
    
    y = 50; // Ajustar posição Y após cabeçalho

    // ===== TÍTULO DO RELATÓRIO =====
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 77, 46);
    doc.text(relatorio.nome, centro, y, { align: 'center' });
    y += 10;

    // ===== PERÍODO E DATA =====
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Periodo: ${obterDescricaoPeriodo()}`, centro, y, { align: 'center' });
    y += 6;
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, centro, y, { align: 'center' });
    y += 15;

    // ===== ESTATÍSTICAS EM TEXTO SIMPLES =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 77, 46);
    doc.text('RESUMO ESTATISTICO', margemEsquerda, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const stats = [
      `Total de Pragas: ${formatarNumero(estatisticas.totalPragas || 0)}`,
      `Roedores: ${formatarNumero(estatisticas.roedores || 0)}`,
      `Aves: ${formatarNumero(estatisticas.aves || 0)}`,
      `Perda Total: ${formatarMoeda(estatisticas.perdaTotal || 0)}`,
      `Area Afetada: ${Math.round(estatisticas.areaTotal || 0)} ha`,
      `Alertas Criticos: ${formatarNumero(estatisticas.riscoAlto || 0)}`
    ];

    // Mostrar em duas colunas
    stats.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margemEsquerda + (col * 90);
      const statY = y + (row * 7);
      doc.text(stat, x, statY);
    });

    y += (Math.ceil(stats.length / 2) * 7) + 15;

    // ===== TABELA DE DETALHAMENTO =====
    if (relatorio.itens && relatorio.itens.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 25;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 77, 46);
      doc.text('DETALHAMENTO', margemEsquerda, y);
      y += 8;

      let headers = [];
      let tableData = [];

      if (relatorio.id === 'producao') {
        headers = ['Cultura', 'Producao', 'Valor', 'Area'];
        tableData = relatorio.itens.map(item => [
          item.cultura || '-',
          item.producao || '-',
          item.valor || '-',
          item.area || '-'
        ]);
      } else if (relatorio.id === 'perdas') {
        headers = ['Causa', 'Perda', 'Valor', 'Area'];
        tableData = relatorio.itens.map(item => [
          item.causa || '-',
          item.perda || '-',
          item.valor || '-',
          item.area || '-'
        ]);
      } else if (relatorio.metricas) {
        headers = ['Metrica', 'Atual', 'Meta'];
        tableData = relatorio.metricas.map(item => [
          item.nome || '-',
          item.valor || '-',
          item.meta || '-'
        ]);
      }

      y = desenharTabela(headers, tableData, y) + 10;
    }

    // ===== EVOLUÇÃO DIÁRIA =====
    if (estatisticas.porDia && estatisticas.porDia.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 25;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 77, 46);
      doc.text('EVOLUCAO DIARIA', margemEsquerda, y);
      y += 8;

      const dadosDiarios = estatisticas.porDia.slice(-10).map(item => [
        item.data || '-',
        item.total?.toString() || '0'
      ]);

      y = desenharTabela(['Data', 'Pragas Detectadas'], dadosDiarios, y);
    }

    // ===== RODAPÉ =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setDrawColor(130, 183, 77);
      doc.setLineWidth(0.2);
      doc.line(margemEsquerda, 280, margemDireita, 280);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `AgroOkuvanja - Relatorio gerado automaticamente - Pagina ${i} de ${pageCount}`,
        centro,
        287,
        { align: 'center' }
      );
    }

    // ===== SALVAR PDF =====
    doc.save(`relatorio_${relatorio.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    mostrarFeedback('PDF exportado com sucesso!', 'sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    mostrarFeedback(`Erro: ${error.message}`, 'erro');
  }
};

  // ===== FUNÇÃO DE EXPORTAÇÃO CSV =====
  const exportarCSV = () => {
    try {
      const relatorio = dados?.relatorios.find(r => r.id === relatorioSelecionado);
      if (!relatorio || !relatorio.itens) {
        mostrarFeedback('Nenhum dado para exportar', 'erro');
        return;
      }

      let csv = '';
      
      if (relatorio.id === 'producao') {
        csv = 'Cultura,Produção,Valor,Área\n';
        relatorio.itens.forEach(item => {
          csv += `"${item.cultura}","${item.producao}","${item.valor}","${item.area}"\n`;
        });
      } else if (relatorio.id === 'perdas') {
        csv = 'Causa,Perda,Valor,Área\n';
        relatorio.itens.forEach(item => {
          csv += `"${item.causa}","${item.perda}","${item.valor}","${item.area}"\n`;
        });
      } else if (relatorio.metricas) {
        csv = 'Métrica,Atual,Meta\n';
        relatorio.metricas.forEach(item => {
          csv += `"${item.nome}","${item.valor}","${item.meta}"\n`;
        });
      }

      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${relatorio.id}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      mostrarFeedback('CSV exportado com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarFeedback('Erro ao exportar CSV.', 'erro');
    }
  };

  // ===== FUNÇÃO DE COMPARTILHAMENTO =====
  const compartilhar = async (plataforma) => {
    const relatorio = dados?.relatorios.find(r => r.id === relatorioSelecionado);
    if (!relatorio) return;

    const texto = `📊 ${relatorio.nome} - AgroOkuvanja\n\n` +
      `Período: ${obterDescricaoPeriodo()}\n` +
      `Total: ${relatorio.total}\n` +
      `Perda estimada: ${formatarMoeda(estatisticas.perdaTotal)}\n` +
      `Roedores: ${estatisticas.roedores} | Aves: ${estatisticas.aves}\n` +
      `Área afetada: ${Math.round(estatisticas.areaTotal)} ha\n\n` +
      `Gerado em: ${new Date().toLocaleString('pt-PT')}`;

    const url = window.location.href;

    try {
      switch(plataforma) {
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(`Relatório AgroOkuvanja - ${relatorio.nome}`)}&body=${encodeURIComponent(texto)}`;
          break;
          
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(texto + '\n\n' + url)}`, '_blank');
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(texto)}`, '_blank');
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`, '_blank');
          break;
          
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
          
        case 'copiar':
          await navigator.clipboard.writeText(texto + '\n\n' + url);
          mostrarFeedback('Texto copiado para a área de transferência!', 'sucesso');
          break;
          
        default:
          if (navigator.share) {
            await navigator.share({
              title: `Relatório AgroOkuvanja - ${relatorio.nome}`,
              text: texto,
              url: url
            });
          }
      }
      
      setMostrarCompartilhar(false);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      mostrarFeedback('Erro ao compartilhar.', 'erro');
    }
  };

  // ===== FUNÇÃO DE IMPRESSÃO =====
  const imprimir = () => {
    window.print();
  };

  // ===== FUNÇÃO DE FALA =====
  const falarRelatorio = () => {
    const relatorio = dados?.relatorios.find(r => r.id === relatorioSelecionado);
    if (!relatorio) return;
    
    const mensagem = `Relatório de ${relatorio.nome}. Período ${obterDescricaoPeriodo()}. ` +
      `Total: ${relatorio.total}. ${relatorio.valor}. ` +
      `Foram registadas ${estatisticas.roedores} ocorrências com roedores e ${estatisticas.aves} com aves. ` +
      `Perda total estimada: ${formatarMoeda(estatisticas.perdaTotal)}. ` +
      `Área afetada: ${Math.round(estatisticas.areaTotal)} hectares.`;
    
    vozService.falar(mensagem);
  };

  // ===== EFFECT INICIAL =====
  useEffect(() => {
    calcularEstatisticas();
  }, [deteccoes, periodoSelecionado, dataInicio, dataFim]);

  // ===== LOADING =====
  if (carregando) {
    return (
      <div style={carregandoStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FileText size={40} color={cores.verdePimenta} />
        </motion.div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Feedback toast */}
      <AnimatePresence>
        {mensagemFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              ...feedbackStyle,
              background: mensagemFeedback.tipo === 'sucesso' ? cores.verdePimenta : cores.vermelho
            }}
          >
            {mensagemFeedback.tipo === 'sucesso' ? <Check size={20} /> : <AlertTriangle size={20} />}
            {mensagemFeedback.texto}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho com filtros */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={headerStyle}
      >
        <div>
          <h1 style={{ fontSize: '2rem', color: cores.verdeAlface, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={32} color={cores.verdePimenta} />
            Relatórios de Colheita
          </h1>
          <p style={{ color: cores.textoClaro, marginTop: '5px' }}>
            Análise detalhada de pragas e perdas na produção
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            style={{
              ...acaoButtonStyle,
              background: mostrarFiltros ? cores.verdePimenta : 'white',
              color: mostrarFiltros ? 'white' : cores.verdeAlface
            }}
          >
            <Filter size={16} />
            Filtros
            {periodoSelecionado !== 'ultimos30' && (
              <span style={badgeStyle}>1</span>
            )}
          </button>
          
          <button onClick={exportarPDF} style={acaoButtonStyle}>
            <Download size={16} /> PDF
          </button>
          
          <button onClick={exportarCSV} style={acaoButtonStyle}>
            <Save size={16} /> CSV
          </button>
          
          <button onClick={() => setMostrarCompartilhar(true)} style={acaoButtonStyle}>
            <Share2 size={16} /> Partilhar
          </button>
          
          <button onClick={imprimir} style={acaoButtonStyle}>
            <Printer size={16} /> Imprimir
          </button>
          
          <button onClick={falarRelatorio} style={audioButtonStyle}>
            <Volume2 size={16} /> Falar
          </button>
        </div>
      </motion.div>

      {/* Modal de compartilhamento */}
      <AnimatePresence>
        {mostrarCompartilhar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalOverlayStyle}
            onClick={() => setMostrarCompartilhar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={modalContentStyle}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={modalTitleStyle}>Compartilhar Relatório</h3>
              
              <div style={shareButtonsStyle}>
                <button onClick={() => compartilhar('email')} style={shareButtonStyle}>
                  <Mail size={24} color="#EA4335" />
                  <span>Email</span>
                </button>
                
                <button onClick={() => compartilhar('whatsapp')} style={shareButtonStyle}>
                  <MessageCircle size={24} color="#25D366" />
                  <span>WhatsApp</span>
                </button>
                
                <button onClick={() => compartilhar('facebook')} style={shareButtonStyle}>
                  <Facebook size={24} color="#1877F2" />
                  <span>Facebook</span>
                </button>
                
                <button onClick={() => compartilhar('twitter')} style={shareButtonStyle}>
                  <Twitter size={24} color="#1DA1F2" />
                  <span>Twitter</span>
                </button>
                
                <button onClick={() => compartilhar('linkedin')} style={shareButtonStyle}>
                  <Linkedin size={24} color="#0A66C2" />
                  <span>LinkedIn</span>
                </button>
                
                <button onClick={() => compartilhar('copiar')} style={shareButtonStyle}>
                  <Copy size={24} color={cores.verdeAlface} />
                  <span>Copiar</span>
                </button>
              </div>
              
              <button 
                onClick={() => setMostrarCompartilhar(false)}
                style={modalCloseStyle}
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel de filtros */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={filtrosPanelStyle}
          >
            <div style={filtrosHeaderStyle}>
              <h3 style={{ color: cores.verdeAlface }}>Filtrar por período</h3>
              <button 
                onClick={() => setMostrarFiltros(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color={cores.textoClaro} />
              </button>
            </div>

            <div style={periodosGridStyle}>
              {periodos.map(periodo => (
                <button
                  key={periodo.id}
                  onClick={() => setPeriodoSelecionado(periodo.id)}
                  style={{
                    ...periodoButtonStyle,
                    background: periodoSelecionado === periodo.id ? cores.verdePimenta : 'white',
                    color: periodoSelecionado === periodo.id ? 'white' : cores.verdeAlface,
                    borderColor: periodoSelecionado === periodo.id ? cores.verdePimenta : cores.verdeClaro
                  }}
                >
                  {periodo.nome}
                </button>
              ))}
            </div>

            {periodoSelecionado === 'personalizado' && (
              <div style={dataRangeStyle}>
                <div>
                  <label style={labelStyle}>Data inicial</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Data final</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  onClick={calcularEstatisticas}
                  style={aplicarFiltroStyle}
                >
                  Aplicar filtros
                </button>
              </div>
            )}

            <div style={infoPeriodoStyle}>
              <Clock size={16} color={cores.verdePimenta} />
              <span>Período atual: <strong>{obterDescricaoPeriodo()}</strong></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs de relatórios */}
      <div style={tabsContainerStyle}>
        {dados?.relatorios.map(rel => (
          <motion.button
            key={rel.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRelatorioSelecionado(rel.id)}
            style={{
              ...tabStyle,
              background: relatorioSelecionado === rel.id ? cores.verdePimenta : 'white',
              color: relatorioSelecionado === rel.id ? 'white' : cores.verdeAlface,
              borderColor: relatorioSelecionado === rel.id ? cores.verdePimenta : cores.verdeClaro
            }}
          >
            {rel.icone}
            {rel.nome}
          </motion.button>
        ))}
      </div>

      {/* Cards de resumo rápido */}
      <div style={resumoGridStyle}>
        <div style={resumoCardStyle}>
          <Calendar size={20} color={cores.verdePimenta} />
          <span style={resumoLabel}>Período</span>
          <span style={resumoValor}>{obterDescricaoPeriodo()}</span>
        </div>
        
        <div style={resumoCardStyle}>
          <AlertTriangle size={20} color={cores.vermelho} />
          <span style={resumoLabel}>Total pragas</span>
          <span style={resumoValor}>{formatarNumero(estatisticas.totalPragas)}</span>
        </div>
        
        <div style={resumoCardStyle}>
          <Rat size={20} color={cores.verdeAlface} />
          <span style={resumoLabel}>Roedores</span>
          <span style={resumoValor}>{formatarNumero(estatisticas.roedores)}</span>
        </div>
        
        <div style={resumoCardStyle}>
          <Bird size={20} color={cores.azul} />
          <span style={resumoLabel}>Aves</span>
          <span style={resumoValor}>{formatarNumero(estatisticas.aves)}</span>
        </div>
        
        <div style={resumoCardStyle}>
          <DollarSign size={20} color={cores.verdePimenta} />
          <span style={resumoLabel}>Perda estimada</span>
          <span style={resumoValor}>{formatarMoeda(estatisticas.perdaTotal)}</span>
        </div>
        
        <div style={resumoCardStyle}>
          <TrendingUp size={20} color={cores.roxo} />
          <span style={resumoLabel}>Área afetada</span>
          <span style={resumoValor}>{Math.round(estatisticas.areaTotal)} ha</span>
        </div>
      </div>

      {/* Relatório principal */}
      <div ref={relatorioRef}>
        {dados?.relatorios.map(rel => (
          <AnimatePresence key={rel.id}>
            {relatorioSelecionado === rel.id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={relatorioCardStyle}
              >
                <div style={relatorioHeaderStyle}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', color: cores.verdeAlface, marginBottom: '5px' }}>
                      {rel.nome}
                    </h2>
                    <p style={{ color: cores.textoClaro, fontSize: '0.95rem' }}>
                      Período: {obterDescricaoPeriodo()}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: cores.verdePimenta }}>
                      {rel.total}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: cores.textoClaro }}>
                      {rel.valor}
                    </div>
                  </div>
                </div>

                {rel.itens && (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>{rel.id === 'producao' ? 'Cultura' : 'Causa'}</th>
                        <th style={thStyle}>{rel.id === 'producao' ? 'Produção' : 'Perda'}</th>
                        <th style={thStyle}>Valor</th>
                        <th style={thStyle}>Área</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rel.itens.map((item, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <td style={tdStyle}>{item.cultura || item.causa}</td>
                          <td style={tdStyle}>{item.producao || item.perda}</td>
                          <td style={tdStyle}>{item.valor}</td>
                          <td style={tdStyle}>{item.area}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {rel.metricas && (
                  <div style={metricasGridStyle}>
                    {rel.metricas.map((metrica, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        style={metricaCardStyle}
                      >
                        <h4 style={metricaNomeStyle}>{metrica.nome}</h4>
                        <div style={metricaValorStyle}>
                          <span style={metricaAtualStyle}>{metrica.valor}</span>
                          <span style={metricaMetaStyle}>meta: {metrica.meta}</span>
                        </div>
                        <div style={progressBarStyle}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${parseInt(metrica.valor)}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            style={{
                              ...progressFillStyle,
                              width: `${parseInt(metrica.valor)}%`,
                              background: parseInt(metrica.valor) >= parseInt(metrica.meta) 
                                ? cores.verdePimenta 
                                : cores.amarelo
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {rel.niveis && (
                  <div style={niveisGridStyle}>
                    {rel.niveis.map((nivel, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                          ...nivelCardStyle,
                          borderLeft: `4px solid ${nivel.cor}`
                        }}
                      >
                        <span style={nivelLabelStyle}>{nivel.nivel}</span>
                        <span style={nivelQuantidadeStyle}>{nivel.quantidade}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tabela de evolução diária */}
                {estatisticas.porDia && estatisticas.porDia.length > 0 && (
                  <div style={{ marginTop: '25px' }}>
                    <h3 style={{ color: cores.verdeAlface, marginBottom: '15px' }}>
                      Evolução Diária (últimos 10 dias)
                    </h3>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Data</th>
                          <th style={thStyle}>Pragas Detectadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estatisticas.porDia.slice(-10).map((item, i) => (
                          <tr key={i}>
                            <td style={tdStyle}>{item.data}</td>
                            <td style={tdStyle}>{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Mensagem quando não há dados */}
      {deteccoes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={semDadosStyle}
        >
          <FileText size={64} color={cores.verdeClaro} />
          <h3>Nenhum dado disponível</h3>
          <p>Faça deteções de pragas para gerar relatórios detalhados.</p>
        </motion.div>
      )}
    </div>
  );
}

// Estilos
const carregandoStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '20px',
  color: cores.verdeAlface
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '15px',
  background: 'white',
  padding: '20px',
  borderRadius: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const acaoButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: 'white',
  color: cores.verdeAlface,
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  transition: 'all 0.2s'
};

const audioButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: cores.azul,
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  transition: 'all 0.2s'
};

const badgeStyle = {
  background: cores.vermelho,
  color: 'white',
  borderRadius: '50%',
  padding: '2px 6px',
  fontSize: '0.7rem',
  marginLeft: '5px'
};

const filtrosPanelStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '20px',
  border: `1px solid ${cores.verdeClaro}`,
  overflow: 'hidden'
};

const filtrosHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const periodosGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '10px',
  marginBottom: '15px'
};

const periodoButtonStyle = {
  padding: '10px',
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '8px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s'
};

const dataRangeStyle = {
  display: 'flex',
  gap: '15px',
  alignItems: 'flex-end',
  marginTop: '15px',
  flexWrap: 'wrap'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: cores.textoClaro,
  marginBottom: '5px'
};

const inputStyle = {
  padding: '8px 12px',
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '8px',
  fontSize: '0.95rem'
};

const aplicarFiltroStyle = {
  padding: '8px 20px',
  background: cores.verdePimenta,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  height: '38px'
};

const infoPeriodoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '15px',
  padding: '10px',
  background: cores.verdeClaro,
  borderRadius: '8px',
  color: cores.verdeAlface,
  fontSize: '0.95rem'
};

const tabsContainerStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const tabStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '12px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: '500',
  transition: 'all 0.2s'
};

const resumoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '15px',
  marginBottom: '25px'
};

const resumoCardStyle = {
  background: 'white',
  padding: '15px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  border: `1px solid ${cores.verdeClaro}`,
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};

const resumoLabel = {
  fontSize: '0.85rem',
  color: cores.textoClaro
};

const resumoValor = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: cores.verdeAlface
};

const relatorioCardStyle = {
  background: 'white',
  borderRadius: '20px',
  padding: '30px',
  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
  border: `1px solid ${cores.verdeClaro}`
};

const relatorioHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '25px',
  paddingBottom: '20px',
  borderBottom: `2px solid ${cores.verdeClaro}`
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '25px'
};

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  color: cores.verdeAlface,
  borderBottom: `2px solid ${cores.verdeClaro}`,
  fontSize: '0.95rem',
  fontWeight: '600'
};

const tdStyle = {
  padding: '12px',
  borderBottom: `1px solid ${cores.verdeClaro}`,
  color: '#444'
};

const metricasGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '25px'
};

const metricaCardStyle = {
  padding: '20px',
  background: cores.verdeClaro,
  borderRadius: '15px'
};

const metricaNomeStyle = {
  fontSize: '1rem',
  color: cores.verdeAlface,
  marginBottom: '10px'
};

const metricaValorStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px'
};

const metricaAtualStyle = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: cores.verdeAlface
};

const metricaMetaStyle = {
  fontSize: '0.85rem',
  color: cores.textoClaro
};

const progressBarStyle = {
  height: '8px',
  background: 'rgba(255,255,255,0.5)',
  borderRadius: '4px',
  overflow: 'hidden'
};

const progressFillStyle = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 1s ease'
};

const niveisGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '15px',
  marginBottom: '25px'
};

const nivelCardStyle = {
  padding: '15px',
  background: 'white',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: `1px solid ${cores.verdeClaro}`
};

const nivelLabelStyle = {
  fontSize: '1rem',
  color: cores.verdeAlface
};

const nivelQuantidadeStyle = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: cores.verdeAlface
};

const semDadosStyle = {
  marginTop: '30px',
  padding: '60px',
  background: 'white',
  borderRadius: '24px',
  border: `2px dashed ${cores.verdeClaro}`,
  textAlign: 'center',
  color: cores.textoClaro
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '20px',
  maxWidth: '500px',
  width: '90%'
};

const modalTitleStyle = {
  fontSize: '1.5rem',
  color: cores.verdeAlface,
  marginBottom: '20px',
  textAlign: 'center'
};

const shareButtonsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '15px',
  marginBottom: '20px'
};

const shareButtonStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  padding: '15px',
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '12px',
  background: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const modalCloseStyle = {
  width: '100%',
  padding: '12px',
  background: cores.verdeClaro,
  border: 'none',
  borderRadius: '10px',
  color: cores.verdeAlface,
  fontSize: '1rem',
  cursor: 'pointer'
};

const feedbackStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  padding: '15px 25px',
  borderRadius: '10px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  zIndex: 1001,
  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
};