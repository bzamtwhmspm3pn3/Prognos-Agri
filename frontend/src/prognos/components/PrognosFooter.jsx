import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import logoHeader from '../../assets/logo-header.png';

export default function PrognosFooter() {
  const navigate = useNavigate();

  const links = [
    { label: 'Sobre Nós', path: '/' },
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Detecção de Pragas', path: '/app/deteccao' },
    { label: 'Previsão Climática', path: '/app/previsoes' },
    { label: 'Mercado Agrícola', path: '/app/mercado' },
    { label: 'Comunidade', path: '/app/comunidade' },
    { label: 'Config. Câmaras', path: '/app/cameras' },
  ];

  const legais = [
    { label: 'Termos de Uso', path: '/app/dashboard' },
    { label: 'Política de Privacidade', path: '/app/dashboard' },
  ];

  return (
    <footer className="prognos-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <img src={logoHeader} alt="Prognos Agri" style={{ height: '28px', width: 'auto' }} />
            <h4 style={{ margin: 0 }}>Prognos Agri</h4>
          </div>
          <p>
            Sistema Inteligente de Previsão e Gestão Agrícola.
            Transformando a agricultura angolana com tecnologia.
          </p>
        </div>
        <div className="footer-section">
          <h4>Contacto</h4>
          <a href="mailto:venancio@prognosagri.ao" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', textDecoration: 'none' }}>
            <Mail size={14} /> venancio@prognosagri.ao
          </a>
          <a href="tel:+244900000000" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', textDecoration: 'none' }}>
            <Phone size={14} /> +244 900 000 000
          </a>
          <a href="https://maps.google.com/?q=Luanda,Angola" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', textDecoration: 'none' }}>
            <MapPin size={14} /> Luanda, Angola <ExternalLink size={12} />
          </a>
        </div>
        <div className="footer-section">
          <h4>Links Úteis</h4>
          {links.map(link => (
            <span key={link.path + link.label} onClick={() => navigate(link.path)} style={{ cursor: 'pointer', display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
            >
              {link.label}
            </span>
          ))}
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          {legais.map(link => (
            <span key={link.path + link.label} onClick={() => navigate(link.path)} style={{ cursor: 'pointer', display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
            >
              {link.label}
            </span>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴
      </div>
    </footer>
  );
}
