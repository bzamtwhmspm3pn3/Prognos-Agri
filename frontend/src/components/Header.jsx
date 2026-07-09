// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, LogOut, User, 
  Settings, HelpCircle, Bell, Home, BarChart3,
  Target, Leaf, Phone, Mail, MapPin, Sprout,
  Award, Star, MessageCircle, Wifi, WifiOff,
  Sun, Moon, Clock, Calendar
} from 'lucide-react';
import logoAgrookuvanja from '../assets/logoagrookuvanja.png';
import favicon from '../assets/favicon.ico';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444',
  textoClaro: '#6B7280'
};

export default function Header({ 
  usuarioLogado, 
  onLoginClick, 
  onRegisterClick, 
  onLogout,
  onDashboardClick,
  onQuemSomosClick,
  onContactClick,
  onProfileClick,
  onSettingsClick,
  onHelpClick,
  onEstatisticasClick,
  alternarTema,
  temaAtual = 'light'
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [dataHora, setDataHora] = useState(new Date());

  // Monitorar status da internet
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setDataHora(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Header para visitantes (não logados)
  if (!usuarioLogado) {
    return (
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          backgroundColor: cores.verdeAlface,
          color: 'white',
          padding: '12px 30px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: `2px solid ${cores.verdePimenta}`,
                boxShadow: `0 4px 8px ${cores.verdeAlface}40`
              }}
            >
              <img 
                src={logoAgrookuvanja} 
                alt="AgroOkuvanja Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '🌱';
                }}
              />
            </motion.div>

            <div>
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>
                AGRO<span style={{ color: cores.verdePimenta }}>OKUVANJA</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <motion.img 
                  src={favicon} 
                  alt="" 
                  style={{ width: '14px', height: '14px', opacity: 0.8 }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                  Monitoramento Agrícola
                </span>
              </div>
            </div>
          </motion.div>

          {/* Status Online e Relógio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <motion.div
              animate={{ scale: online ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: online ? Infinity : 0, duration: 2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                background: online ? 'rgba(130, 183, 77, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                borderRadius: '20px',
                border: `1px solid ${online ? cores.verdePimenta : cores.vermelho}`
              }}
            >
              {online ? (
                <Wifi size={14} color={cores.verdePimenta} />
              ) : (
                <WifiOff size={14} color={cores.vermelho} />
              )}
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: online ? cores.verdePimenta : cores.vermelho }}>
                {online ? 'Online' : 'Offline'}
              </span>
            </motion.div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {dataHora.toLocaleDateString('pt-PT')}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {dataHora.toLocaleTimeString('pt-PT')}
              </div>
            </div>
          </div>

          {/* Navegação Desktop */}
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            
            {/* Links Institucionais */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <button
                onClick={onQuemSomosClick}
                style={navLinkStyle}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                Sobre
              </button>
              
              <button
                onClick={onContactClick}
                style={navLinkStyle}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                Contacto
              </button>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: `1px solid ${cores.verdePimenta}`,
                  padding: '8px 20px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                Entrar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegisterClick}
                style={{
                  background: cores.verdePimenta,
                  color: cores.verdeAlface,
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 10px rgba(130, 183, 77, 0.3)'
                }}
              >
                Criar Conta
              </motion.button>
            </div>
          </div>

          {/* Menu Mobile Button */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
            className="mobile-menu-button"
          >
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {menuAberto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                overflow: 'hidden',
                padding: menuAberto ? '20px' : 0,
                background: '#0A2E1A',
                marginTop: '12px',
                borderRadius: '10px'
              }}
              className="mobile-menu"
            >
              <button onClick={() => { onQuemSomosClick?.(); setMenuAberto(false); }} style={mobileButtonStyle}>
                Sobre
              </button>
              <button onClick={() => { onContactClick?.(); setMenuAberto(false); }} style={mobileButtonStyle}>
                Contacto
              </button>
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
              <button onClick={() => { onLoginClick?.(); setMenuAberto(false); }} style={mobileButtonStyle}>
                Entrar
              </button>
              <button onClick={() => { onRegisterClick?.(); setMenuAberto(false); }} style={{...mobileButtonStyle, background: cores.verdePimenta, color: cores.verdeAlface, borderRadius: '8px'}}>
                Criar Conta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    );
  }

  // Header para utilizadores LOGADOS
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        backgroundColor: cores.verdeAlface,
        color: 'white',
        padding: '10px 30px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={onDashboardClick}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: `2px solid ${cores.verdePimenta}`
            }}
          >
            <img 
              src={logoAgrookuvanja} 
              alt="AgroOkuvanja" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </motion.div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              AGRO<span style={{ color: cores.verdePimenta }}>OKUVANJA</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <img src={favicon} alt="" style={{ width: '12px', height: '12px' }} />
              <span style={{ fontSize: '9px', opacity: 0.8 }}>Dashboard</span>
            </div>
          </div>
        </motion.div>

        {/* Status e Relógio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <motion.div
            animate={{ scale: online ? [1, 1.1, 1] : 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              background: online ? 'rgba(130, 183, 77, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderRadius: '20px'
            }}
          >
            {online ? <Wifi size={14} color={cores.verdePimenta} /> : <WifiOff size={14} color={cores.vermelho} />}
          </motion.div>

          <div style={{ textAlign: 'right', borderRight: `1px solid ${cores.verdePimenta}`, paddingRight: '15px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{dataHora.toLocaleDateString('pt-PT')}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{dataHora.toLocaleTimeString('pt-PT')}</div>
          </div>

          {/* Toggle Tema */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={alternarTema}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            {temaAtual === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </motion.button>
        </div>

        {/* Navegação Principal */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* Dashboard */}
          <button onClick={onDashboardClick} style={navButtonStyle}>
            <Home size={16} />
            <span style={{ marginLeft: '5px' }}>Dashboard</span>
          </button>

          {/* Estatísticas */}
          <button onClick={onEstatisticasClick} style={navButtonStyle}>
            <BarChart3 size={16} />
          </button>

          {/* Notificações */}
          <button style={navButtonStyle}>
            <Bell size={16} />
            <span style={notificationBadgeStyle} />
          </button>

          {/* Perfil Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPerfilAberto(!perfilAberto)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                background: cores.verdePimenta,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cores.verdeAlface,
                fontWeight: 'bold'
              }}>
                {usuarioLogado?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '14px' }}>{usuarioLogado?.username || 'Utilizador'}</span>
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {perfilAberto && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={dropdownMenuStyle}
                >
                  <div style={dropdownHeaderStyle}>
                    <img src={favicon} alt="" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    <div>
                      <p style={{ fontWeight: 'bold', color: cores.verdeAlface }}>{usuarioLogado?.username}</p>
                      <p style={{ fontSize: '0.8rem', color: '#666' }}>{usuarioLogado?.email}</p>
                    </div>
                  </div>
                  
                  <button onClick={() => { onProfileClick?.(); setPerfilAberto(false); }} style={dropdownItemStyle}>
                    <User size={16} color={cores.verdeAlface} /> Meu Perfil
                  </button>
                  
                  <button onClick={() => { onEstatisticasClick?.(); setPerfilAberto(false); }} style={dropdownItemStyle}>
                    <Award size={16} color={cores.verdeAlface} /> Conquistas
                  </button>
                  
                  <button onClick={() => { onSettingsClick?.(); setPerfilAberto(false); }} style={dropdownItemStyle}>
                    <Settings size={16} color={cores.verdeAlface} /> Configurações
                  </button>
                  
                  <button onClick={() => { onHelpClick?.(); setPerfilAberto(false); }} style={dropdownItemStyle}>
                    <HelpCircle size={16} color={cores.verdeAlface} /> Ajuda
                  </button>
                  
                  <hr style={{ margin: '5px 0', borderColor: '#eee' }} />
                  
                  <button onClick={onLogout} style={{...dropdownItemStyle, color: cores.vermelho}}>
                    <LogOut size={16} color={cores.vermelho} /> Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menu Mobile Button */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
          className="mobile-menu-button"
        >
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile para logados */}
      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={mobileMenuStyle}
          >
            <button onClick={() => { onDashboardClick(); setMenuAberto(false); }} style={mobileButtonStyle}>
              <Home size={16} style={{ marginRight: '10px' }} /> Dashboard
            </button>
            <button onClick={() => { onProfileClick?.(); setMenuAberto(false); }} style={mobileButtonStyle}>
              <User size={16} style={{ marginRight: '10px' }} /> Meu Perfil
            </button>
            <button onClick={() => { onSettingsClick?.(); setMenuAberto(false); }} style={mobileButtonStyle}>
              <Settings size={16} style={{ marginRight: '10px' }} /> Configurações
            </button>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <button onClick={onLogout} style={{...mobileButtonStyle, color: cores.vermelho}}>
              <LogOut size={16} style={{ marginRight: '10px' }} /> Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Estilos
const navLinkStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  fontSize: '0.95rem',
  padding: '5px 0',
  borderBottom: '2px solid transparent',
  transition: 'all 0.3s'
};

const navButtonStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  color: 'white',
  padding: '8px 15px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.95rem',
  transition: 'all 0.3s'
};

