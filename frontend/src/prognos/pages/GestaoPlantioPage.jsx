import React, { useState, useEffect, useCallback } from 'react';
import {
  Sprout, Plus, ChevronRight, CheckCircle2, Circle, Clock,
  Sparkles, Loader, AlertCircle, X, ArrowLeft, Send, BookOpen,
  Target, Truck, Tractor, Seedling, Droplets, Wheat, Warehouse,
  Factory, Package, ShoppingBag, HelpCircle
} from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import * as plantioService from '../../services/plantioService';

const ICONES_FASE = {
  planeamento: Target,
  aquisicao_insumos: ShoppingBag,
  logistica_insumos: Truck,
  preparo_solo: Tractor,
  plantio: Seedling,
  manejo_cultura: Droplets,
  colheita: Wheat,
  pos_colheita: Warehouse,
  industrializacao: Factory,
  distribuicao: Package,
  comercializacao: ShoppingBag
};

function getStatusIcon(status) {
  switch (status) {
    case 'concluido': return <CheckCircle2 size={18} color="#4A7C59" />;
    case 'em_andamento': return <Clock size={18} color="#3b82f6" />;
    case 'pulado': return <X size={18} color="#64748b" />;
    default: return <Circle size={18} color="#cbd5e1" />;
  }
}

