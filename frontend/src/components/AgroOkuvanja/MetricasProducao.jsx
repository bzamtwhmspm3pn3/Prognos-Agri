// src/components/AgroOkuvanja/MetricasProducao.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Volume2,
  Calendar, Download, Share2, Activity, Award,
  PieChart, BarChart3, LineChart, AlertTriangle,
  Leaf, Bird, Rat, Target, CheckCircle, XCircle
} from 'lucide-react';
import vozService from '../../services/vozService';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444',
  amarelo: '#F59E0B',
  azul: '#3B82F6',
  roxo: '#8B5CF6',
  laranja: '#F97316'
};

export default function MetricasProducao({ deteccoes = [], onAtualizarDashboard }) {
  const [dados, setDados] = useState(null);
  const [periodo, setPeriodo] = useState('mes');
  const [tipoGrafico, setTipoGrafico] = useState('linha');
  const [culturaSelecionada, setCulturaSelecionada] = useState('todas');
  const [carregando, setCarregando] = useState(true);
  const [metricas, setMetricas] = useState({});
  const graficoRef = useRef(null);

  // Calcular métricas reais baseadas nas deteções (igual ao RelatoriosColheita)
  useEffect(() => {
    calcularMetricas();
  }, [deteccoes, periodo]);

  const filtrarPorPeriodo = (deteccoes) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let inicio = new Date(hoje);
    
    switch(periodo) {
      case 'semana':
        inicio.setDate(inicio.getDate() - 7);
        break;
      case 'mes':
        inicio.setMonth(inicio.getMonth() - 1);
        break;
      case 'trimestre':
        inicio.setMonth(inicio.getMonth() - 3);
        break;
      case 'ano':
        inicio.setFullYear(inicio.getFullYear() - 1);
        break;
      default:
        inicio.setMonth(inicio.getMonth() - 1);
    }
    
    return deteccoes.filter(d => {
      const data = new Date(d.dataCaptura || d.timestamp || Date.now());
      return data >= inicio;
    });
  };

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

  const calcularMetricas = () => {
    setCarregando(true);
    
    try {
      console.log('📊 Calculando métricas com deteções:', deteccoes.length);
      
      // Se não há deteções, mostrar dados vazios
      if (!deteccoes || deteccoes.length === 0) {
        setMetricas({
          gerais: {
            totalDeteccoes: 0,
            totalPragas: 0,
            perdaTotal: 0,
            areaTotal: 0,
            mediaPragasPorDeteccao: 0,
            eficienciaDeteccao: 0,
            tendencia: 0
          },
          porTipo: {
            roedores: { quantidade: 0, perda: 0, percentual: 0 },
            aves: { quantidade: 0, perda: 0, percentual: 0 },
            outros: { quantidade: 0, perda: 0, percentual: 0 }
          },
          risco: { alto: 0, medio: 0, baixo: 0 },
          evolucaoTemporal: [],
          porCultura: []
        });
        setCarregando(false);
        return;
      }

      // Filtrar por período (igual ao RelatoriosColheita)
      const deteccoesFiltradas = filtrarPorPeriodo(deteccoes);
      
      console.log(`📊 Período ${periodo}: ${deteccoesFiltradas.length} deteções`);

      // Métricas gerais (igual ao RelatoriosColheita)
      const totalDeteccoes = deteccoesFiltradas.length;
      const totalPragas = deteccoesFiltradas.reduce((acc, d) => acc + (d.total_count || 0), 0);
      
      // Análise por tipo de praga (igual ao RelatoriosColheita)
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

      const outros = deteccoesFiltradas.filter(d => 
        !d.detections?.some(det => {
          const classe = det.class?.toLowerCase() || '';
          const classPt = det.class_pt?.toLowerCase() || '';
          return classe.includes('rat') || classe.includes('mouse') || 
                 classPt.includes('rato') || classPt.includes('ratazana') ||
                 classe.includes('bird') || classe.includes('pigeon') || 
                 classPt.includes('pássaro') || classPt.includes('ave');
        })
      );

      // Perdas estimadas (igual ao RelatoriosColheita)
      const perdaTotal = deteccoesFiltradas.reduce((acc, d) => acc + (d.perdaEstimada || 0), 0);
      const perdaRoedores = roedores.reduce((acc, d) => acc + (d.perdaEstimada || 0), 0);
      const perdaAves = aves.reduce((acc, d) => acc + (d.perdaEstimada || 0), 0);
      const perdaOutros = outros.reduce((acc, d) => acc + (d.perdaEstimada || 0), 0);

      // Área afetada (igual ao RelatoriosColheita)
      const areaTotal = deteccoesFiltradas.reduce((acc, d) => {
        const area = parseFloat(d.areaAfetada) || 0;
        return acc + area;
      }, 0);

      // Níveis de risco (igual ao RelatoriosColheita)
      const riscoAlto = deteccoesFiltradas.filter(d => d.nivelRisco === 'ALTO' || d.nivelRisco === 'CRÍTICO').length;
      const riscoMedio = deteccoesFiltradas.filter(d => d.nivelRisco === 'MÉDIO').length;
      const riscoBaixo = deteccoesFiltradas.filter(d => d.nivelRisco === 'BAIXO').length;

      // Média de pragas por deteção
      const mediaPragasPorDeteccao = totalDeteccoes > 0 ? (totalPragas / totalDeteccoes).toFixed(1) : 0;

      // Eficiência de deteção (baseado em níveis de risco baixo)
      const eficienciaDeteccao = totalDeteccoes > 0 ? Math.round((riscoBaixo / totalDeteccoes) * 100) : 0;

      // Dados para gráfico de evolução temporal (igual ao RelatoriosColheita)
      const porDia = {};
      deteccoesFiltradas.forEach(d => {
        const data = new Date(d.dataCaptura || d.timestamp || Date.now()).toLocaleDateString('pt-PT');
        if (!porDia[data]) {
          porDia[data] = {
            total: 0,
            roedores: 0,
            aves: 0,
            perda: 0
          };
        }
        porDia[data].total += d.total_count || 1;
        porDia[data].perda += d.perdaEstimada || 0;
        
        if (d.detections) {
          d.detections.forEach(det => {
            const classe = det.class?.toLowerCase() || '';
            const classPt = det.class_pt?.toLowerCase() || '';
            if (classe.includes('rat') || classe.includes('mouse') || classPt.includes('rato')) {
              porDia[data].roedores++;
            } else if (classe.includes('bird') || classe.includes('pigeon') || classPt.includes('pássaro')) {
              porDia[data].aves++;
            }
          });
        }
      });

      // Dados para gráfico de distribuição por cultura
      const porCultura = {};
      deteccoesFiltradas.forEach(d => {
        const cultura = d.cultura || 'Não especificada';
        if (!porCultura[cultura]) {
          porCultura[cultura] = {
            deteccoes: 0,
            pragas: 0,
            perda: 0,
            area: 0
          };
        }
        porCultura[cultura].deteccoes++;
        porCultura[cultura].pragas += d.total_count || 1;
        porCultura[cultura].perda += d.perdaEstimada || 0;
        porCultura[cultura].area += parseFloat(d.areaAfetada) || 0;
      });

      // Tendências
      const datas = Object.keys(porDia).sort();
      const valores = datas.map(d => porDia[d].total);
      const tendencia = valores.length >= 2 ? 
        Math.round(((valores[valores.length - 1] - valores[0]) / (valores[0] || 1)) * 100) : 0;

      const metricasCalc = {
        gerais: {
          totalDeteccoes,
          totalPragas,
          perdaTotal,
          areaTotal,
          mediaPragasPorDeteccao,
          eficienciaDeteccao,
          tendencia
        },
        porTipo: {
          roedores: {
            quantidade: roedores.length,
            perda: perdaRoedores,
            percentual: totalDeteccoes > 0 ? Math.round((roedores.length / totalDeteccoes) * 100) : 0
          },
          aves: {
            quantidade: aves.length,
            perda: perdaAves,
            percentual: totalDeteccoes > 0 ? Math.round((aves.length / totalDeteccoes) * 100) : 0
          },
          outros: {
            quantidade: outros.length,
            perda: perdaOutros,
            percentual: totalDeteccoes > 0 ? Math.round((outros.length / totalDeteccoes) * 100) : 0
          }
        },
        risco: {
          alto: riscoAlto,
          medio: riscoMedio,
          baixo: riscoBaixo
        },
        evolucaoTemporal: Object.entries(porDia).map(([data, valores]) => ({
          data,
          ...valores
        })),
        porCultura: Object.entries(porCultura).map(([cultura, valores]) => ({
          cultura,
          ...valores
        })),
        culturas: Object.keys(porCultura)
      };

      console.log('📊 Métricas calculadas:', metricasCalc);
      setMetricas(metricasCalc);
      
      // Gerar dados para exibição (formato compatível com o componente)
      setDados({
        producao: { 
          total: formatarNumero(totalPragas), 
          unidade: 'pragas detectadas', 
          variacao: tendencia,
          detalhe: `${totalDeteccoes} deteções`
        },
        receita: { 
          total: formatarMoeda(perdaTotal), 
          moeda: 'Kz', 
          variacao: -tendencia,
          detalhe: 'perda estimada'
        },
        perdas: { 
          total: formatarNumero(perdaTotal), 
          unidade: 'kg', 
          variacao: tendencia,
          detalhe: 'estimativa de perda'
        },
        eficiencia: eficienciaDeteccao,
        culturas: Object.entries(porCultura).map(([nome, dados]) => ({
          nome,
          area: `${Math.round(dados.area)} ha`,
          producao: `${dados.pragas} pragas`,
          valor: formatarMoeda(dados.perda),
          deteccoes: dados.deteccoes
        })),
        historico: valores.slice(-12),
        meses: datas.slice(-12).map(d => {
          const partes = d.split('/');
          return partes[1] || ''; // Mês
        })
      });

    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
    } finally {
      setCarregando(false);
    }
  };

  const falarMetricas = () => {
    if (!dados) return;
    
    const mensagem = `Métricas de Produção do período ${periodo}. ` +
      `Total de pragas detectadas: ${dados.producao.total}. ` +
      `Perda estimada: ${dados.receita.total}. ` +
      `Eficiência de deteção: ${dados.eficiencia} por cento. ` +
      `Distribuição: ${metricas.porTipo.roedores.percentual}% roedores, ` +
      `${metricas.porTipo.aves.percentual}% aves. ` +
      `Alertas críticos: ${metricas.risco.alto}.`;
    
    vozService.falar(mensagem);
  };

  const exportarMetricas = () => {
    // Criar CSV com métricas detalhadas
    let csv = 'Métrica,Valor\n';
    csv += `Total de Deteções,${metricas.gerais.totalDeteccoes}\n`;
    csv += `Total de Pragas,${metricas.gerais.totalPragas}\n`;
    csv += `Perda Total,${metricas.gerais.perdaTotal}\n`;
    csv += `Área Afetada (ha),${metricas.gerais.areaTotal}\n`;
    csv += `Eficiência,${metricas.gerais.eficienciaDeteccao}%\n`;
    csv += `Tendência,${metricas.gerais.tendencia}%\n\n`;
    
    csv += 'Tipo,Quantidade,Perda,Percentual\n';
    csv += `Roedores,${metricas.porTipo.roedores.quantidade},${metricas.porTipo.roedores.perda},${metricas.porTipo.roedores.percentual}%\n`;
    csv += `Aves,${metricas.porTipo.aves.quantidade},${metricas.porTipo.aves.perda},${metricas.porTipo.aves.percentual}%\n`;
    csv += `Outros,${metricas.porTipo.outros.quantidade},${metricas.porTipo.outros.perda},${metricas.porTipo.outros.percentual}%\n`;

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas_${periodo}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const compartilharMetricas = () => {
    const texto = `📊 Métricas de Produção - AgroOkuvanja\n\n` +
      `Período: ${periodo}\n` +
      `Total de Pragas: ${dados.producao.total}\n` +
      `Perda Estimada: ${dados.receita.total}\n` +
      `Eficiência: ${dados.eficiencia}%\n` +
      `Roedores: ${metricas.porTipo.roedores.percentual}%\n` +
      `Aves: ${metricas.porTipo.aves.percentual}%\n` +
      `Alertas Críticos: ${metricas.risco.alto}\n\n` +
      `Gerado em: ${new Date().toLocaleString('pt-PT')}`;

    if (navigator.share) {
      navigator.share({
        title: 'Métricas de Produção',
        text: texto
      });
    } else {
      navigator.clipboard.writeText(texto);
      alert('Métricas copiadas para área de transferência!');
    }
  };

  // Renderizar gráfico de linha
  const renderGraficoLinha = () => {
    if (!metricas.evolucaoTemporal || metricas.evolucaoTemporal.length === 0) {
      return <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Sem dados para exibir</p>;
    }

    const dadosGrafico = metricas.evolucaoTemporal.slice(-10);
    const maxValor = Math.max(...dadosGrafico.map(d => d.total), 1);
    const alturaMax = 150;

    return (
      <div style={graficoContainerStyle}>
        <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
          {/* Linha do gráfico */}
          <polyline
            points={dadosGrafico.map((d, i) => {
              const x = (i / (dadosGrafico.length - 1)) * 480 + 10;
              const y = 180 - (d.total / maxValor) * 150;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke={cores.verdePimenta}
            strokeWidth="3"
          />
          
          {/* Pontos */}
          {dadosGrafico.map((d, i) => {
            const x = (i / (dadosGrafico.length - 1)) * 480 + 10;
            const y = 180 - (d.total / maxValor) * 150;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill={cores.verdeAlface}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Legendas */}
        <div style={graficoLegendasStyle}>
          {dadosGrafico.map((d, i) => (
            <div key={i} style={legendaItemStyle}>
              <small>{new Date(d.data).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}</small>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar gráfico de barras
  const renderGraficoBarras = () => {
    if (!metricas.evolucaoTemporal || metricas.evolucaoTemporal.length === 0) {
      return <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Sem dados para exibir</p>;
    }

    const dadosGrafico = metricas.evolucaoTemporal.slice(-7);
    const maxValor = Math.max(...dadosGrafico.map(d => d.total), 1);
    const alturaMax = 150;

    return (
      <div style={graficoContainerStyle}>
        <div style={barrasContainerStyle}>
          {dadosGrafico.map((d, i) => {
            const altura = (d.total / maxValor) * alturaMax;
            return (
              <div key={i} style={barraWrapperStyle}>
                <div style={barraItemStyle}>
                  <div style={{
                    height: `${altura}px`,
                    width: '30px',
                    background: `linear-gradient(to top, ${cores.verdeAlface}, ${cores.verdePimenta})`,
                    borderRadius: '5px 5px 0 0'
                  }} />
                </div>
                <small style={barraLabelStyle}>
                  {new Date(d.data).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                </small>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar gráfico de pizza para distribuição por tipo
  const renderGraficoPizza = () => {
    const dados = [
      { label: 'Roedores', valor: metricas.porTipo.roedores.percentual, cor: cores.verdeAlface },
      { label: 'Aves', valor: metricas.porTipo.aves.percentual, cor: cores.azul },
      { label: 'Outros', valor: metricas.porTipo.outros.percentual, cor: cores.amarelo }
    ].filter(d => d.valor > 0);

    if (dados.length === 0) {
      return <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Sem dados para exibir</p>;
    }

    return (
      <div style={pizzaContainerStyle}>
        {dados.map((item, i) => (
          <div key={i} style={pizzaItemStyle}>
            <div style={{
              width: '20px',
              height: '20px',
              background: item.cor,
              borderRadius: '4px'
            }} />
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ fontWeight: 'bold', color: item.cor }}>{item.valor}%</span>
          </div>
        ))}
      </div>
    );
  };

  if (carregando) {
    return (
      <div style={carregandoStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Activity size={40} color={cores.verdePimenta} />
        </motion.div>
        <p>Calculando métricas...</p>
      </div>
    );
  }

  // Se não há dados
  if (!deteccoes || deteccoes.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Activity size={64} color={cores.verdeClaro} />
        <h3 style={{ color: cores.verdeAlface, margin: '20px 0' }}>Nenhum dado disponível</h3>
        <p style={{ color: '#666' }}>Faça deteções de pragas para ver métricas detalhadas.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2rem', color: cores.verdeAlface, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={32} color={cores.verdePimenta} />
            Métricas de Produção
          </h1>
          <p style={{ color: '#666', marginTop: '5px' }}>
            Análise detalhada baseada em {metricas.gerais.totalDeteccoes} deteções
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={selectStyle}
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Último Ano</option>
          </select>
          
          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value)}
            style={selectStyle}
          >
            <option value="linha">Gráfico de Linha</option>
            <option value="barra">Gráfico de Barras</option>
            <option value="pizza">Distribuição</option>
          </select>
          
          <button onClick={exportarMetricas} style={acaoButtonStyle}>
            <Download size={16} /> Exportar
          </button>
          
          <button onClick={compartilharMetricas} style={acaoButtonStyle}>
            <Share2 size={16} /> Partilhar
          </button>
          
          <button onClick={falarMetricas} style={audioButtonStyle}>
            <Volume2 size={16} /> Falar
          </button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div style={statsGridStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={metricCardStyle}
        >
          <div style={metricHeaderStyle}>
            <Activity size={20} color={cores.verdePimenta} />
            <span style={{ color: '#666' }}>Total de Pragas</span>
          </div>
          <div style={metricValueStyle}>{formatarNumero(metricas.gerais.totalPragas)}</div>
          <div style={metricDetailStyle}>
            <span>em {metricas.gerais.totalDeteccoes} deteções</span>
            <span style={{ color: metricas.gerais.tendencia > 0 ? cores.vermelho : cores.verdePimenta }}>
              {metricas.gerais.tendencia > 0 ? '↑' : '↓'} {Math.abs(metricas.gerais.tendencia)}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={metricCardStyle}
        >
          <div style={metricHeaderStyle}>
            <DollarSign size={20} color={cores.amarelo} />
            <span style={{ color: '#666' }}>Perda Estimada</span>
          </div>
          <div style={metricValueStyle}>{formatarMoeda(metricas.gerais.perdaTotal)}</div>
          <div style={metricDetailStyle}>
            <span>{formatarNumero(metricas.gerais.areaTotal)} ha afetados</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={metricCardStyle}
        >
          <div style={metricHeaderStyle}>
            <Target size={20} color={cores.roxo} />
            <span style={{ color: '#666' }}>Eficiência</span>
          </div>
          <div style={metricValueStyle}>{metricas.gerais.eficienciaDeteccao}%</div>
          <div style={metricDetailStyle}>
            <span>média de {metricas.gerais.mediaPragasPorDeteccao} pragas/deteção</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={metricCardStyle}
        >
          <div style={metricHeaderStyle}>
            <AlertTriangle size={20} color={cores.vermelho} />
            <span style={{ color: '#666' }}>Alertas Críticos</span>
          </div>
          <div style={metricValueStyle}>{metricas.risco.alto}</div>
          <div style={metricDetailStyle}>
            <span>{metricas.risco.medio} médios, {metricas.risco.baixo} baixos</span>
          </div>
        </motion.div>
      </div>

      {/* Gráfico principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={graficoPrincipalStyle}
      >
        <div style={graficoHeaderStyle}>
          <h3 style={{ color: cores.verdeAlface }}>📈 Evolução Temporal</h3>
          <div style={graficoLegendaStyle}>
            <span style={{ color: cores.verdePimenta }}>● Pragas</span>
          </div>
        </div>
        
        {tipoGrafico === 'linha' && renderGraficoLinha()}
        {tipoGrafico === 'barra' && renderGraficoBarras()}
        {tipoGrafico === 'pizza' && renderGraficoPizza()}
      </motion.div>

      {/* Distribuição por tipo e nível de risco */}
      <div style={analiseGridStyle}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          style={analiseCardStyle}
        >
          <h3 style={{ color: cores.verdeAlface, marginBottom: '15px' }}>
            <PieChart size={18} /> Distribuição por Tipo
          </h3>
          
          <div style={distribuicaoStyle}>
            <div style={distribuicaoItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Rat size={16} color={cores.verdeAlface} />
                <span>Roedores</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{metricas.porTipo.roedores.quantidade}</span>
              <span style={{ color: cores.verdeAlface }}>({metricas.porTipo.roedores.percentual}%)</span>
            </div>
            
            <div style={progressBarContainerStyle}>
              <div style={{
                ...progressBarStyle,
                width: `${metricas.porTipo.roedores.percentual}%`,
                background: cores.verdeAlface
              }} />
            </div>

            <div style={distribuicaoItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bird size={16} color={cores.azul} />
                <span>Aves</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{metricas.porTipo.aves.quantidade}</span>
              <span style={{ color: cores.azul }}>({metricas.porTipo.aves.percentual}%)</span>
            </div>
            
            <div style={progressBarContainerStyle}>
              <div style={{
                ...progressBarStyle,
                width: `${metricas.porTipo.aves.percentual}%`,
                background: cores.azul
              }} />
            </div>

            <div style={distribuicaoItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={16} color={cores.amarelo} />
                <span>Outros</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{metricas.porTipo.outros.quantidade}</span>
              <span style={{ color: cores.amarelo }}>({metricas.porTipo.outros.percentual}%)</span>
            </div>
            
            <div style={progressBarContainerStyle}>
              <div style={{
                ...progressBarStyle,
                width: `${metricas.porTipo.outros.percentual}%`,
                background: cores.amarelo
              }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          style={analiseCardStyle}
        >
          <h3 style={{ color: cores.verdeAlface, marginBottom: '15px' }}>
            <AlertTriangle size={18} /> Níveis de Risco
          </h3>
          
          <div style={riscoContainerStyle}>
            <div style={riscoItemStyle}>
              <span style={{ color: cores.vermelho }}>● Alto</span>
              <span style={{ fontWeight: 'bold' }}>{metricas.risco.alto}</span>
            </div>
            <div style={progressBarContainerStyle}>
              <div style={{
                ...progressBarStyle,
                width: `${(metricas.risco.alto / (metricas.gerais.totalDeteccoes || 1)) * 100}%`,
                background: cores.vermelho
              }} />
            </div>

            <div style={riscoItemStyle}>
              <span style={{ color: cores.amarelo }}>● Médio</span>
              <span style={{ fontWeight: 'bold' }}>{metricas.risco.medio}</span>
            </div>
            <div style={progressBarContainerStyle}>
              <div style={{
                ...progressBarStyle,
                width: `${(metricas.risco.medio / (metricas.gerais.totalDeteccoes || 1)) * 100}%`,
                background: cores.amarelo
              }} />
            </div>

            <div style={riscoItemStyle}>
              <span style={{ color: cores.verdePimenta }}>● Baixo</span>
              <span style={{ fontWeight: 'bold' }}>{metricas.risco.baixo}</span>
            </div>
            <div style={progressBarContainerStyle}>
              <div style={{
                ...progressBarStyle,
                width: `${(metricas.risco.baixo / (metricas.gerais.totalDeteccoes || 1)) * 100}%`,
                background: cores.verdePimenta
              }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabela de culturas */}
      {metricas.porCultura && metricas.porCultura.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={tabelaStyle}
        >
          <h3 style={{ color: cores.verdeAlface, marginBottom: '15px' }}>
            <Leaf size={18} /> Detalhamento por Cultura
          </h3>
          
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Cultura</th>
                  <th style={thStyle}>Deteções</th>
                  <th style={thStyle}>Pragas</th>
                  <th style={thStyle}>Área Afetada</th>
                  <th style={thStyle}>Perda Estimada</th>
                </tr>
              </thead>
              <tbody>
                {metricas.porCultura.map((cultura, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>
                      <strong>{cultura.cultura}</strong>
                    </td>
                    <td style={tdStyle}>{cultura.deteccoes}</td>
                    <td style={tdStyle}>{cultura.pragas}</td>
                    <td style={tdStyle}>{Math.round(cultura.area)} ha</td>
                    <td style={tdStyle}>
                      <span style={{ color: cores.vermelho, fontWeight: 'bold' }}>
                        {formatarMoeda(cultura.perda)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Insights e recomendações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={insightsStyle}
      >
        <h3 style={{ color: cores.verdeAlface, marginBottom: '15px' }}>
          <Award size={18} /> Insights e Recomendações
        </h3>
        
        <div style={insightsGridStyle}>
          <div style={insightCardStyle}>
            <CheckCircle size={20} color={cores.verdePimenta} />
            <div>
              <strong>Principal ameaça:</strong>{' '}
              {metricas.porTipo.roedores.percentual > metricas.porTipo.aves.percentual ? 'Roedores' : 'Aves'}
              {' '}({Math.max(metricas.porTipo.roedores.percentual, metricas.porTipo.aves.percentual)}%)
            </div>
          </div>
          
          <div style={insightCardStyle}>
            <Target size={20} color={cores.azul} />
            <div>
              <strong>Eficiência de deteção:</strong>{' '}
              {metricas.gerais.eficienciaDeteccao > 70 ? 'Excelente' : 
               metricas.gerais.eficienciaDeteccao > 50 ? 'Boa' : 'Precisa melhorar'}
            </div>
          </div>
          
          <div style={insightCardStyle}>
            <TrendingUp size={20} color={metricas.gerais.tendencia > 0 ? cores.vermelho : cores.verdePimenta} />
            <div>
              <strong>Tendência:</strong>{' '}
              {metricas.gerais.tendencia > 0 ? 'Aumento de pragas' : 'Redução de pragas'}
              {' '}({Math.abs(metricas.gerais.tendencia)}%)
            </div>
          </div>
          
          <div style={insightCardStyle}>
            <AlertTriangle size={20} color={metricas.risco.alto > 5 ? cores.vermelho : cores.amarelo} />
            <div>
              <strong>Alertas críticos:</strong>{' '}
              {metricas.risco.alto} {metricas.risco.alto === 1 ? 'área crítica' : 'áreas críticas'}
            </div>
          </div>
        </div>
      </motion.div>
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
  marginBottom: '25px',
  flexWrap: 'wrap',
  gap: '15px',
  background: 'white',
  padding: '20px',
  borderRadius: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const selectStyle = {
  padding: '8px 15px',
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '8px',
  fontSize: '0.95rem',
  background: 'white',
  cursor: 'pointer'
};

const acaoButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 15px',
  background: 'white',
  color: cores.verdeAlface,
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.95rem'
};

const audioButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 15px',
  background: cores.verdeAlface,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.95rem'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '15px',
  marginBottom: '25px'
};

const metricCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '15px',
  border: `1px solid ${cores.verdeClaro}`,
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};

const metricHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px'
};

const metricValueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: cores.verdeAlface,
  marginBottom: '5px'
};

const metricDetailStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  color: '#666'
};

const graficoPrincipalStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '25px',
  border: `1px solid ${cores.verdeClaro}`
};

const graficoHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const graficoLegendaStyle = {
  display: 'flex',
  gap: '15px',
  fontSize: '0.9rem'
};

const graficoContainerStyle = {
  width: '100%',
  overflow: 'hidden'
};

const graficoLegendasStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '10px',
  padding: '0 10px'
};

const legendaItemStyle = {
  fontSize: '0.8rem',
  color: '#666',
  textAlign: 'center'
};

const barrasContainerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-around',
  height: '180px',
  gap: '10px'
};

const barraWrapperStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const barraItemStyle = {
  height: '150px',
  display: 'flex',
  alignItems: 'flex-end',
  marginBottom: '5px'
};

const barraLabelStyle = {
  fontSize: '0.7rem',
  color: '#666',
  transform: 'rotate(-45deg)',
  whiteSpace: 'nowrap'
};

const pizzaContainerStyle = {
  padding: '20px'
};

const pizzaItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px',
  borderBottom: `1px solid ${cores.verdeClaro}`
};

const analiseGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '15px',
  marginBottom: '25px'
};

const analiseCardStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  border: `1px solid ${cores.verdeClaro}`
};

const distribuicaoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const distribuicaoItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.95rem'
};

const progressBarContainerStyle = {
  height: '8px',
  background: cores.verdeClaro,
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '10px'
};

const progressBarStyle = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s ease'
};

const riscoContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const riscoItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.95rem'
};

const tabelaStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '25px',
  border: `1px solid ${cores.verdeClaro}`
};

const tableWrapperStyle = {
  overflowX: 'auto'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
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

const insightsStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  border: `1px solid ${cores.verdeClaro}`
};

const insightsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '15px'
};

const insightCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '15px',
  background: cores.verdeClaro,
  borderRadius: '10px'
};