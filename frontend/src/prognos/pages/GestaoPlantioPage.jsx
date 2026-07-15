import React, { useState, useEffect, useCallback } from 'react';
import {
  Sprout, Plus, ChevronRight, CheckCircle2, Circle, Clock,
  Sparkles, Loader, AlertCircle, X, ArrowLeft, Send, BookOpen,
  Target, Truck, Droplets, Factory, Package, ShoppingBag, HelpCircle,
  Download, BarChart3, PieChart, TrendingUp, AlertTriangle, Users,
  Calendar, MapPin, DollarSign, Trash2, Edit3, Archive, Ban, FileText, Camera
} from 'lucide-react';
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
            <div style={{ marginTop: '12px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              {(!plantioAtivo.status || plantioAtivo.status === 'ativo') && (
                <>
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
                </>
              )}
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
              <PrognosCard key={p._id} style={{ cursor: 'pointer' }} onClick={() => setPlantioAtivo(p)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{p.nome}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {p.cultura} {p.provincia && `• ${p.provincia}`} {p.area && `• ${p.area} ha`}
                    </div>
                  </div>
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
