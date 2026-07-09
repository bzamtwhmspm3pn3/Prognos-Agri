// src/components/AjudaModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, HelpCircle, MessageCircle, Phone, Mail, 
  FileText, BookOpen, Video, ChevronRight,
  Search, ThumbsUp, Star, ExternalLink
} from 'lucide-react';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8'
};

export default function AjudaModal({ isOpen, onClose, onContactClick }) {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('tudo');

  if (!isOpen) return null;

  const categorias = [
    { id: 'tudo', nome: 'Tudo', icone: <HelpCircle size={18} /> },
    { id: 'primeiros-passos', nome: 'Primeiros Passos', icone: <BookOpen size={18} /> },
    { id: 'tutoriais', nome: 'Tutoriais', icone: <Video size={18} /> },
    { id: 'faq', nome: 'FAQ', icone: <FileText size={18} /> }
  ];

  const faqs = [
    {
      pergunta: 'Como funciona a detecção de pragas?',
      resposta: 'A nossa IA analisa imagens das folhas e identifica automaticamente roedores, aves e insetos com 98% de precisão.'
    },
    {
      pergunta: 'Preciso de equipamento especial?',
      resposta: 'Não! Basta usar a câmara do seu smartphone para capturar imagens das áreas afetadas.'
    },
    {
      pergunta: 'Quanto custa o serviço?',
      resposta: 'Temos um plano gratuito com 5 scans por mês. Planos premium oferecem scans ilimitados e relatórios detalhados.'
    },
    {
      pergunta: 'Como entro em contacto com o suporte?',
      resposta: 'Podes nos contactar por telefone, email ou WhatsApp. Estamos disponíveis 24/7 para ajudar!'
    }
  ];

  const tutoriais = [
    { titulo: 'Como fazer o primeiro scan', duracao: '3 min', link: '#' },
    { titulo: 'Interpretar resultados da IA', duracao: '5 min', link: '#' },
    { titulo: 'Configurar alertas', duracao: '4 min', link: '#' },
    { titulo: 'Gerar relatórios', duracao: '6 min', link: '#' }
  ];

  const filteredFaqs = busca 
    ? faqs.filter(faq => 
        faq.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
        faq.resposta.toLowerCase().includes(busca.toLowerCase())
      )
    : faqs;

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
        zIndex: 9999,
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
        {/* Botão fechar */}
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
            color: '#999',
            padding: '5px',
            borderRadius: '5px'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: cores.verdeAlface,
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <HelpCircle size={32} color={cores.verdePimenta} />
          Central de Ajuda
        </h2>
        
        <p style={{ 
          color: '#666',
          marginBottom: '30px',
          fontSize: '1rem'
        }}>
          Encontre respostas para as suas dúvidas ou fale com a nossa equipa
        </p>

        {/* Barra de pesquisa */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '30px',
          background: '#F5F5F5',
          borderRadius: '50px',
          padding: '5px 5px 5px 20px'
        }}>
          <Search size={20} color="#999" />
          <input
            type="text"
            placeholder="Pesquisar ajuda..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 15px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Categorias */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: categoriaAtiva === cat.id ? cores.verdePimenta : 'white',
                color: categoriaAtiva === cat.id ? cores.verdeAlface : '#666',
                border: `1px solid ${cores.verdeClaro}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: categoriaAtiva === cat.id ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {cat.icone}
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Conteúdo baseado na categoria */}
        <AnimatePresence mode="wait">
          <motion.div
            key={categoriaAtiva}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* FAQ */}
            {(categoriaAtiva === 'tudo' || categoriaAtiva === 'faq') && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: cores.verdeAlface,
                  marginBottom: '20px'
                }}>
                  Perguntas Frequentes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(busca ? filteredFaqs : faqs).map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        padding: '15px',
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <p style={{ fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '5px' }}>
                        {faq.pergunta}
                      </p>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        {faq.resposta}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Tutoriais */}
            {(categoriaAtiva === 'tudo' || categoriaAtiva === 'tutoriais') && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: cores.verdeAlface,
                  marginBottom: '20px'
                }}>
                  Tutoriais em Vídeo
                </h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {tutoriais.map((tuto, index) => (
                    <a
                      key={index}
                      href={tuto.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '15px',
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Video size={20} color={cores.verdePimenta} />
                        <div>
                          <p style={{ fontWeight: 'bold', color: cores.verdeAlface }}>{tuto.titulo}</p>
                          <p style={{ fontSize: '0.8rem', color: '#666' }}>{tuto.duracao}</p>
                        </div>
                      </div>
                      <ExternalLink size={16} color="#999" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Contacto direto */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: `linear-gradient(135deg, ${cores.verdeClaro}, white)`,
          borderRadius: '15px'
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            color: cores.verdeAlface,
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageCircle size={20} color={cores.verdePimenta} />
            Ainda precisa de ajuda?
          </h3>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                onClose();
                if (onContactClick) onContactClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: cores.verdePimenta,
                color: cores.verdeAlface,
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              <MessageCircle size={16} />
              Falar com Suporte
            </button>
            
            <a
              href="tel:+244900000000"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'white',
                color: cores.verdeAlface,
                border: `1px solid ${cores.verdePimenta}`,
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              <Phone size={16} color={cores.verdePimenta} />
              Ligar Agora
            </a>
            
            <a
              href="mailto:suporte@agrookuvanja.ao"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'white',
                color: cores.verdeAlface,
                border: `1px solid ${cores.verdePimenta}`,
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              <Mail size={16} color={cores.verdePimenta} />
              Enviar Email
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}