import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, ExternalLink, Search, MapPin, User, Package, AlertCircle } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import EmptyState from '../components/EmptyState';
import { listarProdutos, MERCADO_YANGUE_SITE } from '../../services/mercadoYangueService';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80';

export default function Market() {
  const [tab, setTab] = useState('produtos');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarProdutos();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Não foi possível carregar os produtos do Mercado Yangue.');
    } finally {
      setLoading(false);
    }
  };

  const provincias = useMemo(() => {
    const set = new Set();
    produtos.forEach(p => { if (p.provincia) set.add(p.provincia); });
    return [...set].sort();
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      if (search && !p.nome?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filtroProvincia && p.provincia !== filtroProvincia) return false;
      return true;
    });
  }, [produtos, search, filtroProvincia]);

  const tabs = [
    { id: 'produtos', label: 'Produtos' },
    { id: 'precos', label: 'Preços' },
    { id: 'comprar', label: 'Comprar' },
    { id: 'vender', label: 'Vender' },
  ];

  const irParaMercadoYangue = (path = '') => {
    window.open(`${MERCADO_YANGUE_SITE}${path}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          Mercado Agrícola
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Produtos do Mercado Yangue — a maior plataforma angolana de comércio agrícola
        </p>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
            Mercado Yangue
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
            Compre, venda, negocie e converse directamente com vendedores
          </p>
        </div>
        <button
          className="btn"
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => irParaMercadoYangue()}
        >
          <ExternalLink size={16} /> Acessar Mercado Completo
        </button>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produtos' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input"
                placeholder="Pesquisar produtos..."
                style={{ paddingLeft: '36px' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input"
              style={{ maxWidth: '200px' }}
              value={filtroProvincia}
              onChange={e => setFiltroProvincia(e.target.value)}
            >
              <option value="">Todas províncias</option>
              {provincias.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Carregando produtos...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <AlertCircle size={40} style={{ color: 'var(--danger)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{error}</p>
              <button className="btn btn-primary" onClick={carregarProdutos}>Tentar novamente</button>
            </div>
          )}

          {!loading && !error && produtosFiltrados.length === 0 && (
            <EmptyState
              icon={<Package size={40} />}
              title={search || filtroProvincia ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
              description={search || filtroProvincia ? 'Tente alterar os filtros de busca.' : 'Os produtos do Mercado Yangue aparecerão aqui.'}
            />
          )}

          {!loading && !error && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {produtosFiltrados.map((prod) => {
                const vendedor = prod.vendedor || {};
                return (
                  <div
                    key={prod._id}
                    className="market-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => irParaMercadoYangue()}
                  >
                    <div style={{
                      width: '80px', height: '80px', borderRadius: 'var(--radius)',
                      background: '#f0f0f0', overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={prod.imagem || DEFAULT_IMAGE}
                        alt={prod.nome}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                        }}
                        onError={e => { e.target.src = DEFAULT_IMAGE; }}
                      />
                    </div>
                    <div className="product-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{prod.nome}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <MapPin size={12} /> {prod.provincia || 'Angola'}
                            {prod.municipio && <span>· {prod.municipio}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="product-price">{prod.preco?.toLocaleString()} Kz</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{prod.unidade || 'un'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} />
                          <strong>{prod.quantidade ?? 0}</strong> {prod.unidade || 'un'} disponíveis
                          {vendedor.nome && (
                            <>
                              <span style={{ color: 'var(--text-muted)' }}>·</span>
                              <User size={14} />
                              {vendedor.nome}
                            </>
                          )}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={(e) => { e.stopPropagation(); irParaMercadoYangue(); }}
                        >
                          <ExternalLink size={14} /> Ver no Mercado
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'precos' && (
        <PrognosCard title="Preços no Mercado Yangue" icon={<ShoppingBag size={18} />}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Preço</th>
                      <th>Unidade</th>
                      <th>Província</th>
                      <th>Vendedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.slice(0, 20).map((prod) => {
                      const vendedor = prod.vendedor || {};
                      return (
                        <tr key={prod._id}>
                          <td><strong>{prod.nome}</strong></td>
                          <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{prod.preco?.toLocaleString()} Kz</td>
                          <td>{prod.unidade || 'un'}</td>
                          <td>{prod.provincia || '-'}</td>
                          <td>{vendedor.nome || 'Anónimo'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => irParaMercadoYangue()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ExternalLink size={16} /> Ver todos os preços no Mercado Yangue
                </button>
              </div>
            </>
          )}
        </PrognosCard>
      )}

      {tab === 'comprar' && (
        <PrognosCard title="Comprar no Mercado Yangue">
          <div className="empty-state">
            <div className="empty-icon">
              <ShoppingBag size={48} />
            </div>
            <h3>Faça suas compras no Mercado Yangue</h3>
            <p style={{ marginBottom: '20px' }}>
              Adicione produtos ao carrinho, converse com vendedores e finalize a compra com pagamento seguro.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => irParaMercadoYangue()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ExternalLink size={18} /> Ir para o Mercado Yangue
            </button>
          </div>
        </PrognosCard>
      )}

      {tab === 'vender' && (
        <PrognosCard title="Vender no Mercado Yangue">
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <h3>Publique seus produtos no Mercado Yangue</h3>
            <p style={{ marginBottom: '20px' }}>
              Cadastre seus produtos agrícolas, gerencie vendas, e alcance compradores em toda Angola.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => irParaMercadoYangue()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ExternalLink size={18} /> Publicar Produto no Mercado Yangue
            </button>
          </div>
        </PrognosCard>
      )}
    </div>
  );
}
