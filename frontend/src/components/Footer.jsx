// src/components/Footer.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Github, Linkedin, Mail, MapPin, Phone, Globe, 
  Facebook, Twitter, Instagram, ExternalLink, MessageCircle,
  Star, ThumbsUp, ThumbsDown, X, Send, Bot, HelpCircle,
  FileText, Shield, Lock, ChevronRight
} from 'lucide-react';

// IMPORTANDO AS IMAGENS REAIS
import logoPnud from '../assets/parceiros/PNUD.jpeg';
import logoGoverno from '../assets/parceiros/governo-angola.png';
import logoAceleraAngola from '../assets/parceiros/acelera.jpeg';
import logoAceleraAgro from '../assets/parceiros/acelera-agro.png';
import logoTimbuktoo from '../assets/parceiros/timbuktoo.png';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8'
};

// ===== AVALIAÇÃO MODAL =====
function AvaliacaoModal({ isOpen, onClose }) {
  const [avaliacao, setAvaliacao] = useState(null);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false);

  const handleEnviar = () => {
    if (avaliacao) {
      setEnviado(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#999'
          }}
        >
          <X size={24} />
        </button>

        {!enviado ? (
          <>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: cores.verdeAlface,
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Avalia-nos ⭐
            </h2>
            
            <p style={{ 
              textAlign: 'center', 
              color: '#666',
              marginBottom: '30px'
            }}>
              A tua opinião é importante para melhorarmos
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvaliacao(star)}
                  style={{
                    cursor: 'pointer',
                    color: star <= (avaliacao || 0) ? '#FFD700' : '#E0E0E0'
                  }}
                >
                  <Star size={40} fill={star <= (avaliacao || 0) ? '#FFD700' : 'none'} />
                </motion.div>
              ))}
            </div>

            <textarea
              placeholder="Deixa o teu comentário (opcional)..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '15px',
                border: `2px solid ${cores.verdeClaro}`,
                marginBottom: '20px',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMostrarChat(true)}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: cores.verdeClaro,
                  color: cores.verdeAlface,
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Bot size={20} /> Chat
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnviar}
                disabled={!avaliacao}
                style={{
                  flex: 2,
                  padding: '15px',
                  background: avaliacao ? cores.verdePimenta : '#E0E0E0',
                  color: avaliacao ? cores.verdeAlface : '#999',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: avaliacao ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={20} /> Enviar Avaliação
              </motion.button>
            </div>

            <AnimatePresence>
              {mostrarChat && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: '#F5F5F5',
                    borderRadius: '15px'
                  }}
                >
                  <h3 style={{ marginBottom: '10px', color: cores.verdeAlface }}>
                    Chat de Suporte 🤖
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                    Como podemos ajudar?
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Digite a sua mensagem..."
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #DDD'
                      }}
                    />
                    <button style={{
                      padding: '10px 15px',
                      background: cores.verdePimenta,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <Send size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: cores.verdePimenta,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Heart size={40} color="white" fill="white" />
            </div>
            <h3 style={{ color: cores.verdeAlface, fontSize: '1.5rem', marginBottom: '10px' }}>
              Obrigado!
            </h3>
            <p style={{ color: '#666' }}>
              A tua avaliação foi recebida com sucesso.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ===== CHATBOT MODAL =====
function ChatbotModal({ isOpen, onClose }) {
  const [mensagens, setMensagens] = useState([
    { tipo: 'bot', texto: 'Olá! Como posso ajudar? 🤖' }
  ]);
  const [input, setInput] = useState('');

  const respostas = {
    'oi': 'Olá! Como estás?',
    'olá': 'Olá! Como estás?',
    'ajuda': 'Claro! Sobre o que precisas de ajuda?',
    'preço': 'Os preços variam conforme o plano. Queres que um consultor te contacte?',
    'contacto': 'Podes contactar-nos pelo +244 900 000 000 ou geral@agrookuvanja.ao',
    'praga': 'Temos soluções IA para detecção de pragas com 98% de precisão!',
    'roedores': 'Para roedores, temos armadilhas inteligentes e monitoramento 24/7.',
    'aves': 'Para aves, usamos dissuasores sonoros e redes de proteção.',
    'demo': 'Queres agendar uma demonstração? É grátis!',
    'obrigado': 'De nada! Estamos aqui para ajudar 🌱',
    'tchau': 'Até breve! Qualquer dúvida, estamos aqui.'
  };

  const enviarMensagem = () => {
    if (!input.trim()) return;

    setMensagens([...mensagens, { tipo: 'user', texto: input }]);

    setTimeout(() => {
      const resposta = respostas[input.toLowerCase()] || 
        'Desculpa, não entendi. Podes reformular? Ou contacta-nos por telefone.';
      setMensagens(prev => [...prev, { tipo: 'bot', texto: resposta }]);
    }, 1000);

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        height: '500px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${cores.verdeAlface}, ${cores.verdePimenta})`,
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={24} />
          <span style={{ fontWeight: 'bold' }}>Assistente AGROOKUVANJA</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mensagens.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.tipo === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <div style={{
              background: msg.tipo === 'user' ? cores.verdePimenta : '#F0F0F0',
              color: msg.tipo === 'user' ? 'white' : '#333',
              padding: '10px 15px',
              borderRadius: msg.tipo === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
              fontSize: '0.9rem'
            }}>
              {msg.texto}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '15px', borderTop: '1px solid #EEE', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
          placeholder="Digite a sua mensagem..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${cores.verdeClaro}`,
            outline: 'none'
          }}
        />
        <button
          onClick={enviarMensagem}
          style={{
            padding: '10px 15px',
            background: cores.verdePimenta,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
}

// ===== AJUDA MODAL (RENOMEADO PARA EVITAR CONFLITO) =====
function ModalAjuda({ isOpen, onClose }) {
  const [mostrarChat, setMostrarChat] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', color: cores.verdeAlface, marginBottom: '20px' }}>Central de Ajuda</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: cores.verdePimenta, marginBottom: '10px' }}>Perguntas Frequentes</h3>
          {[
            'Como funciona a detecção de pragas?',
            'Quanto custa o serviço?',
            'Preciso de equipamento especial?',
            'Como entro em contacto?'
          ].map((item, index) => (
            <div key={index} style={{ padding: '10px', borderBottom: '1px solid #EEE', cursor: 'pointer' }}>
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={() => setMostrarChat(true)}
          style={{
            width: '100%',
            padding: '15px',
            background: cores.verdePimenta,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <Bot size={20} /> Falar com Assistente
        </button>

        <AnimatePresence>
          {mostrarChat && <ChatbotModal isOpen={mostrarChat} onClose={() => setMostrarChat(false)} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ===== TERMOS MODAL =====
function TermosModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', color: cores.verdeAlface, marginBottom: '20px' }}>Termos de Uso</h2>
        
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p><strong>1. Aceitação dos Termos</strong></p>
          <p>Ao aceder à plataforma AGROOKUVANJA, concorda com estes termos.</p>
          
          <p><strong>2. Uso do Serviço</strong></p>
          <p>A plataforma destina-se à detecção e gestão de pragas agrícolas.</p>
          
          <p><strong>3. Privacidade</strong></p>
          <p>Os dados dos utilizadores são tratados conforme a nossa política de privacidade.</p>
          
          <p><strong>4. Responsabilidades</strong></p>
          <p>A AGROOKUVANJA não se responsabiliza por decisões baseadas nas recomendações da IA.</p>
          
          <p><strong>5. Modificações</strong></p>
          <p>Reservamo-nos o direito de modificar estes termos a qualquer momento.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== PRIVACIDADE MODAL =====
function PrivacidadeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', color: cores.verdeAlface, marginBottom: '20px' }}>Política de Privacidade</h2>
        
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p><strong>1. Dados Recolhidos</strong></p>
          <p>Nome, email, telefone, imagens das plantações, dados de localização.</p>
          
          <p><strong>2. Uso dos Dados</strong></p>
          <p>Os dados são usados para melhorar os algoritmos de detecção e personalizar recomendações.</p>
          
          <p><strong>3. Proteção</strong></p>
          <p>Todos os dados são criptografados e armazenados em servidores seguros.</p>
          
          <p><strong>4. Compartilhamento</strong></p>
          <p>Não compartilhamos dados pessoais com terceiros sem consentimento.</p>
          
          <p><strong>5. Direitos do Utilizador</strong></p>
          <p>Pode solicitar a qualquer momento a exclusão dos seus dados.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== SOLUÇÕES MODAL =====
function SolucoesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', color: cores.verdeAlface, marginBottom: '20px' }}>Nossas Soluções</h2>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {[
            { titulo: 'IA Preditiva', desc: 'Detecção de pragas com 98% de precisão' },
            { titulo: 'Monitoramento 24/7', desc: 'Acompanhamento em tempo real' },
            { titulo: 'Armadilhas Inteligentes', desc: 'Para roedores e aves' },
            { titulo: 'Consultoria Agronómica', desc: 'Especialistas ao seu dispor' }
          ].map((item, index) => (
            <div key={index} style={{
              padding: '15px',
              background: '#F5F5F5',
              borderRadius: '12px',
              cursor: 'pointer'
            }}>
              <h3 style={{ color: cores.verdeAlface, marginBottom: '5px' }}>{item.titulo}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== QUEM SOMOS MODAL =====
function QuemSomosModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', color: cores.verdeAlface, marginBottom: '20px' }}>Sobre Nós</h2>
        
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
          A AGROOKUVANJA é uma startup angolana focada em proteger os agricultores contra pragas 
          através de tecnologia de ponta, combinando IA, IoT e conhecimento local.
        </p>

        <div style={{ display: 'grid', gap: '10px' }}>
          <div><strong>📍 Missão:</strong> Proteger colheitas, alimentar o futuro</div>
          <div><strong>👥 Equipa:</strong> 8 especialistas dedicados</div>
          <div><strong>🏆 Prêmios:</strong> Participante Timbuktoo 2026</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== FOOTER PRINCIPAL =====
export default function Footer() {
  const [mostrarAvaliacao, setMostrarAvaliacao] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPrivacidade, setMostrarPrivacidade] = useState(false);
  const [mostrarSolucoes, setMostrarSolucoes] = useState(false);
  const [mostrarQuemSomos, setMostrarQuemSomos] = useState(false);

  // Parceiros com logos reais
  const parceiros = [
    {
      nome: 'PNUD',
      logo: logoPnud,
      url: 'https://www.undp.org/pt/angola',
      descricao: 'Programa das Nações Unidas para o Desenvolvimento'
    },
    {
      nome: 'Governo de Angola',
      logo: logoGoverno,
      url: 'https://governo.gov.ao',
      descricao: 'República de Angola'
    },
    {
      nome: 'Acelera Angola',
      logo: logoAceleraAngola,
      url: 'https://acelerangola.com',
      descricao: 'Programa de Aceleração de Startups'
    },
    {
      nome: 'Acelera Agro',
      logo: logoAceleraAgro,
      url: 'https://aceleragro.co.ao',
      descricao: 'Programa de Aceleração do Agronegócio'
    }
  ];

  return (
    <>
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        style={{
          backgroundColor: cores.verdeAlface,
          color: 'white',
          padding: '60px 20px 30px',
          marginTop: '80px',
          position: 'relative'
        }}
      >
        {/* Botão Flutuante de Avaliação */}
        <motion.button
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setMostrarAvaliacao(true)}
          style={{
            position: 'absolute',
            top: '-25px',
            right: '30px',
            background: `linear-gradient(135deg, ${cores.verdePimenta}, ${cores.verdeAlface})`,
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10
          }}
        >
          <Star size={20} fill="white" /> Avalia-nos
        </motion.button>

        {/* Botão Flutuante de Chat */}
        <motion.button
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setMostrarChat(true)}
          style={{
            position: 'absolute',
            top: '-25px',
            right: '200px',
            background: cores.verdePimenta,
            color: cores.verdeAlface,
            border: 'none',
            padding: '15px 30px',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10
          }}
        >
          <MessageCircle size={20} /> Chat
        </motion.button>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* ===== TIMBUKTOO DESTAQUE ===== */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '50px',
              padding: '20px',
              background: `linear-gradient(135deg, ${cores.verdePimenta}20, ${cores.verdeAlface}40)`,
              borderRadius: '50px',
              border: `1px solid ${cores.verdePimenta}40`,
              flexWrap: 'wrap'
            }}
          >
            <img 
              src={logoTimbuktoo} 
              alt="Timbuktoo"
              style={{
                height: '50px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            <span style={{ 
              color: cores.verdePimenta,
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              Timbuktoo Agritech Hackathon 2026
            </span>
            <span style={{
              background: cores.verdePimenta,
              color: cores.verdeAlface,
              padding: '5px 15px',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              Participante
            </span>
          </motion.div>
          
          {/* ===== PARCEIROS EM LINHA HORIZONTAL ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '50px',
              textAlign: 'center'
            }}
          >
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 'bold', 
              color: cores.verdePimenta,
              marginBottom: '30px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              Parceiros Institucionais
            </h3>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              padding: '30px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '20px',
              border: `1px solid ${cores.verdePimenta}30`
            }}>
              {parceiros.map((parceiro, index) => (
                <motion.a
                  key={index}
                  href={parceiro.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.05 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: 'white',
                    minWidth: '120px'
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '10px',
                    boxShadow: `0 5px 15px ${cores.verdeAlface}80`,
                    border: `2px solid ${cores.verdePimenta}`
                  }}>
                    <img 
                      src={parceiro.logo} 
                      alt={parceiro.nome}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <span style={{ 
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: cores.verdePimenta
                  }}>
                    {parceiro.nome}
                  </span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.7,
                    textAlign: 'center'
                  }}>
                    {parceiro.descricao}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Grid principal - 3 colunas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
            marginBottom: '50px'
          }}>
            
            {/* Coluna 1 - Sobre */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: cores.verdePimenta }}>
                AGROOKUVANJA
              </h3>
              <p style={{ lineHeight: '1.6', opacity: 0.8, marginBottom: '20px' }}>
                Protegendo colheitas, alimentando o futuro. Tecnologia angolana para detecção e gestão de pragas agrícolas.
              </p>
              
              {/* Selos de participação */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: 'rgba(130, 183, 77, 0.2)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  border: `1px solid ${cores.verdePimenta}`
                }}>
                  🤝 Timbuktoo 2026
                </span>
                <span style={{
                  backgroundColor: 'rgba(130, 183, 77, 0.2)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  border: `1px solid ${cores.verdePimenta}`
                }}>
                  🌱 AgroTech Angola
                </span>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -3 }}
                    style={{
                      cursor: 'pointer',
                      opacity: 0.8,
                      color: 'white',
                      textDecoration: 'none'
                    }}
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Coluna 2 - Links Rápidos (FUNCIONAIS) */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: cores.verdePimenta }}>
                Links Rápidos
              </h4>
              {[
                { nome: 'Quem Somos', action: () => setMostrarQuemSomos(true) },
                { nome: 'Soluções', action: () => setMostrarSolucoes(true) },
                { nome: 'Ajuda', action: () => setMostrarAjuda(true) },
                { nome: 'Termos de Uso', action: () => setMostrarTermos(true) },
                { nome: 'Privacidade', action: () => setMostrarPrivacidade(true) }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 5 }}
                  onClick={item.action}
                  style={{
                    display: 'block',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    opacity: 0.8,
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  {item.nome}
                </motion.button>
              ))}
            </motion.div>

            {/* Coluna 3 - Contactos (FUNCIONAIS) */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: cores.verdePimenta }}>
                Contactos
              </h4>
              {[
                { icon: <MapPin size={16} />, text: 'Luanda, Angola', action: () => window.open('https://maps.google.com/?q=Luanda,Angola', '_blank') },
                { icon: <Phone size={16} />, text: '+244 900 000 000', action: () => window.location.href = 'tel:+244900000000' },
                { icon: <Mail size={16} />, text: 'geral@agrookuvanja.ao', action: () => window.location.href = 'mailto:geral@agrookuvanja.ao' },
                { icon: <Globe size={16} />, text: 'www.agrookuvanja.ao', action: () => window.open('https://www.agrookuvanja.ao', '_blank') }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 5 }}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '15px',
                    opacity: 0.8,
                    color: 'white',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ color: cores.verdePimenta }}>{item.icon}</span>
                  <span>{item.text}</span>
                </motion.button>
              ))}

              {/* Horário de funcionamento */}
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '10px'
              }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '5px', color: cores.verdePimenta }}>
                  Atendimento
                </p>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                  Seg - Sex: 08:00 - 18:00
                </p>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                  Sáb: 09:00 - 13:00
                </p>
              </div>
            </motion.div>
          </div>

          {/* Linha divisória animada */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${cores.verdePimenta}, transparent)`,
              marginBottom: '30px'
            }}
          />

          {/* Copyright e créditos */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '0.9rem',
              opacity: 0.7
            }}
          >
            <span>© 2026 AGROOKUVANJA. Todos os direitos reservados.</span>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                Criado com <Heart size={16} color={cores.verdePimenta} fill={cores.verdePimenta} />
              </span>
              <span>|</span>
              <span>v1.0.0</span>
            </div>
          </motion.div>

          {/* Badges de tecnologia */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.6 }}
            style={{
              marginTop: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div style={{
              padding: '8px 20px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '50px',
              display: 'flex',
              gap: '20px',
              fontSize: '0.8rem'
            }}>
              <span>⚛️ React</span>
              <span>🎨 Framer Motion</span>
              <span>🤖 Machine Learning</span>
            </div>
          </motion.div>

          {/* Mensagem honesta de participação */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              textAlign: 'center',
              marginTop: '30px',
              fontSize: '0.85rem',
              opacity: 0.5,
              fontStyle: 'italic',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            AGROOKUVANJA participa do Timbuktoo Agritech Hackathon 2026 apresentando 
            uma solução inovadora para detecção de pragas na agricultura angolana.
          </motion.p>
        </div>
      </motion.footer>

      {/* Modais */}
      <AnimatePresence>
        {mostrarAvaliacao && <AvaliacaoModal isOpen={mostrarAvaliacao} onClose={() => setMostrarAvaliacao(false)} />}
        {mostrarChat && <ChatbotModal isOpen={mostrarChat} onClose={() => setMostrarChat(false)} />}
        {mostrarAjuda && <ModalAjuda isOpen={mostrarAjuda} onClose={() => setMostrarAjuda(false)} />}
        {mostrarTermos && <TermosModal isOpen={mostrarTermos} onClose={() => setMostrarTermos(false)} />}
        {mostrarPrivacidade && <PrivacidadeModal isOpen={mostrarPrivacidade} onClose={() => setMostrarPrivacidade(false)} />}
        {mostrarSolucoes && <SolucoesModal isOpen={mostrarSolucoes} onClose={() => setMostrarSolucoes(false)} />}
        {mostrarQuemSomos && <QuemSomosModal isOpen={mostrarQuemSomos} onClose={() => setMostrarQuemSomos(false)} />}
      </AnimatePresence>
    </>
  );
}