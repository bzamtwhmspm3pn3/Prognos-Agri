import React, { useState } from 'react';
import { Users, MessageCircle, Heart, Share2, Eye, Plus, Search, Tag } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';

export default function Community() {
  const [tab, setTab] = useState('feed');
  const [posts] = useState([
    {
      id: 1, autor: 'João Santos', tipo: 'pergunta',
      titulo: 'Como combater a lagarta-do-cartucho no milho?',
      conteudo: 'Bom dia, colegas! Estou com problemas de lagarta-do-cartucho na minha plantação de milho no Huambo. Alguém tem recomendações de controlo biológico que funcionem bem na região?',
      tags: ['milho', 'pragas', 'controlo_biológico'],
      stats: { likes: 15, comentarios: 8, visualizacoes: 234 },
      data: 'Hoje às 10:30',
      grupo: 'Plantio e Cultivo'
    },
    {
      id: 2, autor: 'Maria Luís', tipo: 'dica',
      titulo: '🌱 Dica: Preparação do solo para época chuvosa',
      conteudo: 'Partilho aqui algumas dicas que aprendi ao longo dos anos:\n\n1. Faça análise do solo antes de preparar\n2. Use matéria orgânica (esterco bem curtido)\n3. Faça sulcos no sentido do declive para evitar erosão\n4. Planeie a rotação de culturas\n\nEspero que ajude alguém! 🚀',
      tags: ['solo', 'preparação', 'dicas'],
      stats: { likes: 32, comentarios: 5, visualizacoes: 567 },
      data: 'Ontem às 15:45',
      grupo: 'Boas Práticas'
    },
    {
      id: 3, autor: 'Pedro Ngola', tipo: 'artigo',
      titulo: 'O futuro da agricultura em Angola com tecnologia',
      conteudo: 'A agricultura angolana está a passar por uma transformação digital...',
      tags: ['tecnologia', 'Angola', 'agritech'],
      stats: { likes: 28, comentarios: 12, visualizacoes: 890 },
      data: '3 dias atrás',
      grupo: 'Tecnologia Agrícola'
    }
  ]);

  const grupos = [
    { nome: 'Plantio e Cultivo', total: 45 },
    { nome: 'Boas Práticas', total: 32 },
    { nome: 'Tecnologia Agrícola', total: 28 },
    { nome: 'Mercado e Vendas', total: 20 },
    { nome: 'Pecuária', total: 18 },
    { nome: 'Agricultura Familiar', total: 15 },
  ];

  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'grupos', label: 'Grupos' },
    { id: 'publicar', label: 'Publicar' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          👥 Comunidade
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Partilhe experiências e aprenda com outros agricultores
        </p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
          <div>
            {posts.map((post) => (
              <div key={post.id} className="forum-post">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0
                  }}>
                    {post.autor.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.autor}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span className="badge badge-primary">{post.tipo}</span> {post.grupo} • {post.data}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px' }}>{post.titulo}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                  {post.conteudo.substring(0, 200)}...
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {post.tags.map((tag, i) => (
                    <span key={i} className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                      <Tag size={10} /> #{tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    <Heart size={14} /> {post.stats.likes}
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    <MessageCircle size={14} /> {post.stats.comentarios}
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    <Share2 size={14} /> Compartilhar
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} /> {post.stats.visualizacoes}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <PrognosCard title="Grupos Populares" icon={<Users size={18} />}>
              {grupos.map((g, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: i < grupos.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{g.nome}</span>
                  <span className="badge badge-primary">{g.total} posts</span>
                </div>
              ))}
            </PrognosCard>

            <PrognosCard title="Tags Populares" icon={<Tag size={18} />} style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['milho', 'pragas', 'solo', 'irrigação', 'feijão', 'mandioca', 'adubação', 'colheita', 'angola', 'tecnologia'].map((tag, i) => (
                  <span key={i} className="badge badge-accent" style={{ cursor: 'pointer', padding: '4px 12px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </PrognosCard>
          </div>
        </div>
      )}

      {tab === 'grupos' && (
        <div className="grid-3">
          {grupos.map((g, i) => (
            <div key={i} className="forum-post" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
              <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{g.nome}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{g.total} publicações</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'publicar' && (
        <PrognosCard title="Nova Publicação">
          <form style={{ display: 'grid', gap: '16px' }}>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Título</label>
                <input type="text" className="input" placeholder="Título da publicação" />
              </div>
              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input">
                  <option>Post</option>
                  <option>Pergunta</option>
                  <option>Artigo</option>
                  <option>Dica</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Conteúdo</label>
              <textarea className="input" placeholder="Escreva o seu conteúdo..." rows={6} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Grupo</label>
                <select className="input">
                  {grupos.map((g, i) => (
                    <option key={i}>{g.nome}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tags (separadas por vírgula)</label>
                <input type="text" className="input" placeholder="Ex: milho, pragas, dicas" />
              </div>
            </div>
            <div>
              <button type="button" className="btn btn-primary btn-lg">
                <Plus size={18} /> Publicar
              </button>
            </div>
          </form>
        </PrognosCard>
      )}
    </div>
  );
}
