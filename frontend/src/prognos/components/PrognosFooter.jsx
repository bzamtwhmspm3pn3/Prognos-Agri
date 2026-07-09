import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoHeader from '../../assets/logo-header.png';

export default function PrognosFooter() {
  const navigate = useNavigate();

  const links = [
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
          <p>Email: venancio@prognosagri.ao</p>
          <p>Telefone: +244 900 000 000</p>
          <p>Luanda, Angola</p>
        </div>
        <div className="footer-section">
          <h4>Links Úteis</h4>
          {links.map(link => (
            <span key={link.path} onClick={() => navigate(link.path)} style={{ cursor: 'pointer', display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8' }}>
              {link.label}
            </span>
          ))}
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          {legais.map(link => (
            <span key={link.path} onClick={() => navigate(link.path)} style={{ cursor: 'pointer', display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8' }}>
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
