import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import PrognosCard from '../components/PrognosCard';

export default function Chatbot() {
  const [mensagens, setMensagens] = useState([
    { papel: 'assistant', conteudo: '👋 Olá! Sou o assistente virtual do Prognos Agri. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const sugestoes = [
    'Como detectar pragas?',
    'Previsão do tempo para esta semana',
    'Quais os preços do milho?',
    'Dicas de plantio para Angola'
  ];

  const gerarResposta = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('praga') || lower.includes('inseto')) {
      return 'Compreendo a sua preocupação com pragas! 🐛\n\nRecomendações:\n1. Utilize o sistema de detecção do Prognos Agri\n2. Faça vistorias regulares nas culturas\n3. Para lagarta-do-cartucho: use Bacillus thuringiensis\n4. Mantenha o registo de ocorrências\n\nDeseja mais informações sobre alguma praga específica?';
    }
    if (lower.includes('clima') || lower.includes('tempo') || lower.includes('chuva') || lower.includes('temperatura')) {
      return '📊 Sobre as condições climáticas:\n\n• A temperatura ideal para culturas agrícolas em Angola é entre 20°C e 35°C\n• Época chuvosa: Outubro a Abril\n• Consulte o módulo de Previsão Climática para dados detalhados\n• Configure alertas para condições extremas\n\nQuer que verifique a previsão para a sua região?';
    }
    if (lower.includes('preço') || lower.includes('preco') || lower.includes('vender') || lower.includes('comprar') || lower.includes('mercado') || lower.includes('milho')) {
      return '📈 Mercado Agrícola em Tempo Real:\n\nPreços médios actuais:\n• 🌽 Milho: 250 Kz/kg\n• 🫘 Feijão: 500 Kz/kg\n• 🌱 Mandioca: 150 Kz/kg\n• 🍅 Tomate: 350 Kz/kg\n\nAceda ao módulo Mercado para publicar ofertas ou encontrar compradores na sua região!';
    }
    if (lower.includes('plant') || lower.includes('cultivar') || lower.includes('semente') || lower.includes('colheita')) {
      return '🌱 Recomendações de Plantio:\n\nCulturas recomendadas para esta época:\n• Milho: Plantar no início das chuvas\n• Feijão: 2-3 semanas após o milho\n• Mandioca: Pode plantar todo o ano com irrigação\n\nDicas:\n• Analise o pH do solo (ideal: 5.5-7.0)\n• Use adubação orgânica\n• Planeie rotação de culturas\n\nUse o módulo de Previsão para recomendações personalizadas!';
    }
    return 'Olá! Sou o assistente do Prognos Agri. 🤖\n\nPosso ajudar com:\n🔍 Detecção de pragas\n🌤️ Previsão climática\n📈 Mercado agrícola\n🌱 Recomendações de plantio\n🔗 Rastreabilidade\n\nSobre o que gostaria de saber?';
  };

  const enviarMensagem = (texto) => {
    if (!texto.trim()) return;

    setMensagens(prev => [...prev, { papel: 'user', conteudo: texto }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const resposta = gerarResposta(texto);
      setMensagens(prev => [...prev, { papel: 'assistant', conteudo: resposta }]);
      setLoading(false);
    }, 800);
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
                onKeyPress={(e) => e.key === 'Enter' && enviarMensagem(input)}
              />
              <button
                className="btn btn-primary"
                onClick={() => enviarMensagem(input)}
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
                  onClick={() => enviarMensagem(sug)}
                >
                  <MessageCircle size={16} />
                  {sug}
                </button>
              ))}
            </div>
          </PrognosCard>

          <PrognosCard title="Histórico de Conversas" icon={<MessageCircle size={18} />} style={{ marginTop: '16px' }}>
            <div className="empty-state" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                As suas conversas serão guardadas automaticamente.
              </div>
            </div>
          </PrognosCard>
        </div>
      </div>
    </div>
  );
}
