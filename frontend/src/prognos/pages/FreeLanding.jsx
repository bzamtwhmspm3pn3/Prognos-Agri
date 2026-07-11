import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Cloud, ShoppingBag, MessageCircle, Users, QrCode, Camera,
  ArrowRight, Shield, TrendingUp, MapPin,
  Droplets, Sun, Wind, ChevronDown, Play, Pause,
  Quote, Globe, Heart, Target, Eye, ChevronRight,
  Star, CheckCircle, ExternalLink, BarChart3, FileText, User,
  Loader, Send
} from 'lucide-react';
import logoPrincipal from '../../assets/logo-principal.png';
import logoMinagrif from '../../assets/logo-minagrif.png';
import logoIDA from '../../assets/logo-ida.jpg';
import logoPNUD from '../../assets/logo-pnud.svg';
import { getAvaliacoes, createAvaliacao } from '../../services/avaliacaoService';
const logoBDA = 'https://www.bda.ao/theme/images/bda-logo-neg.svg';

function CountUp({ end, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function SectionTitle({ children, subtitle, light }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ textAlign: 'center', marginBottom: '48px' }}
    >
      <h2 style={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
        color: light ? 'white' : '#003366',
        marginBottom: '12px'
      }}>{children}</h2>
      {subtitle && (
        <p style={{
          fontSize: '1.05rem', color: light ? 'rgba(255,255,255,0.8)' : '#64748b',
          maxWidth: '600px', margin: '0 auto', lineHeight: 1.6
        }}>{subtitle}</p>
      )}
      <div style={{
        width: '60px', height: '4px',
        background: '#F5A623', margin: '16px auto 0',
        borderRadius: '2px'
      }} />
    </motion.div>
  );
}

