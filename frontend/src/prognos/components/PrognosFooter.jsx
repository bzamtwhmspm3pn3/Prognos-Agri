import React from 'react';
import logoHeader from '../../assets/logo-header.png';

export default function PrognosFooter() {
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
          <a href="/sobre">Sobre Nós</a>
          <a href="/comunidade">Comunidade</a>
          <a href="/previsoes">Previsão Climática</a>
          <a href="/mercado">Mercado Agrícola</a>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <a href="/termos">Termos de Uso</a>
          <a href="/privacidade">Política de Privacidade</a>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴
      </div>
    </footer>
  );
}
