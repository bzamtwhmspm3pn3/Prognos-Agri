import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Globe, Shield, Camera, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { usePrognos } from '../contexts/PrognosContext';
import { getUserProfile, updateUserProfile } from '../../services/auth';

const provinciasAngola = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

export default function Profile() {
  const { user, setUser } = usePrognos();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', tipo: 'individual',
    nomeOrganizacao: '', identificacao: '', tipoIdentificacao: 'BI',
    dataNascimento: '', endereco: { provincia: '', municipio: '', bairro: '' },
    dadosAdicionais: { areaAtuacao: '', cargo: '', website: '' },
    configuracoes: { notificacoes: true, tema: 'auto', idioma: 'pt' }
  });

  const carregarPerfil = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getUserProfile(user.id);
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setForm({
          nome: p.nome || user.username || '',
          email: p.email || user.email || '',
          telefone: p.telefone || '',
          tipo: p.tipo || 'individual',
          nomeOrganizacao: p.nomeOrganizacao || '',
          identificacao: p.identificacao || '',
          tipoIdentificacao: p.tipoIdentificacao || 'BI',
          dataNascimento: p.dataNascimento ? p.dataNascimento.split('T')[0] : '',
          endereco: {
            provincia: p.endereco?.provincia || '',
            municipio: p.endereco?.municipio || '',
            bairro: p.endereco?.bairro || ''
          },
          dadosAdicionais: {
            areaAtuacao: p.dadosAdicionais?.areaAtuacao || '',
            cargo: p.dadosAdicionais?.cargo || '',
            website: p.dadosAdicionais?.website || ''
          },
          configuracoes: {
            notificacoes: p.configuracoes?.notificacoes !== false,
            tema: p.configuracoes?.tema || 'auto',
            idioma: p.configuracoes?.idioma || 'pt'
          }
        });
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { carregarPerfil(); }, [carregarPerfil]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (obj, field, value) => {
    setForm(prev => ({ ...prev, [obj]: { ...prev[obj], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await updateUserProfile(user.id, {
        nome: form.nome,
        telefone: form.telefone,
        tipo: form.tipo,
        nomeOrganizacao: form.nomeOrganizacao,
        identificacao: form.identificacao,
        tipoIdentificacao: form.tipoIdentificacao,
        dataNascimento: form.dataNascimento || undefined,
        endereco: form.endereco,
        dadosAdicionais: form.dadosAdicionais,
        configuracoes: form.configuracoes
      });
      if (res.success) {
        setProfile(res.data);
        setMessage({ type: 'success', text: 'Perfil actualizado com sucesso!' });
        setUser(prev => ({ ...prev, username: form.nome }));
        localStorage.setItem('prognos_user', JSON.stringify({ ...user, username: form.nome }));
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Loader className="spinner" /></div>;
  }

  const stats = [
    { label: 'Total de Scans', value: String(profile?.execucoesUsadas || 0) },
    { label: 'Pragas Detectadas', value: String(profile?.user?.estatisticas?.pragasDetectadas || 0) },
    { label: 'Scans Restantes', value: String(Math.max(0, (profile?.limiteExecucoes || 50) - (profile?.execucoesUsadas || 0))) },
    { label: 'Membro desde', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-PT') : new Date().toLocaleDateString('pt-PT') },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          👤 Meu Perfil
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Gerir as suas informações pessoais e configurações
        </p>
      </div>

      {message && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: 'var(--radius)',
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: message.type === 'success' ? '#16a34a' : '#ef4444',
          marginBottom: '16px', fontSize: '0.9rem'
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
        <PrognosCard title="Informações Pessoais" icon={<User size={18} />}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.5rem', fontWeight: 'bold',
                position: 'relative', flexShrink: 0
              }}>
                {form.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{form.nome || 'Utilizador'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {user?.role === 'admin' ? 'Administrador' : 'Agricultor'}
                </p>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Nome Completo</label>
                <input type="text" className="input" value={form.nome}
                  onChange={e => handleChange('nome', e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input" value={form.email} disabled
                  style={{ opacity: 0.7 }} />
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Telefone</label>
                <input type="tel" className="input" placeholder="+244 900 000 000"
                  value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Tipo de Conta</label>
                <select className="input" value={form.tipo}
                  onChange={e => handleChange('tipo', e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="organizacao">Organização</option>
                </select>
              </div>
            </div>

            {form.tipo === 'organizacao' && (
              <div className="input-group">
                <label className="input-label">Nome da Organização</label>
                <input type="text" className="input" value={form.nomeOrganizacao}
                  onChange={e => handleChange('nomeOrganizacao', e.target.value)} />
              </div>
            )}

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Identificação</label>
                <input type="text" className="input" placeholder="BI/NIF/Passaporte"
                  value={form.identificacao} onChange={e => handleChange('identificacao', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input" value={form.tipoIdentificacao}
                  onChange={e => handleChange('tipoIdentificacao', e.target.value)}>
                  <option value="BI">BI</option>
                  <option value="NIF">NIF</option>
                  <option value="PASSAPORTE">Passaporte</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Data de Nascimento</label>
              <input type="date" className="input" value={form.dataNascimento}
                onChange={e => handleChange('dataNascimento', e.target.value)} />
            </div>

            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '8px' }}>📍 Endereço</h4>
            <div className="grid-3">
              <div className="input-group">
                <label className="input-label">Província</label>
                <select className="input" value={form.endereco.provincia}
                  onChange={e => handleNestedChange('endereco', 'provincia', e.target.value)}>
                  <option value="">Seleccionar</option>
                  {provinciasAngola.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Município</label>
                <input type="text" className="input" value={form.endereco.municipio}
                  onChange={e => handleNestedChange('endereco', 'municipio', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Bairro</label>
                <input type="text" className="input" value={form.endereco.bairro}
                  onChange={e => handleNestedChange('endereco', 'bairro', e.target.value)} />
              </div>
            </div>

            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '8px' }}>💼 Profissional</h4>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Área de Actuação</label>
                <input type="text" className="input" placeholder="Ex: Agricultura, Pecuária"
                  value={form.dadosAdicionais.areaAtuacao}
                  onChange={e => handleNestedChange('dadosAdicionais', 'areaAtuacao', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Cargo</label>
                <input type="text" className="input" placeholder="Ex: Agricultor, Técnico"
                  value={form.dadosAdicionais.cargo}
                  onChange={e => handleNestedChange('dadosAdicionais', 'cargo', e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              {saving ? <Loader size={16} className="spinner" style={{ margin: 0, width: 16, height: 16 }} /> : <Save size={16} />}
              {saving ? 'A salvar...' : 'Salvar Alterações'}
            </button>
          </form>
        </PrognosCard>

        <div>
          <PrognosCard title="Configurações" icon={<Shield size={18} />}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Idioma</label>
                <select className="input" value={form.configuracoes.idioma}
                  onChange={e => handleNestedChange('configuracoes', 'idioma', e.target.value)}>
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tema</label>
                <select className="input" value={form.configuracoes.tema}
                  onChange={e => handleNestedChange('configuracoes', 'tema', e.target.value)}>
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="notificacoes"
                  checked={form.configuracoes.notificacoes}
                  onChange={e => handleNestedChange('configuracoes', 'notificacoes', e.target.checked)} />
                <label htmlFor="notificacoes" style={{ fontSize: '0.9rem' }}>
                  Receber notificações de alertas
                </label>
              </div>
            </div>
          </PrognosCard>

          <PrognosCard title="Plano Actual" icon={<Shield size={18} />} style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className={`badge ${profile?.produtoAtivo ? 'badge-accent' : 'badge-success'}`}
                style={{ fontSize: '0.9rem', padding: '6px 20px', marginBottom: '12px' }}>
                {profile?.produtoAtivo ? '⭐ Plano Premium' : '✅ Plano Gratuito'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Scans: {profile?.execucoesUsadas || 0}/{profile?.limiteExecucoes || 50}
              </div>
              {profile?.produtoAtivo && profile?.expiracaoAtivacao && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Expira: {new Date(profile.expiracaoAtivacao).toLocaleDateString('pt-PT')}
                </div>
              )}
            </div>
          </PrognosCard>

          <PrognosCard title="Estatísticas" icon={<User size={18} />} style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {stats.map((stat, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                  <span style={{ fontWeight: 600 }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </PrognosCard>
        </div>
      </div>
    </div>
  );
}