const notificationBadgeStyle = {
  position: 'absolute',
  top: 2,
  right: 2,
  width: 8,
  height: 8,
  background: cores.vermelho,
  borderRadius: '50%'
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: '45px',
  right: 0,
  background: 'white',
  borderRadius: '10px',
  boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
  width: '240px',
  overflow: 'hidden',
  zIndex: 1001
};

const dropdownHeaderStyle = {
  padding: '15px',
  borderBottom: '1px solid #eee',
  background: `linear-gradient(135deg, ${cores.verdeClaro}, white)`,
  display: 'flex',
  alignItems: 'center'
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '12px 15px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
  color: '#333',
  transition: 'background 0.2s'
};

const mobileButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '12px',
  background: 'none',
  border: 'none',
  color: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '1rem',
  borderRadius: '5px'
};

const mobileMenuStyle = {
  overflow: 'hidden',
  padding: '20px',
  background: '#0A2E1A',
  marginTop: '12px',
  borderRadius: '10px'
};

// Adicionar estilos CSS
const style = document.createElement('style');
style.innerHTML = `
  @media (max-width: 768px) {
    .mobile-menu-button {
      display: block !important;
    }
    .mobile-menu {
      display: block !important;
    }
    div[style*="display: flex; gap: 30px;"] {
      display: none !important;
    }
    div[style*="display: flex; gap: 15px;"] {
      display: none !important;
    }
  }
  
  button {
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: rgba(255,255,255,0.15) !important;
  }
  
  [style*="dropdownItemStyle"]:hover {
    background-color: #f5f5f5 !important;
  }
`;
document.head.appendChild(style);