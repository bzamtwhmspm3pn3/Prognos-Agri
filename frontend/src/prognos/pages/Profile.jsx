import React from 'react';
import { User, Mail, Phone, MapPin, Globe, Shield, Camera, Save } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { usePrognos } from '../contexts/PrognosContext';

export default function Profile() {
  const { user } = usePrognos();

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

      <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
        <PrognosCard title="Informações Pessoais" icon={<User size={18} />}>
          <form style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.5rem', fontWeight: 'bold',
                position: 'relative', flexShrink: 0
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
                <button style={{
                  position: 'absolute', bottom: '0', right: '0',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--accent)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white'
                }}>
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.username || 'Utilizador'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {user?.role === 'admin' ? 'Administrador' : 'Agricultor'}
                </p>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Nome Completo</label>
                <input type="text" className="input" defaultValue={user?.username || ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input" defaultValue={user?.email || ''} />
              </div>
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Telefone</label>
                <input type="tel" className="input" placeholder="+244 900 000 000" />
              </div>
              <div className="input-group">
                <label className="input-label">Propriedade</label>
                <input type="text" className="input" placeholder="Nome da fazenda" />
              </div>
            </div>
            <div className="grid-3">
              <div className="input-group">
                <label className="input-label">Província</label>
                <select className="input">
                  <option>Luanda</option>
                  <option>Huambo</option>
                  <option>Benguela</option>
                  <option>Malanje</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Município</label>
                <input type="text" className="input" />
              </div>
              <div className="input-group">
                <label className="input-label">Hectares</label>
                <input type="number" className="input" placeholder="0" />
              </div>
            </div>
            <button type="button" className="btn btn-primary">
              <Save size={16} /> Salvar Alterações
            </button>
          </form>
        </PrognosCard>

        <div>
          <PrognosCard title="Configurações" icon={<Shield size={18} />}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Idioma</label>
                <select className="input">
                  <option>Português</option>
                  <option>English</option>
                  <option>Français</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tema</label>
                <select className="input">
                  <option>Automático</option>
                  <option>Claro</option>
                  <option>Escuro</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="notificacoes" defaultChecked />
                <label htmlFor="notificacoes" style={{ fontSize: '0.9rem' }}>
                  Receber notificações de alertas
                </label>
              </div>
            </div>
          </PrognosCard>

          <PrognosCard title="Plano Actual" icon={<Shield size={18} />} style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 20px', marginBottom: '12px' }}>
                ✅ Plano Gratuito
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Scans restantes: 5/5
              </div>
              <button className="btn btn-accent btn-sm" style={{ marginTop: '12px' }}>
                Upgrade para Premium
              </button>
            </div>
          </PrognosCard>

          <PrognosCard title="Estatísticas" icon={<User size={18} />} style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { label: 'Total de Scans', value: '0' },
                { label: 'Pragas Detectadas', value: '0' },
                { label: 'Previsões Solicitadas', value: '0' },
                { label: 'Membro desde', value: new Date().toLocaleDateString('pt-PT') },
              ].map((stat, i) => (
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
