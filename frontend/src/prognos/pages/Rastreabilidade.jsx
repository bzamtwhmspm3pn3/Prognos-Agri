import React, { useState } from 'react';
import { QrCode, Shield, CheckCircle, Plus, Search, MapPin, Calendar, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PrognosCard from '../components/PrognosCard';

export default function Rastreabilidade() {
  const [tab, setTab] = useState('registar');
  const [codigoAtual, setCodigoAtual] = useState(null);
  const [codigoConsulta, setCodigoConsulta] = useState('');

  const registosExemplo = [
    {
      id: 1, codigo: 'PA-20260709-A1B2C3', produto: 'Milho Premium',
      talhao: 'Talhão A1', quantidade: 500, unidade: 'kg',
      qualidade: 'Premium', data: '2026-07-09',
      hash: '0x7a3f...b9c2'
    }
  ];

  const gerarCodigo = () => {
    const codigo = `PA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setCodigoAtual(codigo);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          🔗 Rastreabilidade Blockchain
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Certificação digital e rastreio completo dos seus produtos
        </p>
      </div>

      <div className="tabs">
        {[
          { id: 'registar', label: 'Registar Produção' },
          { id: 'historico', label: 'Histórico' },
          { id: 'consultar', label: 'Consultar Produto' },
        ].map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'registar' && (
        <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
          <PrognosCard title="Registo de Produção" icon={<Plus size={18} />}>
            <form style={{ display: 'grid', gap: '16px' }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Nome do Produto</label>
                  <input type="text" className="input" placeholder="Ex: Milho Premium" />
                </div>
                <div className="input-group">
                  <label className="input-label">Categoria</label>
                  <select className="input">
                    <option>Grãos</option>
                    <option>Horícolas</option>
                    <option>Frutas</option>
                    <option>Tubérculos</option>
                  </select>
                </div>
              </div>
              <div className="grid-3">
                <div className="input-group">
                  <label className="input-label">Talhão</label>
                  <input type="text" className="input" placeholder="Ex: Talhão A1" />
                </div>
                <div className="input-group">
                  <label className="input-label">Quantidade</label>
                  <input type="number" className="input" placeholder="0" />
                </div>
                <div className="input-group">
                  <label className="input-label">Unidade</label>
                  <select className="input">
                    <option>kg</option>
                    <option>ton</option>
                    <option>unidade</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Qualidade</label>
                  <select className="input">
                    <option>Premium</option>
                    <option>Bom</option>
                    <option>Regular</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Data de Colheita</label>
                  <input type="date" className="input" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Coordenadas (Lat, Lng)</label>
                <div className="grid-2">
                  <input type="text" className="input" placeholder="Latitude" />
                  <input type="text" className="input" placeholder="Longitude" />
                </div>
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={gerarCodigo}>
                <QrCode size={18} /> Gerar Código de Rastreio
              </button>
            </form>
          </PrognosCard>

          {codigoAtual && (
            <PrognosCard title="Certificado Digital" icon={<Shield size={18} />}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  padding: '20px', display: 'inline-block',
                  border: '1px solid var(--border)'
                }}>
                  <QRCodeSVG value={`${window.location.origin}/rastreabilidade/${codigoAtual}`} size={160} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Código de Rastreio
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold',
                    color: 'var(--primary)', background: 'rgba(0,51,102,0.05)',
                    padding: '8px 16px', borderRadius: 'var(--radius)',
                    display: 'inline-block'
                  }}>
                    {codigoAtual}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div className="badge badge-success" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
                    <CheckCircle size={14} /> Certificado Blockchain Gerado
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Hash: 0x{Date.now().toString(16)}...{Math.random().toString(16).substring(2, 6)}
                  </div>
                </div>
                <button className="btn btn-accent" style={{ marginTop: '20px', width: '100%' }}>
                  <FileText size={16} /> Descarregar Certificado
                </button>
              </div>
            </PrognosCard>
          )}
        </div>
      )}

      {tab === 'historico' && (
        <PrognosCard title="Histórico de Registo" icon={<Calendar size={18} />}>
          {registosExemplo.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Talhão</th>
                    <th>Quantidade</th>
                    <th>Qualidade</th>
                    <th>Data</th>
                    <th>Blockchain</th>
                  </tr>
                </thead>
                <tbody>
                  {registosExemplo.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.codigo}</td>
                      <td><strong>{r.produto}</strong></td>
                      <td>{r.talhao}</td>
                      <td>{r.quantidade} {r.unidade}</td>
                      <td><span className="badge badge-success">{r.qualidade}</span></td>
                      <td>{r.data}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <QrCode size={48} style={{ opacity: 0.3 }} />
              <h3>Nenhum produto registado</h3>
              <p>Registe a sua primeira produção para gerar o certificado digital</p>
            </div>
          )}
        </PrognosCard>
      )}

      {tab === 'consultar' && (
        <PrognosCard title="Consultar Produto" icon={<Search size={18} />}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              className="input"
              placeholder="Digite o código de rastreio (Ex: PA-XXXX-XXXX)"
              value={codigoConsulta}
              onChange={(e) => setCodigoConsulta(e.target.value.toUpperCase())}
            />
            <button className="btn btn-primary">Consultar</button>
          </div>

          <div className="empty-state" style={{ padding: '20px' }}>
            <QrCode size={48} style={{ opacity: 0.3 }} />
            <h3>Informação do Produto</h3>
            <p style={{ maxWidth: '500px', margin: '0 auto' }}>
              Insira o código de rastreio para ver todo o histórico do produto,
              desde a colheita até à entrega ao consumidor final.
            </p>
          </div>
        </PrognosCard>
      )}
    </div>
  );
}
