import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Search } from 'lucide-react';
import { usePrognos } from '../contexts/PrognosContext';
import logoHeader from '../../assets/logo-header.png';

export default function PrognosHeader() {
  const navigate = useNavigate();
  const { user, logout, toggleSidebar, notificacoes } = usePrognos();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="prognos-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-sm"
          style={{ padding: '8px' }}
        >
          <Menu size={20} />
        </button>
        <div
          className="logo"
          onClick={() => navigate('/app/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <img
            src={logoHeader}
            alt="Prognos Agri"
            style={{ height: '36px', width: 'auto' }}
          />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Prognos <span style={{ color: 'var(--secondary)' }}>Agri</span></span>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '400px', margin: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="input"
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'relative', padding: '8px' }}
          onClick={() => navigate('/app/chatbot')}
        >
          <Bell size={20} />
          {notificacoes > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              background: 'var(--danger)',
              color: 'white',
              borderRadius: '50%',
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {notificacoes > 9 ? '9+' : notificacoes}
            </span>
          )}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '8px' }}
          onClick={() => navigate('/app/perfil')}
        >
          <Settings size={20} />
        </button>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', borderRadius: 'var(--radius)', cursor: 'pointer' }}
          onClick={() => navigate('/app/perfil')}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user?.username || 'Utilizador'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.role === 'admin' ? 'Administrador' : 'Agricultor'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ padding: '8px', color: 'var(--danger)' }}
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
