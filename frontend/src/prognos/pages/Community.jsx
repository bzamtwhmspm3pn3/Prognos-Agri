import React, { useState, useEffect, useCallback } from 'react';
import { Users, MessageCircle, Heart, Share2, Eye, Plus, Search, Tag, X, Send, Loader, AlertCircle } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { usePrognos } from '../contexts/PrognosContext';
import { listarPosts, criarPost, likePost, comentar, listarGrupos, getTagsPopulares } from '../../services/communityService';

const tipoOptions = ['post', 'pergunta', 'artigo', 'dica'];

export default function Community() {
  const { user } = usePrognos();
  const [tab, setTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [tagsPopulares, setTagsPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const [newPost, setNewPost] = useState({
    titulo: '', conteudo: '', tipo: 'post', grupo: '', tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsRes, gruposRes, tagsRes] = await Promise.all([
        listarPosts({ page: 1, limite: 20 }),
        listarGrupos(),
        getTagsPopulares()
      ]);
      setPosts(postsRes.data || postsRes.posts || []);
      setGrupos(gruposRes.data || gruposRes.grupos || []);
      setTagsPopulares(tagsRes.data || tagsRes.tags || []);
    } catch (err) {
      console.error('Erro ao carregar comunidade:', err);
      setError('Erro ao carregar dados da comunidade.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleLike = async (postId) => {
    try {
      const res = await likePost(postId);
      if (res.success) {
        setPosts(prev => prev.map(p =>
          p._id === postId ? { ...p, ...res.data, stats: res.data.stats || p.stats } : p
        ));
      }
    } catch (err) {
      console.error('Erro ao dar like:', err);
    }
  };

  const handleComentar = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await comentar(postId, commentText);
      if (res.success) {
        setPosts(prev => prev.map(p =>
          p._id === postId ? { ...p, comentarios: [...(p.comentarios || []), res.data], stats: { ...p.stats, comentarios: (p.stats?.comentarios || 0) + 1 } } : p
        ));
        setCommentText('');
      }
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  const handleCriarPost = async (e) => {
    e.preventDefault();
    if (!newPost.titulo.trim() || !newPost.conteudo.trim()) return;
    try {
      setSubmitting(true);
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await criarPost({
        titulo: newPost.titulo,
        conteudo: newPost.conteudo,
        tipo: newPost.tipo,
        grupo: newPost.grupo || undefined,
        tags
      });
      if (res.success) {
        setPosts(prev => [res.data || res.post, ...prev]);
        setNewPost({ titulo: '', conteudo: '', tipo: 'post', grupo: '', tags: '' });
        setTab('feed');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.titulo || '').toLowerCase().includes(q) ||
           (p.conteudo || '').toLowerCase().includes(q) ||
           (p.tags || []).some(t => t.toLowerCase().includes(q));
  });

  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'grupos', label: 'Grupos' },
    { id: 'publicar', label: 'Publicar' },
  ];

  if (loading && posts.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Loader className="spinner" /></div>;
  }

  const renderPost = (post) => {
    const autorNome = post.usuarioId?.username || post.usuarioNome || 'Anónimo';
    const autorAvatar = (post.usuarioId?.profile?.nome || autorNome).charAt(0).toUpperCase();
    const stats = post.stats || {};
    const comentarios = post.comentarios || [];

    return (
      <div key={post._id} className="forum-post">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0
          }}>
            {autorAvatar}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{autorNome}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span className="badge badge-primary">{post.tipo}</span>
              {post.grupo && <> • {post.grupo}</>}
              {post.createdAt && <> • {new Date(post.createdAt).toLocaleDateString('pt-PT')}</>}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px', cursor: 'pointer' }}
          onClick={() => setSelectedPost(selectedPost === post._id ? null : post._id)}>
          {post.titulo}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
          {(post.conteudo || '').substring(0, 200)}{(post.conteudo || '').length > 200 ? '...' : ''}
        </p>

        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {post.tags.map((tag, i) => (
              <span key={i} className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                <Tag size={10} /> #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <button onClick={() => handleLike(post._id)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <Heart size={14} /> {stats.likes || 0}
          </button>
          <button onClick={() => setSelectedPost(selectedPost === post._id ? null : post._id)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <MessageCircle size={14} /> {stats.comentarios || 0}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} /> {stats.visualizacoes || 0}
          </span>
        </div>

        {selectedPost === post._id && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
              Comentários ({comentarios.length})
            </h4>

            {comentarios.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            ) : (
              comentarios.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', padding: '10px 0',
                  borderBottom: i < comentarios.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--bg-body)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', flexShrink: 0
                  }}>
                    {(c.usuarioNome || c.usuarioId?.username || 'A').charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      {c.usuarioNome || c.usuarioId?.username || 'Anónimo'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.conteudo}</div>
                  </div>
                </div>
              ))
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input type="text" className="input" placeholder="Escrever comentário..."
                value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleComentar(post._id); }} />
              <button className="btn btn-primary btn-sm" onClick={() => handleComentar(post._id)}
                disabled={!commentText.trim()}>
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            👥 Comunidade
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Partilhe experiências e aprenda com outros agricultores
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius)', marginBottom: '16px', color: '#ef4444', fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

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
            <div style={{ marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input" placeholder="Pesquisar publicações..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '36px' }} />
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                {search ? 'Nenhuma publicação encontrada.' : 'Nenhuma publicação ainda. Seja o primeiro a publicar!'}
              </p>
            ) : (
              filteredPosts.map(renderPost)
            )}
          </div>

          <div>
            <PrognosCard title="Grupos Populares" icon={<Users size={18} />}>
              {grupos.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>
                  Nenhum grupo ainda
                </p>
              ) : (
                grupos.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: i < grupos.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{g.nome || g._id}</span>
                    <span className="badge badge-primary">{g.total || g.count || 0} posts</span>
                  </div>
                ))
              )}
            </PrognosCard>

            {tagsPopulares.length > 0 && (
              <PrognosCard title="Tags Populares" icon={<Tag size={18} />} style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {tagsPopulares.map((tag, i) => (
                    <span key={i} className="badge badge-accent" style={{ cursor: 'pointer', padding: '4px 12px' }}
                      onClick={() => { setSearch(tag._id || tag.tag || tag); setTab('feed'); }}>
                      #{tag._id || tag.tag || tag}
                    </span>
                  ))}
                </div>
              </PrognosCard>
            )}
          </div>
        </div>
      )}

      {tab === 'grupos' && (
        <div className="grid-3">
          {grupos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              Nenhum grupo encontrado.
            </p>
          ) : (
            grupos.map((g, i) => (
              <div key={i} className="forum-post" style={{ cursor: 'pointer' }}
                onClick={() => { setTab('feed'); setSearch(g.nome || g._id); }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
                <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{g.nome || g._id}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{g.total || g.count || 0} publicações</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'publicar' && (
        <PrognosCard title="Nova Publicação">
          <form onSubmit={handleCriarPost} style={{ display: 'grid', gap: '16px' }}>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Título</label>
                <input type="text" className="input" placeholder="Título da publicação" required
                  value={newPost.titulo} onChange={e => setNewPost(prev => ({ ...prev, titulo: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input" value={newPost.tipo}
                  onChange={e => setNewPost(prev => ({ ...prev, tipo: e.target.value }))}>
                  {tipoOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Conteúdo</label>
              <textarea className="input" placeholder="Escreva o seu conteúdo..." rows={6} required
                value={newPost.conteudo} onChange={e => setNewPost(prev => ({ ...prev, conteudo: e.target.value }))} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Grupo</label>
                <select className="input" value={newPost.grupo}
                  onChange={e => setNewPost(prev => ({ ...prev, grupo: e.target.value }))}>
                  <option value="">Sem grupo</option>
                  {grupos.map((g, i) => (
                    <option key={i} value={g.nome || g._id}>{g.nome || g._id}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tags (separadas por vírgula)</label>
                <input type="text" className="input" placeholder="Ex: milho, pragas, dicas"
                  value={newPost.tags} onChange={e => setNewPost(prev => ({ ...prev, tags: e.target.value }))} />
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? <Loader size={18} className="spinner" /> : <Plus size={18} />}
                {submitting ? 'A publicar...' : 'Publicar'}
              </button>
            </div>
          </form>
        </PrognosCard>
      )}
    </div>
  );
}
