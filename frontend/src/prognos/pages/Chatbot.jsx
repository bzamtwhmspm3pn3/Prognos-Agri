import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Bot, User, Sparkles, Loader } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { enviarMensagem, getHistorico, deletarSessao } from '../../services/chatbotService';
import { usePrognos } from '../contexts/PrognosContext';

export default function Chatbot() {
  const { user } = usePrognos();
  const [mensagens, setMensagens] = useState([
    { papel: 'assistant', conteudo: '👋 Olá! Sou o assistente virtual do Prognos Agri. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessoes, setSessoes] = useState([]);
  const [sessaoAtiva, setSessaoAtiva] = useState(null);
  const messagesEndRef = useRef(null);

  const carregarSessoes = async () => {
    try {
      const res = await getHistorico();
      if (res.success) setSessoes(res.data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  useEffect(() => {
    carregarSessoes();
  }, []);

  const sugestoes = [
    'Como detectar pragas?',
    'Previsão do tempo para esta semana',
    'Quais os preços do milho?',
    'Dicas de plantio para Angola'
  ];

  const enviarMensagemApi = async (texto) => {
    if (!texto.trim()) return;

    const userMsg = { papel: 'user', conteudo: texto };
    setMensagens(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await enviarMensagem(texto, sessaoAtiva);
      if (res.success) {
        setMensagens(prev => [...prev, { papel: 'assistant', conteudo: res.data.mensagem }]);
        if (res.data.sessaoId && res.data.sessaoId !== sessaoAtiva) {
          setSessaoAtiva(res.data.sessaoId);
          carregarSessoes();
        }
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setMensagens(prev => [...prev, {
        papel: 'assistant',
        conteudo: '❌ Não foi possível obter resposta. Verifica a tua ligação.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarSessao = async (id) => {
    try {
      await deletarSessao(id);
      setSessoes(prev => prev.filter(s => s._id !== id));
      if (sessaoAtiva === id) {
        setSessaoAtiva(null);
        setMensagens([{ papel: 'assistant', conteudo: '👋 Olá! Como posso ajudar hoje?' }]);
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
    }
  };

  const handleNovaConversa = () => {
    setSessaoAtiva(null);
    setMensagens([{ papel: 'assistant', conteudo: '👋 Olá! Como posso ajudar hoje?' }]);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
          🤖 Assistente Virtual
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Chatbot inteligente para responder às suas dúvidas agrícolas
        </p>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        <PrognosCard title="" padding={false}>
          <div className="chat-container">
            <div className="chat-messages">
              {mensagens.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.papel}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {msg.papel === 'assistant' ? (
                      <Bot size={14} style={{ opacity: 0.7 }} />
                    ) : (
                      <User size={14} style={{ opacity: 0.7 }} />
                    )}
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.7 }}>
                      {msg.papel === 'assistant' ? 'Prognos Agri' : 'Você'}
                    </span>
                  </div>
                  {msg.conteudo.split('\n').map((line, j) => (
                    <p key={j} style={{ margin: '2px 0', lineHeight: 1.5 }}>{line}</p>
                  ))}
                </div>
              ))}
              {loading && (
                <div className="chat-message assistant">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', margin: 0, borderWidth: '2px' }} />
                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>A pensar...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                className="input"
                placeholder="Digite a sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensagemApi(input)}
              />
              <button
                className="btn btn-primary"
                onClick={() => enviarMensagemApi(input)}
                disabled={!input.trim() || loading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </PrognosCard>

        <div>
          <PrognosCard title="Sugestões" icon={<Sparkles size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sugestoes.map((sug, i) => (
                <button
                  key={i}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                  onClick={() => enviarMensagemApi(sug)}
                >
                  <MessageCircle size={16} />
                  {sug}
                </button>
              ))}
            </div>
          </PrognosCard>

          <PrognosCard title="Histórico de Conversas" icon={<MessageCircle size={18} />} style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-sm btn-ghost" onClick={handleNovaConversa}
                style={{ justifyContent: 'center', width: '100%' }}>
                + Nova Conversa
              </button>
              {sessoes.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  Nenhuma conversa anterior
                </div>
              ) : (
                sessoes.map((s, i) => (
                  <div key={s._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', fontSize: '0.85rem'
                  }} onClick={() => {
                    setSessaoAtiva(s._id);
                    setMensagens(prev => [...prev, { papel: 'assistant', conteudo: `A carregar conversa: ${s.titulo}...` }]);
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {s.titulo}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDeletarSessao(s._id); }}
                      style={{ padding: '4px', color: '#ef4444' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </PrognosCard>
        </div>
      </div>
    </div>
  );
}
