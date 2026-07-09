import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, MapPin, Phone } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import logoHeader from '../../assets/logo-header.png';

export default function Market() {
  const [tab, setTab] = useState('produtos');
  const [produtos] = useState([
    { id: 1, nome: 'Milho', preco: 250, unidade: 'kg', provincia: 'Huambo', quantidade: 500, vendedor: 'João Santos', telefone: '+244 923 456 789', qualidade: 'Bom' },
    { id: 2, nome: 'Feijão', preco: 500, unidade: 'kg', provincia: 'Bengo', quantidade: 200, vendedor: 'Maria Luís', telefone: '+244 933 987 654', qualidade: 'Premium' },
    { id: 3, nome: 'Mandioca', preco: 150, unidade: 'kg', provincia: 'Malanje', quantidade: 1000, vendedor: 'Pedro Ngola', telefone: '+244 912 345 678', qualidade: 'Bom' },
    { id: 4, nome: 'Tomate', preco: 350, unidade: 'kg', provincia: 'Cuanza Sul', quantidade: 150, vendedor: 'Ana Bento', telefone: '+244 945 567 890', qualidade: 'Premium' },
    { id: 5, nome: 'Cebola', preco: 200, unidade: 'kg', provincia: 'Benguela', quantidade: 300, vendedor: 'Carlos Ngola', telefone: '+244 957 234 567', qualidade: 'Bom' },
    { id: 6, nome: 'Batata-doce', preco: 180, unidade: 'kg', provincia: 'Huíla', quantidade: 400, vendedor: 'Sofia Kiala', telefone: '+244 968 876 543', qualidade: 'Regular' },
  ]);

  const tabs = [
    { id: 'produtos', label: 'Produtos' },
    { id: 'ofertas', label: 'Minhas Ofertas' },
    { id: 'publicar', label: 'Publicar Oferta' },
    { id: 'precos', label: 'Preços Médios' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          🛒 Mercado Agrícola
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Compre e venda produtos agrícolas em Angola
        </p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produtos' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input" placeholder="Pesquisar produtos..." style={{ paddingLeft: '36px' }} />
            </div>
            <select className="input" style={{ maxWidth: '200px' }}>
              <option value="">Todas províncias</option>
              <option value="Luanda">Luanda</option>
              <option value="Huambo">Huambo</option>
              <option value="Benguela">Benguela</option>
            </select>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {produtos.map((prod) => (
              <div key={prod.id} className="market-card">
                <div style={{
                  width: '80px', height: '80px', borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, var(--secondary), var(--secondary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <img src={logoHeader} alt="Prognos" style={{ height: '40px', width: 'auto' }} />
                </div>
                <div className="product-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{prod.nome}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} /> {prod.provincia}
                        <span className="badge badge-primary">{prod.qualidade}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="product-price">{prod.preco} Kz</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{prod.unidade}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>{prod.quantidade}</strong> {prod.unidade} disponíveis
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm">
                        <Phone size={14} /> {prod.vendedor}
                      </button>
                      <button className="btn btn-primary btn-sm">Contactar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'publicar' && (
        <PrognosCard title="Publicar Nova Oferta">
          <form style={{ display: 'grid', gap: '16px' }}>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Nome do Produto</label>
                <input type="text" className="input" placeholder="Ex: Milho, Feijão..." />
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select className="input">
                  <option>Grãos</option>
                  <option>Horícolas</option>
                  <option>Frutas</option>
                  <option>Tubérculos</option>
                  <option>Animais</option>
                </select>
              </div>
            </div>
            <div className="grid-3">
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
                  <option>litro</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Preço (Kz)</label>
                <input type="number" className="input" placeholder="0" />
              </div>
            </div>
            <div className="grid-2">
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
                <label className="input-label">Qualidade</label>
                <select className="input">
                  <option>Premium</option>
                  <option>Bom</option>
                  <option>Regular</option>
                  <option>Básico</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Descrição</label>
              <textarea className="input" placeholder="Descreva o seu produto..." rows={3} />
            </div>
            <div>
              <button type="button" className="btn btn-primary btn-lg">
                <Plus size={18} /> Publicar Oferta
              </button>
            </div>
          </form>
        </PrognosCard>
      )}

      {tab === 'precos' && (
        <PrognosCard title="Preços Médios por Produto" icon={<ShoppingBag size={18} />}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço Médio</th>
                  <th>Mínimo</th>
                  <th>Máximo</th>
                  <th>Ofertas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { nome: 'Milho', medio: 250, min: 180, max: 350, ofertas: 12 },
                  { nome: 'Feijão', medio: 500, min: 350, max: 700, ofertas: 8 },
                  { nome: 'Mandioca', medio: 150, min: 100, max: 250, ofertas: 15 },
                  { nome: 'Tomate', medio: 350, min: 200, max: 500, ofertas: 10 },
                  { nome: 'Cebola', medio: 200, min: 150, max: 300, ofertas: 6 },
                ].map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.nome}</strong></td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.medio} Kz</td>
                    <td>{item.min} Kz</td>
                    <td>{item.max} Kz</td>
                    <td><span className="badge badge-primary">{item.ofertas} ofertas</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrognosCard>
      )}

      {tab === 'ofertas' && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Nenhuma oferta publicada</h3>
          <p>Publique sua primeira oferta no mercado</p>
        </div>
      )}
    </div>
  );
}