export default function FreeLanding() {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const videoRef = useRef(null);

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [avaliacoesStats, setAvaliacoesStats] = useState({ media: 0, total: 0 });
  const [avaliacoesLoading, setAvaliacoesLoading] = useState(true);
  const [avaliacaoForm, setAvaliacaoForm] = useState({ estrelas: 0, comentario: '' });
  const [avaliacaoSubmitting, setAvaliacaoSubmitting] = useState(false);
  const [avaliacaoSent, setAvaliacaoSent] = useState(false);
  const [avaliacaoError, setAvaliacaoError] = useState('');

  useEffect(() => {
    getAvaliacoes({ aprovadas: 'true' }).then(res => {
      if (res.success) {
        setAvaliacoes(res.data || []);
        setAvaliacoesStats(res.stats || { media: 0, total: 0 });
      }
    }).catch(() => {}).finally(() => setAvaliacoesLoading(false));
  }, []);

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (avaliacaoForm.estrelas === 0) {
      setAvaliacaoError('Seleccione uma classificação');
      return;
    }
    try {
      setAvaliacaoSubmitting(true);
      setAvaliacaoError('');
      const res = await createAvaliacao({
        estrelas: avaliacaoForm.estrelas,
        comentario: avaliacaoForm.comentario
      });
      if (res.success) {
        setAvaliacaoSent(true);
        setAvaliacaoForm({ estrelas: 0, comentario: '' });
      }
    } catch (err) {
      setAvaliacaoError('Erro ao enviar avaliação. Faça login primeiro.');
    } finally {
      setAvaliacaoSubmitting(false);
    }
  };

  const recursos = [
    { icon: <Camera size={24} />, titulo: 'Detecção de Pragas', desc: 'Identifique pragas com IA usando YOLOv8. Proteja a sua colheita em tempo real.', cor: '#ef4444' },
    { icon: <Cloud size={24} />, titulo: 'Previsão Climática', desc: 'Previsão do tempo para 7 dias com alertas inteligentes para o seu talhão.', cor: '#3b82f6' },
    { icon: <ShoppingBag size={24} />, titulo: 'Mercado Agrícola', desc: 'Compre e venda produtos agrícolas com preços em tempo real em todo Angola.', cor: '#F5A623' },
    { icon: <MessageCircle size={24} />, titulo: 'Assistente IA', desc: 'Chatbot inteligente para tirar dúvidas agrícolas 24 horas por dia.', cor: '#8b5cf6' },
    { icon: <QrCode size={24} />, titulo: 'Rastreabilidade', desc: 'Blockchain para certificação digital dos seus produtos agrícolas.', cor: '#10b981' },
    { icon: <Users size={24} />, titulo: 'Comunidade', desc: 'Fórum para partilhar experiências e aprender com outros agricultores.', cor: '#06b6d4' },
    { icon: <BarChart3 size={24} />, titulo: 'Relatórios', desc: 'Relatórios detalhados com gráficos e exportação PDF para análise.', cor: '#4A7C59' },
    { icon: <MapPin size={24} />, titulo: 'Monitoramento Campo', desc: 'Acompanhe as condições do campo com GPS e dados meteorológicos.', cor: '#F97316' },
  ];

  const cadeiasValor = [
    {
      titulo: 'Cereais e Leguminosas',
      desc: 'Milho, feijão, soja e massango — a base da segurança alimentar angolana.',
      cor: '#4A7C59',
      videoUrl: 'https://cdn.pixabay.com/video/2024/09/21/232561_large.mp4'
    },
    {
      titulo: 'Hortícolas',
      desc: 'Tomate, cebola, batata e hortaliças — cadeias curtas de comercialização.',
      cor: '#ef4444',
      videoUrl: 'https://cdn.pixabay.com/video/2023/10/13/184808-874264370_large.mp4'
    },
    {
      titulo: 'Café e Cacau',
      desc: 'Produtos de exportação com alto valor agregado e certificação de origem.',
      cor: '#8B4513',
      videoUrl: 'https://cdn.pixabay.com/video/2020/12/17/59483-493557880_large.mp4'
    },
    {
      titulo: 'Fruticultura',
      desc: 'Manga, banana, abacaxi e citrinos para mercados nacionais e internacionais.',
      cor: '#F5A623',
      videoUrl: 'https://cdn.pixabay.com/video/2023/10/23/186195-877323695_large.mp4'
    },
  ];

  const estatisticas = [
    { valor: 98, suffix: '%', label: 'Precisão da IA' },
    { valor: 500, suffix: '+', label: 'Agricultores Impactados' },
    { valor: 18, suffix: '', label: 'Províncias Abrangidas' },
    { valor: 250, suffix: 'K', label: 'Hectares Monitorados' },
    { valor: 24, suffix: '/7', label: 'Suporte Disponível' },
    { valor: 95, suffix: '%', label: 'Satisfação' },
  ];

  const parceiros = [
    { nome: 'Ministério da Agricultura', sigla: 'MINAGRIF', desc: 'Parceria institucional', logo: logoMinagrif, bg: 'white' },
    { nome: 'Instituto de Desenvolvimento Agrário', sigla: 'IDA', desc: 'Extensão rural', logo: logoIDA, bg: 'white' },
    { nome: 'Programa das Nações Unidas', sigla: 'PNUD', desc: 'Desenvolvimento sustentável', logo: logoPNUD, bg: '#003366' },
    { nome: 'Banco de Desenvolvimento', sigla: 'BDA', desc: 'Financiamento agrícola', logo: logoBDA, bg: 'white' },
  ];

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ===== HEADER ===== */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(0, 51, 102, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '12px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <motion.img
              src={logoPrincipal}
              alt="Prognos Agri"
              style={{ height: '40px', width: 'auto' }}
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            />
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800, fontSize: '1.2rem', color: 'white'
            }}>
              Prognos <span style={{ color: '#F5A623' }}>Agri</span>
            </span>
          </motion.div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-ghost"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}
              onClick={() => navigate('/login')}
            >
              Entrar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-accent"
              style={{ fontSize: '0.9rem' }}
              onClick={() => navigate('/register')}
            >
              Criar Conta
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ===== HERO COM VÍDEO DE FUNDO ===== */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%', minHeight: '100%',
            width: 'auto', height: 'auto',
            objectFit: 'cover'
          }}
          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDMzNjYiLz48L3N2Zz4="
        >
          <source src="https://cdn.pixabay.com/video/2024/09/21/232561_large.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2020/12/17/59483-493557880_large.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2023/10/23/186195-877323695_large.mp4" type="video/mp4" />
        </video>

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,51,102,0.75) 0%, rgba(0,85,165,0.5) 50%, rgba(74,124,89,0.65) 100%)',
          zIndex: 1
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: '800px' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ marginBottom: '16px' }}
          >
            <img src={logoPrincipal} alt="Prognos Agri" style={{ height: '80px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.8rem)',
              color: 'white', lineHeight: 1.1, marginBottom: '16px',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            Agricultura Inteligente<br />
            <span style={{ color: '#F5A623' }}>para o Futuro de Angola</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '650px', margin: '0 auto 32px',
              lineHeight: 1.7, textShadow: '0 1px 5px rgba(0,0,0,0.2)'
            }}
          >
            Previsão climática, detecção de pragas, mercado agrícola e rastreabilidade —
            tudo numa plataforma feita por angolanos, para impulsionar o desenvolvimento agrícola de Angola.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-accent btn-lg"
              onClick={() => navigate('/register')}
              style={{ fontSize: '1rem', padding: '14px 32px' }}
            >
              Começar Grátis <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-ghost btn-lg"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontSize: '1rem', padding: '14px 32px' }}
              onClick={() => navigate('/login')}
            >
              Já tenho conta
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 1.5 }, y: { repeat: Infinity, duration: 2 } }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          style={{
            position: 'absolute', bottom: '40px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 2,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)'
          }}
        >
          <ChevronDown size={24} />
        </motion.button>

        <button
          onClick={toggleVideo}
          style={{
            position: 'absolute', bottom: '40px', right: '40px', zIndex: 2,
            background: 'rgba(0,0,0,0.5)', border: 'none',
            borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)'
          }}
        >
          {videoPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </section>

      {/* ===== ESTATÍSTICAS ===== */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #003366 0%, #0055A5 100%)',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '32px'
        }}>
          {estatisticas.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #F5A623, #F97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}
              >
                <CountUp end={item.valor} suffix={item.suffix} />
              </motion.div>
              <div style={{
                fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)',
                marginTop: '4px', fontWeight: 500
              }}>{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SOBRE / MISSÃO ===== */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionTitle>
            Tecnologia ao Serviço do Agricultor Angolano
          </SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              { icon: <Target size={32} />, titulo: 'Missão', desc: 'Capacitar os agricultores angolanos com ferramentas tecnológicas acessíveis para previsão climática, detecção de pragas, acesso ao mercado e rastreabilidade, reduzindo perdas e promovendo a segurança alimentar.' },
              { icon: <Eye size={32} />, titulo: 'Visão', desc: 'Ser a principal plataforma digital de gestão agrícola em Angola, impulsionando a transformação digital do sector e contribuindo para o desenvolvimento sustentável do país.' },
              { icon: <Heart size={32} />, titulo: 'Valores', desc: 'Inovação, sustentabilidade, inclusão digital, parceria com o agricultor familiar, respeito pelo meio ambiente e compromisso com o desenvolvimento de Angola.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '32px', borderRadius: '16px',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #003366, #4A7C59)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', marginBottom: '20px'
                }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: '#003366', marginBottom: '12px' }}>{item.titulo}</h3>
                <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CADEIAS DE VALOR AGRÍCOLAS ===== */}
      <section style={{ padding: '80px 24px', background: '#f0fdf4' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionTitle subtitle="Conheça as principais cadeias de valor que movimentam a economia agrícola angolana e como o Prognos Agri ajuda em cada uma delas.">
            Cadeias de Valor Agrícolas de Angola
          </SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {cadeiasValor.map((cadeia, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
                style={{
                  background: 'white', borderRadius: '20px',
                  overflow: 'hidden', border: '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                <div style={{
                  height: '160px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  >
                    <source src={cadeia.videoUrl} type="video/mp4" />
                  </video>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${cadeia.cor}88, transparent 60%)`,
                    display: 'flex', alignItems: 'flex-end', padding: '12px'
                  }}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <img src={logoPrincipal} alt="" style={{ height: '24px', width: 'auto', opacity: 0.9 }} />
                    </motion.div>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#003366', marginBottom: '8px' }}>
                    {cadeia.titulo}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{cadeia.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              marginTop: '40px', padding: '32px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #003366, #4A7C59)',
              display: 'flex', flexWrap: 'wrap', gap: '24px',
              alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <div style={{ color: 'white', flex: 1, minWidth: '250px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>
                Faz parte da cadeia de valor agrícola?
              </h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6 }}>
                Agricultores, cooperativas, compradores e técnicos — todos encontram valor no Prognos Agri.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-accent btn-lg"
              onClick={() => navigate('/register')}
              style={{ whiteSpace: 'nowrap' }}
            >
              Quero Participar <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionTitle subtitle="Em apenas 4 passos, transforme a sua produção agrícola com tecnologia de ponta.">
            Como Funciona
          </SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {[
              { passo: '1', titulo: 'Crie sua conta', desc: 'Registe-se gratuitamente e configure o seu perfil de agricultor.', icon: <User size={28} /> },
              { passo: '2', titulo: 'Monitore o campo', desc: 'Use câmaras ou o telemóvel para capturar imagens das suas culturas.', icon: <Camera size={28} /> },
              { passo: '3', titulo: 'Receba alertas IA', desc: 'A IA identifica pragas, prevê o clima e recomenda acções.', icon: <Cloud size={28} /> },
              { passo: '4', titulo: 'Venda e cresça', desc: 'Aceda ao mercado, gere relatórios e expanda o seu negócio.', icon: <TrendingUp size={28} /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                style={{ textAlign: 'center', padding: '32px 20px' }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003366, #4A7C59)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', margin: '0 auto 20px',
                    boxShadow: '0 8px 20px rgba(0,51,102,0.2)',
                    position: 'relative'
                  }}
                >
                  {item.icon}
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#F5A623', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 'bold'
                  }}>{item.passo}</div>
                </motion.div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#003366', marginBottom: '8px' }}>{item.titulo}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RECURSOS ===== */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionTitle subtitle="Ferramentas completas para o agricultor angolano moderno.">
            Tudo que Precisa para Gerir a sua Produção
          </SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {recursos.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                style={{
                  background: 'white', padding: '28px 24px',
                  borderRadius: '16px', border: '1px solid #e2e8f0',
                  cursor: 'default', transition: 'all 0.3s'
                }}
              >
                <motion.div
                  whileHover={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: '52px', height: '52px',
                    background: `${rec.cor}12`,
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: rec.cor, marginBottom: '16px'
                  }}
                >
                  {rec.icon}
                </motion.div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#003366', marginBottom: '8px' }}>{rec.titulo}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>{rec.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARCEIROS ===== */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <SectionTitle subtitle="Trabalhamos em parceria com as principais instituições do sector agrícola em Angola.">
            Parceiros Institucionais
          </SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {parceiros.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '24px', borderRadius: '16px',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '100px', height: '80px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  padding: '8px',
                  background: p.bg,
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img
                    src={p.logo}
                    alt={p.sigla}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#003366', marginBottom: '2px' }}>{p.sigla}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.nome}</p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AVALIAÇÕES REAIS ===== */}
      <section style={{ padding: '80px 24px', background: '#003366' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <SectionTitle light subtitle="Agricultores e parceiros que já transformaram a sua produção com o Prognos Agri.">
            O Que Dizem Sobre Nós
          </SectionTitle>

          {avaliacoesStats.total > 0 && (
            <div style={{
              textAlign: 'center', marginBottom: '40px',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#F5A623', lineHeight: 1 }}>
                  {avaliacoesStats.media}
                </div>
                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', margin: '8px 0' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16} color="#F5A623"
                      fill={s <= Math.round(avaliacoesStats.media) ? '#F5A623' : 'none'} />
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  {avaliacoesStats.total} avaliação(ões)
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {avaliacoesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader size={32} className="spinner" style={{ borderTopColor: '#F5A623', borderColor: 'rgba(255,255,255,0.1)' }} />
              </div>
            ) : (
              (avaliacoes.length > 0 ? avaliacoes : [
                { username: 'João Miguel', estrelas: 5, comentario: 'Com o Prognos Agri consegui detectar uma infestação de gafanhotos antes que destruísse a minha colheita de milho.', data: new Date() },
                { username: 'Maria Sebastião', estrelas: 5, comentario: 'A rastreabilidade blockchain abriu portas para exportarmos o nosso café. Os compradores internacionais confiam na certificação digital.', data: new Date() },
                { username: 'Dr. Pedro Afonso', estrelas: 4, comentario: 'Uma ferramenta extraordinária para a extensão rural. Conseguimos monitorar centenas de talhões em tempo real.', data: new Date() },
              ]).map((item, i) => (
                <motion.div
                  key={item._id || i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    padding: '28px 32px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}
                >
                  <Quote size={32} color="rgba(245,166,35,0.3)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                  <p style={{
                    fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.7, fontStyle: 'italic',
                    marginBottom: '16px', paddingLeft: '24px'
                  }}>
                    "{item.comentario}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F5A623, #F97316)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold', fontSize: '1rem'
                    }}>
                      {(item.username || item.nome || 'A').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>
                        {item.username || item.nome || 'Anónimo'}
                      </div>
                      {item.data && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(item.data).toLocaleDateString('pt-PT')}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} color="#F5A623"
                          fill={s <= item.estrelas ? '#F5A623' : 'none'}
                          style={{ display: 'inline', marginRight: '2px' }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Formulário de avaliação */}
          <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: 'white', marginBottom: '8px', textAlign: 'center' }}>
              {avaliacaoSent ? '✅ Obrigado pela sua avaliação!' : 'Deixe a sua avaliação'}
            </h3>
            {!avaliacaoSent ? (
              <form onSubmit={handleEnviarAvaliacao} style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setAvaliacaoForm(prev => ({ ...prev, estrelas: s }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Star size={28} color="#F5A623"
                        fill={s <= avaliacaoForm.estrelas ? '#F5A623' : 'none'}
                        style={{ transition: 'all 0.2s', transform: s <= avaliacaoForm.estrelas ? 'scale(1.1)' : 'scale(1)' }} />
                    </button>
                  ))}
                </div>
                <textarea className="input" placeholder="Escreva o seu comentário (opcional)"
                  rows={3} value={avaliacaoForm.comentario}
                  onChange={e => setAvaliacaoForm(prev => ({ ...prev, comentario: e.target.value }))}
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '12px' }} />
                {avaliacaoError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center' }}>{avaliacaoError}</p>
                )}
                <button type="submit" className="btn btn-accent btn-lg" disabled={avaliacaoSubmitting}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {avaliacaoSubmitting ? <Loader size={18} className="spinner" /> : <Send size={18} />}
                  {avaliacaoSubmitting ? 'A enviar...' : 'Enviar Avaliação'}
                </button>
              </form>
            ) : (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                A sua avaliação será publicada após aprovação.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #1a4d2e 0%, #4A7C59 50%, #5E9D6E 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: Infinity, duration: 8 }}
          style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)'
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ repeat: Infinity, duration: 10 }}
          style={{
            position: 'absolute', bottom: '-80px', left: '-40px',
            width: '250px', height: '250px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              color: 'white', marginBottom: '16px'
            }}>
              Pronto para Transformar a sua Produção?
            </h2>
            <p style={{
              fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)',
              marginBottom: '32px', lineHeight: 1.7
            }}>
              Junte-se a centenas de agricultores angolanos que já usam o Prognos Agri
              para aumentar a produtividade, reduzir perdas e aceder a novos mercados.
            </p>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-accent btn-lg"
              onClick={() => navigate('/register')}
              style={{ fontSize: '1.05rem', padding: '16px 40px' }}
            >
              Criar Conta Gratuita <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: '#002244', color: 'rgba(255,255,255,0.6)',
        padding: '48px 24px 24px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px', marginBottom: '32px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img src={logoPrincipal} alt="Prognos Agri" style={{ height: '32px', width: 'auto' }} />
                <span style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700, color: 'white', fontSize: '1rem'
                }}>
                  Prognos <span style={{ color: '#F5A623' }}>Agri</span>
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7, maxWidth: '250px' }}>
                Sistema Inteligente de Previsão e Gestão Agrícola — feito por angolanos, para o mundo.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Plataforma</h4>
              {['Detecção de Pragas', 'Previsão Climática', 'Mercado Agrícola', 'Rastreabilidade', 'Comunidade'].map((link, i) => (
                <button key={i} onClick={() => navigate('/login')} style={{
                  display: 'block', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  padding: '4px 0', fontSize: '0.85rem', textAlign: 'left',
                  transition: 'color 0.2s'
                }}>{link}</button>
              ))}
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Sobre</h4>
              {['Quem Somos', 'Contacto', 'Termos de Uso', 'Política de Privacidade', 'FAQ'].map((link, i) => (
                <button key={i} style={{
                  display: 'block', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  padding: '4px 0', fontSize: '0.85rem', textAlign: 'left',
                  transition: 'color 0.2s'
                }}>{link}</button>
              ))}
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Contacto</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>📍 Luanda, Angola</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>📧 info@prognosagri.ao</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>📱 +244 900 000 000</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {['🌐', '📘', '📸', '🐦'].map((icon, i) => (
                  <span key={i} style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '0.9rem'
                  }}>{icon}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '20px',
            display: 'flex', flexWrap: 'wrap', gap: '8px',
            justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.8rem'
          }}>
            <span>© 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
              Feito com ❤️ para o desenvolvimento agrícola de Angola
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
