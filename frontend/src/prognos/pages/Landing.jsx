import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Cloud, ShoppingBag, MessageCircle, Users,
  QrCode, Camera, Star, MapPin, ChevronRight, Menu, X,
  TrendingUp, Award, Zap
} from 'lucide-react';
import logoHeader from '../../assets/logo-header.png';

const cores = {
  primary: '#003366',
  primaryLight: '#0055A5',
  secondary: '#4A7C59',
  secondaryLight: '#5E9D6E',
  accent: '#F5A623',
  accentLight: '#FFB940',
};

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const funcionalidades = [
    { icon: <Camera size={28} />, titulo: 'Detecção de Pragas', desc: 'Identifique pragas com IA usando YOLOv8 em tempo real.', cor: '#ef4444' },
    { icon: <Cloud size={28} />, titulo: 'Previsão Climática', desc: 'Previsão do tempo para 7 dias com alertas de condições extremas.', cor: '#3b82f6' },
    { icon: <ShoppingBag size={28} />, titulo: 'Mercado Agrícola', desc: 'Compre e venda produtos com preços actualizados por província.', cor: cores.accent },
    { icon: <MessageCircle size={28} />, titulo: 'Assistente IA', desc: 'Chatbot inteligente para responder dúvidas agrícolas.', cor: '#8b5cf6' },
    { icon: <Users size={28} />, titulo: 'Comunidade', desc: 'Partilhe experiências com outros agricultores angolanos.', cor: '#06b6d4' },
    { icon: <QrCode size={28} />, titulo: 'Rastreabilidade', desc: 'Certificação digital com blockchain e código QR.', cor: '#10b981' },
  ];

  const estatisticas = [
    { valor: '98%', label: 'Precisão da IA', icon: <Zap size={24} /> },
    { valor: '18', label: 'Províncias', icon: <MapPin size={24} /> },
    { valor: '500+', label: 'Agricultores', icon: <Users size={24} /> },
    { valor: '7 dias', label: 'Previsão Climática', icon: <Cloud size={24} /> },
  ];

  const passos = [
    { passo: '1', titulo: 'Crie sua conta', desc: 'Registe-se gratuitamente em menos de 1 minuto' },
    { passo: '2', titulo: 'Faça uma detecção', desc: 'Tire foto ou faça upload de imagem da sua plantação' },
    { passo: '3', titulo: 'Receba recomendações', desc: 'A IA identifica pragas e sugere acções personalizadas' },
    { passo: '4', titulo: 'Acompanhe o mercado', desc: 'Compre, venda e rastreie seus produtos agrícolas' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* ===== HEADER ===== */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logoHeader} alt="Prognos Agri" style={{ height: '34px', width: 'auto' }} />
            <span style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
              fontSize: '1.3rem', color: cores.primary
            }}>
              Prognos <span style={{ color: cores.secondary }}>Agri</span>
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-ghost"
              style={{ fontSize: '0.9rem' }}
            >Entrar</button>
            <button
              onClick={() => navigate('/login?register=true')}
              className="btn btn-primary"
            >Criar Conta <ArrowRight size={16} /></button>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #003366 0%, #0055A5 50%, #4A7C59 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '120px 24px 80px', position: 'relative', overflow: 'hidden'
      }}>
        {['#003366', '#4A7C59', '#F5A623', '#0055A5', '#5E9D6E', '#FFB940'].map((cor, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            borderRadius: '50%',
            background: cor,
            opacity: 0.06,
            top: `${8 + i * 13}%`,
            left: `${3 + i * 16}%`,
          }} />
        ))}

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '700px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.15)', padding: '8px 16px',
              borderRadius: '50px', marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Award size={16} color={cores.accent} />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                🏆 Timbuktoo Agritech Hackathon 2026
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'white',
              lineHeight: 1.1, marginBottom: '20px'
            }}>
              Agricultura Inteligente<br />
              <span style={{ color: cores.accent }}>para Angola</span>
            </h1>

            <p style={{
              fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.7, marginBottom: '32px', maxWidth: '550px'
            }}>
              Previsão climática, detecção de pragas com IA, mercado em tempo real
              e rastreabilidade blockchain — tudo numa plataforma feita por angolanos.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login?register=true')}
                className="btn btn-accent btn-lg"
                style={{ fontWeight: 700 }}
              >
                Começar Gratuitamente <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600
                }}
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ESTATÍSTICAS ===== */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {estatisticas.map((item, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '24px'
              }}>
                <div style={{
                  width: '56px', height: '56px', margin: '0 auto 16px',
                  background: `linear-gradient(135deg, ${cores.primary}, ${cores.secondary})`,
                  borderRadius: '16px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white'
                }}>{item.icon}</div>
                <div style={{
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
                  fontSize: '2rem', color: cores.primary
                }}>{item.valor}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FUNCIONALIDADES ===== */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
              fontSize: '2.2rem', color: cores.primary, marginBottom: '12px'
            }}>
              Tudo que precisa num só lugar
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Ferramentas completas para o agricultor angolano moderno
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {funcionalidades.map((f, i) => (
              <div key={i} className="prognos-card" style={{
                padding: '28px', cursor: 'pointer',
                border: `1px solid ${f.cor}20`,
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '52px', height: '52px',
                  background: `${f.cor}12`, borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.cor, marginBottom: '16px'
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{f.titulo}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
              fontSize: '2.2rem', color: cores.primary, marginBottom: '12px'
            }}>
              Como começar
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
              Em 4 passos simples
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {passos.map((p, i) => (
              <div key={i} style={{
                display: 'flex', gap: '20px', alignItems: 'center',
                padding: '20px 24px', borderRadius: '16px',
                background: '#f8fafc', border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${cores.primary}, ${cores.secondary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '1.1rem',
                  flexShrink: 0
                }}>{p.passo}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{p.titulo}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOBRE / EQUIPA ===== */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px', alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
                fontSize: '2rem', color: cores.primary, marginBottom: '16px'
              }}>
                Feito por angolanos,<br />
                <span style={{ color: cores.secondary }}>para o mundo</span>
              </h2>
              <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: '20px', fontSize: '0.95rem' }}>
                O Prognos Agri nasceu da necessidade de proteger os agricultores angolanos
                contra pragas e condições climáticas adversas. Com tecnologia de ponta
                e conhecimento local, desenvolvemos uma solução que combina inteligência
                artificial, previsão climática e mercado digital.
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '16px 20px', background: 'white', borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #003366, #4A7C59)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
                }}>V</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Venâncio Martins</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Criador & ML Developer</div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'
            }}>
              {[
                { icone: '🌾', label: 'Agricultura Inteligente' },
                { icone: '🤖', label: 'IA e Machine Learning' },
                { icone: '📊', label: 'Análise de Dados' },
                { icone: '🔗', label: 'Blockchain' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '24px', background: 'white', borderRadius: '16px',
                  border: '1px solid #e2e8f0', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{item.icone}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: cores.primary }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #003366, #4A7C59)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
            fontSize: '2rem', color: 'white', marginBottom: '16px'
          }}>
            Pronto para transformar<br />sua agricultura?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px', fontSize: '1.05rem' }}>
            Junte-se a centenas de agricultores angolanos que já usam o Prognos Agri
          </p>
          <button
            onClick={() => navigate('/login?register=true')}
            className="btn btn-accent btn-lg"
            style={{ fontWeight: 700, fontSize: '1.1rem', padding: '16px 40px' }}
          >
            Criar Conta Gratuita <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: '#001f3f', color: 'rgba(255,255,255,0.7)',
        padding: '40px 24px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px', marginBottom: '32px'
          }}>
            <div>
              <div style={{
                fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
                fontSize: '1.2rem', color: 'white', marginBottom: '12px'
              }}>🌾 Prognos Agri</div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                Sistema Inteligente de Previsão e Gestão Agrícola.
                Transformando a agricultura angolana com tecnologia.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '0.95rem' }}>Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ cursor: 'pointer' }}>Sobre Nós</span>
                <span style={{ cursor: 'pointer' }}>Termos de Uso</span>
                <span style={{ cursor: 'pointer' }}>Privacidade</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '0.95rem' }}>Contacto</h4>
              <div style={{ fontSize: '0.85rem', lineHeight: 2 }}>
                <div>📧 venancio@prognosagri.ao</div>
                <div>📞 +244 928 565 837</div>
                <div>📍 Luanda, Angola</div>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '20px', textAlign: 'center',
            fontSize: '0.8rem'
          }}>
            © 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
