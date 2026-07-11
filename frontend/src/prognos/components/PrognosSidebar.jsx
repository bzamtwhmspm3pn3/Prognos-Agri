import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Cloud, ShoppingBag, MessageCircle, Users, QrCode,
  Camera, User, ChevronLeft, ChevronRight, LogOut, MapPin, FileText, History, Monitor, Droplets, Sprout
} from 'lucide-react';
import { usePrognos } from '../contexts/PrognosContext';

const menuItems = [
  { section: 'Principal' },
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#4A7C59' },
  { path: '/app/previsoes', icon: Cloud, label: 'Previsões', color: '#3b82f6' },
  { path: '/app/mercado', icon: ShoppingBag, label: 'Mercado', color: '#F5A623' },
  { section: 'Ferramentas' },
  { path: '/app/deteccao', icon: Camera, label: 'Detecção de Pragas', color: '#ef4444' },
  { path: '/app/chatbot', icon: MessageCircle, label: 'Assistente IA', color: '#8b5cf6' },
  { path: '/app/comunidade', icon: Users, label: 'Comunidade', color: '#06b6d4' },
  { path: '/app/irrigacao', icon: Droplets, label: 'Irrigação', color: '#3b82f6' },
  { path: '/app/rastreabilidade', icon: QrCode, label: 'Rastreabilidade', color: '#10b981' },
  { path: '/app/cameras', icon: Monitor, label: 'Config. Câmaras', color: '#4A7C59' },
  { path: '/app/monitoramento', icon: MapPin, label: 'Monitoramento Campo', color: '#F97316' },
  { path: '/app/plantio', icon: Sprout, label: 'Gestão de Plantio', color: '#4A7C59' },
  { path: '/app/historico', icon: History, label: 'Histórico Ocorrências', color: '#8b5cf6' },
  { path: '/app/relatorios', icon: FileText, label: 'Relatórios', color: '#06b6d4' },
  { section: 'Conta' },
  { path: '/app/perfil', icon: User, label: 'Meu Perfil', color: '#6366f1' },
];

export default function PrognosSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, sidebarOpen, toggleSidebar } = usePrognos();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNav = (path) => {
    navigate(path);
    if (sidebarOpen) toggleSidebar();
  };

  return (
    <aside className={`prognos-sidebar ${collapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '16px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--accent)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-dark)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 5
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {menuItems.map((item, index) => {
        if (item.section) {
          return (
            <div key={index} className="nav-section">
              {!collapsed && item.section}
            </div>
          );
        }

        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => handleNav(item.path)}
            title={collapsed ? item.label : ''}
          >
            <Icon size={20} style={{ color: active ? 'white' : item.color }} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        );
      })}

      <div className="nav-divider" />
      
      <button
        className="nav-item"
        onClick={handleLogout}
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <LogOut size={20} />
        {!collapsed && <span>Sair</span>}
      </button>

      {!collapsed && (
        <div style={{ padding: '16px 20px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
          Prognos Agri v2.0
          <br />
          © 2026 Venâncio Martins
        </div>
      )}
    </aside>
  );
}