export default function GestaoPlantioPage() {
  const [plantios, setPlantios] = useState([]);
  const [plantioAtivo, setPlantioAtivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCriar, setShowCriar] = useState(false);
  const [form, setForm] = useState({ nome: '', cultura: '', provincia: '', municipio: '', area: '' });
  const [criando, setCriando] = useState(false);
  const [iaLoading, setIaLoading] = useState(null);
  const [iaResposta, setIaResposta] = useState(null);
  const [observacoes, setObservacoes] = useState('');

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

  const handleCriar = async () => {
    if (!form.nome || !form.cultura) return;
    setCriando(true);
    try {
      const data = await plantioService.criarPlantio(form);
      setPlantios(prev => [data.plantio, ...prev]);
      setPlantioAtivo(data.plantio);
      setShowCriar(false);
      setForm({ nome: '', cultura: '', provincia: '', municipio: '', area: '' });
    } catch (err) {
      console.error('Erro ao criar plantio:', err);
    } finally {
      setCriando(false);
    }
  };

  const handleAtualizarFase = async (codigo, status) => {
    if (!plantioAtivo) return;
    try {
      const data = await plantioService.atualizarFase(plantioAtivo._id, { codigo, status, observacoes });
      setPlantioAtivo(data.plantio);
      setPlantios(prev => prev.map(p => p._id === data.plantio._id ? data.plantio : p));
    } catch (err) {
      console.error('Erro ao atualizar fase:', err);
    }
  };

  const handlePerguntarIA = async (codigoFase) => {
    if (!plantioAtivo) return;
    setIaLoading(codigoFase);
    setIaResposta(null);
    try {
      const data = await plantioService.perguntarIA({
        codigoFase,
        cultura: plantioAtivo.cultura,
        provincia: plantioAtivo.provincia,
        observacoes
      });
      setIaResposta({ codigoFase, ...data });
    } catch (err) {
      console.error('Erro IA:', err);
    } finally {
      setIaLoading(null);
    }
  };

  const progresso = plantioAtivo
    ? Math.round((plantioAtivo.fases.filter(f => f.status === 'concluido' || f.status === 'pulado').length / plantioAtivo.fases.length) * 100)
    : 0;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <Loader size={32} className="spinner" color="var(--secondary)" />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            <Sprout style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Gestão de Plantio
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Planeie e acompanhe todo o ciclo produtivo da sua cultura
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCriar(true)}>
          <Plus size={16} /> Novo Plantio
        </button>
      </div>

      {showCriar && (
        <PrognosCard title="Novo Plantio" icon={<Plus size={18} />} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input className="input" placeholder="Nome (ex: Safra 2026)" value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })} />
            <select className="input" value={form.cultura}
              onChange={e => setForm({ ...form, cultura: e.target.value })}>
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
            <input className="input" placeholder="Província" value={form.provincia}
              onChange={e => setForm({ ...form, provincia: e.target.value })} />
            <input className="input" placeholder="Município" value={form.municipio}
              onChange={e => setForm({ ...form, municipio: e.target.value })} />
            <input className="input" type="number" placeholder="Área (hectares)" value={form.area}
              onChange={e => setForm({ ...form, area: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-ghost" onClick={() => setShowCriar(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriar} disabled={criando || !form.nome || !form.cultura}>
              {criando ? <Loader size={16} className="spinner" /> : <Sprout size={16} />}
              {criando ? 'A criar...' : 'Criar Plantio'}
            </button>
          </div>
        </PrognosCard>
      )}

      {!plantioAtivo && plantios.length === 0 && (
        <PrognosCard>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Sprout size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Nenhum plantio registado</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Crie o seu primeiro plano de cultivo com IA
            </p>
            <button className="btn btn-primary" onClick={() => setShowCriar(true)}>
              <Plus size={16} /> Novo Plantio
            </button>
          </div>
        </PrognosCard>
      )}

      {plantios.length > 0 && !plantioAtivo && (
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
                  background: p.concluido ? 'rgba(74,124,89,0.1)' : 'rgba(59,130,246,0.1)',
                  color: p.concluido ? '#4A7C59' : '#3b82f6'
                }}>
                  {p.concluido ? 'Concluído' : 'Em curso'}
                </div>
              </div>
              <div style={{ marginTop: '12px', height: '6px', background: 'var(--bg-body)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px', transition: 'width 0.5s',
                  width: `${Math.round(p.fases.filter(f => f.status === 'concluido' || f.status === 'pulado').length / p.fases.length * 100)}%`,
                  background: 'linear-gradient(90deg, var(--secondary), var(--primary))'
                }} />
              </div>
            </PrognosCard>
          ))}
        </div>
      )}

      {plantioAtivo && (
        <div>
          <button className="btn btn-ghost" onClick={() => setPlantioAtivo(null)} style={{ marginBottom: '16px' }}>
            <ArrowLeft size={16} /> Voltar
          </button>

          <PrognosCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>{plantioAtivo.nome}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {plantioAtivo.cultura} {plantioAtivo.provincia && `• ${plantioAtivo.provincia}`}
                  {plantioAtivo.municipio && `, ${plantioAtivo.municipio}`}
                  {plantioAtivo.area && ` • ${plantioAtivo.area} ha`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{progresso}%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>concluído</div>
              </div>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px', transition: 'width 0.5s',
                width: `${progresso}%`,
                background: 'linear-gradient(90deg, var(--secondary), var(--primary))'
              }} />
            </div>
          </PrognosCard>

          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            {plantioAtivo.fases.map((fase, idx) => {
              const Icone = ICONES_FASE[fase.codigo] || HelpCircle;
              const isActive = plantioAtivo.faseAtual === idx || fase.status === 'em_andamento';
              const isIaLoading = iaLoading === fase.codigo;
              const mostraIA = iaResposta?.codigoFase === fase.codigo;

              return (
                <PrognosCard key={fase.codigo} style={{
                  borderLeft: `4px solid ${fase.status === 'concluido' ? '#4A7C59' : fase.status === 'em_andamento' ? '#3b82f6' : fase.status === 'pulado' ? '#64748b' : '#e2e8f0'}`
                }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: fase.status === 'concluido' ? 'rgba(74,124,89,0.15)' :
                                  isActive ? 'rgba(59,130,246,0.15)' : 'var(--bg-body)',
                      color: fase.status === 'concluido' ? '#4A7C59' :
                             isActive ? '#3b82f6' : 'var(--text-muted)'
                    }}>
                      <Icone size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fase.nome}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusIcon(fase.status)}
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 600,
                            color: fase.status === 'concluido' ? '#4A7C59' :
                                   fase.status === 'em_andamento' ? '#3b82f6' :
                                   fase.status === 'pulado' ? '#64748b' : '#94a3b8'
                          }}>
                            {fase.status === 'concluido' ? 'Concluído' :
                             fase.status === 'em_andamento' ? 'Em andamento' :
                             fase.status === 'pulado' ? 'Pulado' : 'Pendente'}
                          </span>
                        </div>
                      </div>

                      {fase.observacoes && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
                          "{fase.observacoes}"
                        </div>
                      )}

                      {mostraIA && iaResposta?.recomendacao && (
                        <div style={{
                          padding: '12px', borderRadius: 'var(--radius)', marginTop: '8px', marginBottom: '8px',
                          background: 'rgba(139,92,246,0.08)',
                          border: '1px solid rgba(139,92,246,0.15)',
                          fontSize: '0.85rem', lineHeight: 1.6
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600, color: '#8b5cf6' }}>
                            <Sparkles size={14} /> Recomendação IA
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>{iaResposta.recomendacao}</div>
                          {iaResposta.dicas?.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <strong style={{ fontSize: '0.8rem' }}>Dicas:</strong>
                              <ul style={{ margin: '4px 0 0 16px', fontSize: '0.8rem' }}>
                                {iaResposta.dicas.map((d, i) => <li key={i}>{d}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {fase.status === 'em_andamento' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <textarea className="input" rows={2} placeholder="Observações desta fase..."
                            value={observacoes} onChange={e => setObservacoes(e.target.value)}
                            style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }} />
                          <button className="btn btn-sm btn-secondary" onClick={() => handlePerguntarIA(fase.codigo)}
                            disabled={isIaLoading}>
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
        </div>
      )}

      <style>{`
        .input {
          width: 100%; padding: 10px 12px; border: 1px solid var(--border);
          border-radius: var(--radius); font-size: 0.9rem;
          background: var(--bg-body); color: var(--text-primary);
          font-family: inherit; box-sizing: border-box;
        }
        .input:focus { outline: none; border-color: var(--secondary); }
        select.input { cursor: pointer; }
        textarea.input { font-family: inherit; }
        .btn-sm { padding: 6px 12px !important; font-size: 0.8rem !important; }
      `}</style>
    </div>
  );
}
