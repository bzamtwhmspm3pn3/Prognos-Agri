import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, MessageCircle, Heart, Eye, Plus, Search, Tag, Send, Loader, AlertCircle, ArrowLeft, LogIn, UserCheck, UserX, Shield, Image, Paperclip, Settings, Trash2, Edit3, Crown, Camera, Lock, Bell, CheckCircle, Clock } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { usePrognos } from '../contexts/PrognosContext';
import { listarPosts, criarPost, likePost, comentar, listarGrupos, criarGrupo, getTagsPopulares, listarMensagens, enviarMensagem, solicitarEntrada, aprovarMembro, removerMembro, alterarCargo, atualizarGrupo, eliminarGrupo, uploadFile } from '../../services/communityService';
import { connectSocket, joinGrupo, leaveGrupo, onNewMessage, offNewMessage, onApproved, offApproved, sendMessage as sendSocketMessage, disconnectSocket } from '../../services/socketService';

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

  const [showPostBox, setShowPostBox] = useState(false);
  const [postTitulo, setPostTitulo] = useState('');
  const [postConteudo, setPostConteudo] = useState('');
  const [postTipo, setPostTipo] = useState('post');
  const [postTags, setPostTags] = useState('');
  const [postGrupo, setPostGrupo] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const [showCriarGrupo, setShowCriarGrupo] = useState(false);
  const [newGroup, setNewGroup] = useState({ nome: '', descricao: '', categoria: 'geral' });

  const [chatGroup, setChatGroup] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [msgTexto, setMsgTexto] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [gruposDetalhe, setGruposDetalhe] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [editGroupData, setEditGroupData] = useState({ nome: '', descricao: '', foto: '' });
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

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
      const gData = gruposRes.data || gruposRes.grupos || [];
      setGrupos(gData);
      const gMap = {};
      gData.forEach(g => { gMap[g._id] = g; });
      setGruposDetalhe(gMap);
      setTagsPopulares(tagsRes.data || tagsRes.tags || []);
    } catch (err) {
      console.error('Erro ao carregar comunidade:', err);
      setError('Erro ao carregar dados da comunidade.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  useEffect(() => {
    const token = localStorage.getItem('prognos_token');
    if (token) {
      const socket = connectSocket(token);
      if (socket) {
        onNewMessage((msg) => {
          setMensagens(prev => [...prev, msg]);
        });
        onApproved((data) => {
          alert(`✅ ${data.message}`);
          carregarDados();
          if (chatGroup?._id === data.grupoId) {
            carregarMensagens(data.grupoId);
          }
        });
      }
    }
    return () => {
      offNewMessage();
      offApproved();
    };
  }, []);

  useEffect(() => {
    if (chatGroup?._id) {
      joinGrupo(chatGroup._id);
    }
    return () => {
      if (chatGroup?._id) leaveGrupo(chatGroup._id);
    };
  }, [chatGroup?._id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  const carregarMensagens = useCallback(async (grupoId) => {
    try {
      setLoadingMsgs(true);
      const res = await listarMensagens(grupoId);
      setMensagens(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const abrirChat = async (grupo) => {
    setChatGroup(grupo);
    if (!gruposDetalhe[grupo._id]?.membros) await carregarDados();
    if (ehMembro(grupo)) await carregarMensagens(grupo._id);
  };

  const voltarGrupos = () => {
    setChatGroup(null);
    setMensagens([]);
  };

  const handleEnviarMsg = async (e) => {
    e.preventDefault();
    if (!msgTexto.trim()) return;
    try {
      await sendSocketMessage(chatGroup._id, msgTexto);
      setMsgTexto('');
    } catch (err) {
      const res = await enviarMensagem(chatGroup._id, msgTexto);
      if (res.success) setMensagens(prev => [...prev, res.data]);
      setMsgTexto('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadFile(file);
      if (res.success) {
        const isImage = file.type.startsWith('image');
        const conteudo = isImage ? `🖼️ ${file.name}` : `📎 ${file.name}`;
        await sendSocketMessage(chatGroup._id, conteudo, isImage ? res.data.url : null);
      }
    } catch (err) {
      console.error('Erro ao enviar ficheiro:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEntrarGrupo = async (grupo) => {
    try {
      const res = await solicitarEntrada(grupo._id);
      if (res.success) {
        if (res.message) alert(res.message);
        if (res.data) setGruposDetalhe(prev => ({ ...prev, [grupo._id]: { ...prev[grupo._id], ...res.data } }));
      }
      carregarDados();
    } catch (err) {
      console.error('Erro ao entrar no grupo:', err);
    }
  };

  const handleAprovar = async (grupoId, usuarioId) => {
    try {
      await aprovarMembro(grupoId, usuarioId);
      carregarMensagens(grupoId);
      carregarDados();
    } catch (err) {
      console.error('Erro ao aprovar membro:', err);
    }
  };

  const handleRemover = async (grupoId, usuarioId) => {
    if (!window.confirm('Remover este membro?')) return;
    try {
      await removerMembro(grupoId, usuarioId);
      carregarMensagens(grupoId);
      carregarDados();
    } catch (err) {
      console.error('Erro ao remover membro:', err);
    }
  };

  const handleAlterarCargo = async (grupoId, usuarioId, cargo) => {
    try {
      await alterarCargo(grupoId, usuarioId, cargo);
      carregarDados();
      if (chatGroup?._id === grupoId) {
        const g = gruposDetalhe[grupoId];
        setGruposDetalhe(prev => ({ ...prev, [grupoId]: { ...prev[grupoId] } }));
      }
    } catch (err) {
      console.error('Erro ao alterar cargo:', err);
    }
  };

  const openGroupSettings = () => {
    const g = gruposDetalhe[chatGroup._id] || chatGroup;
    setEditGroupData({ nome: g.nome || '', descricao: g.descricao || '', foto: g.foto || '' });
    setShowGroupSettings(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    try {
      await atualizarGrupo(chatGroup._id, editGroupData);
      setShowGroupSettings(false);
      carregarDados();
    } catch (err) {
      console.error('Erro ao actualizar grupo:', err);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Tens a certeza? Esta acção não pode ser desfeita.')) return;
    if (!window.confirm('Todos os membros serão removidos. Confirmas?')) return;
    try {
      await eliminarGrupo(chatGroup._id);
      setShowGroupSettings(false);
      voltarGrupos();
      carregarDados();
    } catch (err) {
      console.error('Erro ao eliminar grupo:', err);
    }
  };

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!postTitulo.trim() || !postConteudo.trim()) return;
    try {
      setSubmittingPost(true);
      const tags = postTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await criarPost({
        titulo: postTitulo,
        conteudo: postConteudo,
        tipo: postTipo,
        grupo: postGrupo || undefined,
        tags
      });
      if (res.success) {
        setPosts(prev => [res.data || res.post, ...prev]);
        setPostTitulo('');
        setPostConteudo('');
        setPostTags('');
        setPostGrupo('');
        setShowPostBox(false);
      }
    } catch (err) {
      console.error('Erro ao publicar:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

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

  const handleCriarGrupo = async (e) => {
    e.preventDefault();
    if (!newGroup.nome.trim()) return;
    try {
      const res = await criarGrupo(newGroup);
      if (res.success) {
        setGrupos(prev => [...prev, res.data]);
        setShowCriarGrupo(false);
        setNewGroup({ nome: '', descricao: '', categoria: 'geral' });
      }
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.titulo || '').toLowerCase().includes(q) ||
           (p.conteudo || '').toLowerCase().includes(q) ||
           (p.tags || []).some(t => t.toLowerCase().includes(q));
  });

  const userId = user?.userId || user?._id || user?.id;

  const getUserId = (m) => {
    if (!m?.usuarioId) return null;
    return typeof m.usuarioId === 'object' ? (m.usuarioId._id || m.usuarioId.toString()) : m.usuarioId.toString();
  };

  const getUserName = (m) => {
    if (!m?.usuarioId) return 'Desconhecido';
    if (typeof m.usuarioId === 'object') return m.usuarioId.username || m.usuarioId.profile?.nome || 'Anónimo';
    return m.usuarioId.toString().substring(0, 6);
  };

  const ehAdmin = (grupo) => {
    if (!userId || !grupo?._id) return false;
    const g = gruposDetalhe[grupo._id] || grupo;
    return g.membros?.some(m => {
      const uid = getUserId(m);
      return uid === userId && (m.cargo === 'admin' || m.cargo === 'moderador');
    }) || g.criador === user?.username;
  };

  const ehMembro = (grupo) => {
    if (!userId) return false;
    const g = gruposDetalhe[grupo._id] || grupo;
    return g.membros?.some(m => getUserId(m) === userId);
  };

  const renderMensagem = (msg, index) => {
    const isSistema = msg.tipo === 'sistema';
    const isMine = msg.usuarioId?._id === userId || msg.usuarioId === userId;

    if (isSistema) {
      return (
        <div key={msg._id || index} style={{
          textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)',
          padding: '4px 0', fontStyle: 'italic'
        }}>
          {msg.conteudo}
        </div>
      );
    }

    return (
      <div key={msg._id || index} style={{
        display: 'flex', gap: '8px', justifyContent: isMine ? 'flex-end' : 'flex-start',
        marginBottom: '8px'
      }}>
        {!isMine && (
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0
          }}>
            {(msg.usuarioId?.username || msg.usuarioId?.profile?.nome || 'A').charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{
          maxWidth: '75%', padding: '8px 14px', borderRadius: '12px',
          background: isMine ? 'var(--primary)' : 'var(--bg-card)',
          color: isMine ? 'white' : 'var(--text-color)',
          fontSize: '0.85rem', lineHeight: 1.4,
          borderBottomRightRadius: isMine ? '4px' : '12px',
          borderBottomLeftRadius: isMine ? '12px' : '4px'
        }}>
          {!isMine && (
            <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '2px', color: 'var(--text-secondary)' }}>
              {msg.usuarioId?.username || msg.usuarioId?.profile?.nome || 'Anónimo'}
            </div>
          )}
          {msg.tipo === 'imagem' && msg.imagemUrl ? (
            <div>
              <img src={msg.imagemUrl} alt="Imagem" style={{
                maxWidth: '200px', maxHeight: '200px', borderRadius: '8px',
                cursor: 'pointer', display: 'block'
              }} onClick={() => window.open(msg.imagemUrl, '_blank')} />
              {msg.conteudo !== '🖼️' && <div style={{ marginTop: '4px' }}>{msg.conteudo}</div>}
            </div>
          ) : (
            <div>{msg.conteudo}</div>
          )}
          <div style={{
            fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '2px'
          }}>
            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
        {isMine && (
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0
          }}>
            {(user?.username || 'A').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  const renderChat = () => {
    const g = gruposDetalhe[chatGroup._id] || chatGroup;
    const pedidos = g.pedidosPendentes || [];
    const membros = g.membros || [];
    const isAdmin = ehAdmin(chatGroup);
    const isMember = ehMembro(chatGroup);
    const jaPediu = pedidos.some(p => getUserId(p) === userId);

    if (!isMember) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 200px)', textAlign: 'center', padding: '40px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🔒</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-color)' }}>
            Grupo Privado
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '400px' }}>
            {jaPediu
              ? 'Já solicitaste entrada neste grupo. Aguarda a aprovação do administrador.'
              : 'Este grupo é privado. Solicita entrada ao administrador para ver as conversas.'}
          </p>
          {jaPediu ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              background: 'rgba(245,166,35,0.1)', borderRadius: 'var(--radius)',
              color: 'var(--accent-dark)', fontSize: '0.85rem'
            }}>
              <Clock size={18} /> Pedido enviado — aguarda aprovação
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => handleEntrarGrupo(chatGroup)}>
              <LogIn size={18} /> Solicitar Entrada
            </button>
          )}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 200px)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)', borderRadius: 'var(--radius) var(--radius) 0 0'
          }}>
            <button className="btn btn-ghost btn-sm" onClick={voltarGrupos}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, overflow: 'hidden',
                background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {g.foto ? <img src={g.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👥'}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{chatGroup.nome}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {membros.length} membro{membros.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isAdmin && (
                <button className="btn btn-ghost btn-sm" onClick={openGroupSettings} title="Configurações do grupo">
                  <Settings size={16} />
                </button>
              )}
              {!isMember && (
                <button className="btn btn-primary btn-sm" onClick={() => handleEntrarGrupo(chatGroup)}>
                  <LogIn size={14} /> Solicitar Entrada
                </button>
              )}
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            background: 'var(--bg-body)', borderRadius: '0 0 var(--radius) var(--radius)'
          }}>
            {loadingMsgs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader className="spinner" />
              </div>
            ) : mensagens.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontSize: '0.85rem' }}>
                Nenhuma mensagem ainda. {isMember ? 'Envia a primeira mensagem!' : 'Entra no grupo para participar.'}
              </p>
            ) : (
              mensagens.map(renderMensagem)
            )}
            <div ref={chatEndRef} />
          </div>

          {isMember && (
            <form onSubmit={handleEnviarMsg} style={{
              display: 'flex', gap: '8px', padding: '12px 16px',
              borderTop: '1px solid var(--border)', background: 'var(--bg-card)'
            }}>
              <input type="text" className="input" placeholder="Escrever mensagem..."
                value={msgTexto} onChange={e => setMsgTexto(e.target.value)}
                style={{ flex: 1 }} />
              <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
              <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}
                disabled={uploading} title="Anexar ficheiro">
                {uploading ? <Loader size={16} className="spinner" /> : <Paperclip size={16} />}
              </button>
              <button type="submit" className="btn btn-primary" disabled={!msgTexto.trim()}>
                <Send size={16} />
              </button>
            </form>
          )}
        </div>

        <div style={{
          width: '240px', background: 'var(--bg-card)', borderRadius: 'var(--radius)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
          flexShrink: 0, overflowY: 'auto'
        }}>
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Membros ({membros.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {membros.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem',
                  background: m.cargo === 'admin' ? 'rgba(34,197,94,0.1)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'var(--bg-body)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-secondary)'
                    }}>
                      {getUserName(m).charAt(0).toUpperCase()}
                    </div>
                    <span>{getUserName(m)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {m.cargo === 'admin' && <Crown size={12} style={{ color: 'var(--accent)' }} />}
                    {m.cargo === 'moderador' && <Shield size={12} style={{ color: '#06b6d4' }} />}
                    {isAdmin && getUserId(m) !== userId && (
                      <>
                        {m.cargo === 'admin' ? (
                          <button onClick={() => handleAlterarCargo(chatGroup._id, getUserId(m), 'membro')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', fontSize: '0.6rem' }}
                            title="Remover admin">
                            <UserX size={12} />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => handleAlterarCargo(chatGroup._id, getUserId(m), 'admin')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '2px' }}
                              title="Tornar admin">
                              <Crown size={12} />
                            </button>
                            <button onClick={() => handleRemover(chatGroup._id, getUserId(m))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                              title="Remover do grupo">
                              <UserX size={12} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && pedidos.length > 0 && (
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--accent)' }}>
                Pedidos Pendentes ({pedidos.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {pedidos.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem',
                    background: 'rgba(245,166,35,0.1)'
                  }}>
                    <span>{getUserName(p)}</span>
                    <button onClick={() => handleAprovar(chatGroup._id, getUserId(p))}
                      className="btn btn-primary btn-sm" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                      <UserCheck size={12} /> Aprovar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          {(post.conteudo || '').substring(0, 300)}{(post.conteudo || '').length > 300 ? '...' : ''}
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

  if (chatGroup) {
    return (<>
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            💬 {chatGroup.nome}
          </h1>
        </div>
        {renderChat()}
      </div>

      {showGroupSettings && (
        <div className="modal-overlay" onClick={() => setShowGroupSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚙️ Configurações do Grupo</h2>
              <button className="modal-close" onClick={() => setShowGroupSettings(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveGroup} style={{ display: 'grid', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Nome do Grupo</label>
                <input type="text" className="input" required
                  value={editGroupData.nome}
                  onChange={e => setEditGroupData(prev => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Descrição</label>
                <textarea className="input" rows={3}
                  value={editGroupData.descricao}
                  onChange={e => setEditGroupData(prev => ({ ...prev, descricao: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '16px',
                  background: editGroupData.foto ? 'transparent' : 'var(--bg-body)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', overflow: 'hidden', flexShrink: 0,
                  border: '2px dashed var(--border)'
                }}>
                  {editGroupData.foto ? (
                    <img src={editGroupData.foto} alt="Group" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '👥'}
                </div>
                <div>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => document.getElementById('groupFotoInput').click()}>
                    <Camera size={14} /> {editGroupData.foto ? 'Alterar Foto' : 'Adicionar Foto'}
                  </button>
                  <input id="groupFotoInput" type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const res = await uploadFile(file);
                        if (res.success) setEditGroupData(prev => ({ ...prev, foto: res.data.url }));
                      } catch (err) { console.error(err); }
                    }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Edit3 size={14} /> Salvar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteGroup}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Trash2 size={14} /> Eliminar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
    );
  }

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
        <button className={`tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>Feed</button>
        <button className={`tab ${tab === 'grupos' ? 'active' : ''}`} onClick={() => setTab('grupos')}>Grupos</button>
      </div>

      {tab === 'feed' && (
        <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
          <div>

            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)',
              padding: '16px', marginBottom: '16px',
              border: '1px solid var(--border)'
            }}>
              {!showPostBox ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0
                  }}>
                    {(user?.username || 'A').charAt(0).toUpperCase()}
                  </div>
                  <input type="text" className="input" placeholder="O que estás a pensar?" readOnly
                    onClick={() => setShowPostBox(true)}
                    style={{ flex: 1, cursor: 'pointer' }} />
                </div>
              ) : (
                <form onSubmit={handlePublicar} style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0
                    }}>
                      {(user?.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <input type="text" className="input" placeholder="Título" required
                      value={postTitulo} onChange={e => setPostTitulo(e.target.value)}
                      style={{ flex: 1 }} />
                  </div>
                  <textarea className="input" placeholder="Escreve o teu artigo, pergunta ou dica..." rows={4} required
                    value={postConteudo} onChange={e => setPostConteudo(e.target.value)} />
                  <div className="grid-2" style={{ gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select className="input" value={postTipo}
                        onChange={e => setPostTipo(e.target.value)}
                        style={{ width: 'auto', minWidth: '120px' }}>
                        <option value="post">Post</option>
                        <option value="artigo">Artigo</option>
                        <option value="pergunta">Pergunta</option>
                        <option value="dica">Dica</option>
                      </select>
                      <input type="text" className="input" placeholder="Tags (ex: milho, pragas)"
                        value={postTags} onChange={e => setPostTags(e.target.value)}
                        style={{ flex: 1 }} />
                    </div>
                    <select className="input" value={postGrupo}
                      onChange={e => setPostGrupo(e.target.value)}>
                      <option value="">Sem grupo (público)</option>
                      {grupos.map((g, i) => (
                        <option key={i} value={g.nome || g._id}>{g.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => { setShowPostBox(false); setPostTitulo(''); setPostConteudo(''); setPostTags(''); setPostGrupo(''); }}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submittingPost}>
                      {submittingPost ? <Loader size={16} className="spinner" /> : <Plus size={16} />}
                      {submittingPost ? 'A publicar...' : 'Publicar'}
                    </button>
                  </div>
                </form>
              )}
            </div>

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
                {search ? 'Nenhuma publicação encontrada.' : 'Nenhuma publicação ainda. Publica algo acima!'}
              </p>
            ) : (
              filteredPosts.map(renderPost)
            )}
          </div>

          <div>
            <PrognosCard title="Grupos" icon={<Users size={18} />}>
              {grupos.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>
                  Nenhum grupo ainda
                </p>
              ) : (
                grupos.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 0', borderBottom: i < grupos.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer'
                  }} onClick={() => abrirChat(g)}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, overflow: 'hidden',
                      background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>
                      {g.foto ? <img src={g.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👥'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.nome}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{g.totalMembros || 0} membros</div>
                    </div>
                    <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Privado</span>
                  </div>
                ))
              )}
              <button className="btn btn-sm btn-ghost" style={{ width: '100%', marginTop: '8px' }}
                onClick={() => setTab('grupos')}>
                Ver todos os grupos
              </button>
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
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} encontrado{grupos.length !== 1 ? 's' : ''}
            </p>
            <button className="btn btn-primary" onClick={() => setShowCriarGrupo(true)}>
              <Plus size={16} /> Criar Grupo
            </button>
          </div>
          <div className="grid-3">
            {grupos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                Nenhum grupo encontrado. Cria o primeiro grupo!
              </p>
            ) : (
                grupos.map((g, i) => (
                  <div key={g._id || i} className="forum-post" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px', marginBottom: '8px', overflow: 'hidden',
                      background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                    }}>
                      {g.foto ? <img src={g.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👥'}
                    </div>
                  <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{g.nome}</h3>
                  {g.descricao && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {g.descricao}
                    </p>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {g.totalPosts || 0} publicações • {g.totalMembros || 0} membros
                    <span className="badge badge-accent" style={{ marginLeft: '8px' }}>Privado</span>
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => abrirChat(g)}>
                      <MessageCircle size={14} /> Chat
                    </button>
                    {!ehMembro(g) && (
                      <button className="btn btn-sm btn-outline" onClick={() => handleEntrarGrupo(g)}>
                        <LogIn size={14} /> Solicitar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showCriarGrupo && (
        <div className="modal-overlay" onClick={() => setShowCriarGrupo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">👥 Criar Grupo</h2>
              <button className="modal-close" onClick={() => setShowCriarGrupo(false)}>✕</button>
            </div>
            <form onSubmit={handleCriarGrupo} style={{ display: 'grid', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Nome do Grupo</label>
                <input type="text" className="input" placeholder="Ex: Agricultores do Bié" required
                  value={newGroup.nome} onChange={e => setNewGroup(prev => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Descrição</label>
                <textarea className="input" placeholder="Descreva o propósito do grupo..." rows={3}
                  value={newGroup.descricao} onChange={e => setNewGroup(prev => ({ ...prev, descricao: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select className="input" value={newGroup.categoria}
                  onChange={e => setNewGroup(prev => ({ ...prev, categoria: e.target.value }))}>
                  <option value="geral">Geral</option>
                  <option value="culturas">Culturas</option>
                  <option value="pecuaria">Pecuária</option>
                  <option value="pragas">Pragas e Doenças</option>
                  <option value="mercado">Mercado</option>
                  <option value="tecnologia">Tecnologia</option>
                </select>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
                🔒 Grupo privado — membros precisam de aprovação do administrador
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Criar Grupo</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCriarGrupo(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
