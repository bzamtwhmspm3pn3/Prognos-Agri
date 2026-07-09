// src/components/QuemSomos.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Eye, Heart, Shield, Zap, Award, 
  Leaf, Github, Linkedin, Mail, Globe,
  Sprout, ChevronRight, Phone
} from 'lucide-react';

// IMPORTANDO AS FOTOS REAIS DA equipa
import fotoPaulo from '../assets/equipa/paulo.jpeg';
import fotoIsaac from '../assets/equipa/isaac.jpeg';
import fotoTiago from '../assets/equipa/tiago.jpeg';
import fotoVenancio from '../assets/equipa/venancio.jpeg';
import fotoGracas from '../assets/equipa/graças.jpeg';
import fotoChela from '../assets/equipa/chela.jpeg';
import fotoDavid from '../assets/equipa/david.png';
import fotoAvindo from '../assets/equipa/avindo.jpeg';

// IMPORTANDO LOGOS DOS PARCEIROS
import logoPnud from '../assets/parceiros/PNUD.jpeg';
import logoGoverno from '../assets/parceiros/governo-angola.png';
import logoAceleraAngola from '../assets/parceiros/acelera.jpeg';
import logoAceleraAgro from '../assets/parceiros/acelera-agro.png';
import logoTimbuktoo from '../assets/parceiros/timbuktoo.png';
import logoAgroOkuvanja from '../assets/logoagrookuvanja.png';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8'
};

// Dados da equipa em ORDEM ALFABÉTICA
const teamMembers = [
  {
    id: 1,
    nome: "Avindo dos Santos",
    cargo: "ML Developer",
    foto: fotoAvindo,
    bio: "Desenvolvedor de machine learning focado em otimização de algoritmos e processamento de imagens para detecção de pragas.",
    whatsapp: "925146189",
    habilidades: ["Deep Learning", "Computer Vision", "PyTorch", "Otimização"],
    cor: "#B7E4C7"
  },
  {
    id: 2,
    nome: "Chela Africana Carlos Nguvo",
    cargo: "Analista de Dados",
    foto: fotoChela,
    bio: "Analista de dados responsável pela modelagem preditiva e insights sobre perdas agrícolas e produtividade.",
    whatsapp: "925130126",
    habilidades: ["Data Science", "Análise Preditiva", "Python", "Visualização"],
    cor: "#74C69D"
  },
  {
    id: 3,
    nome: "David Bernardo Manito Teles",
    cargo: "Técnico Agrónomo",
    foto: fotoDavid,
    bio: "Técnico agrônomo especializado em culturas tropicais e validação em campo das soluções desenvolvidas pela equipa",
    whatsapp: "923456789",
    habilidades: ["Agronomia", "Culturas Tropicais", "Experimentação", "Campo"],
    cor: "#95D5B2"
  },
  {
    id: 4,
    nome: "Graças Manhonga Hitxica Tonga",
    cargo: "Técnico Agrónomo",
    foto: fotoGracas,
    bio: "Engenheiro agrônomo com profundo conhecimento em pragas agrícolas e manejo integrado. Garante a precisão das recomendações.",
    whatsapp: "937645402",
    habilidades: ["Agronomia", "Manejo de Pragas", "Agricultura", "Pesquisa"],
    cor: "#52B788"
  },
  {
    id: 5,
    nome: "Isaac Tchinganga Hoka de Oliveira",
    cargo: "Designer",
    foto: fotoIsaac,
    bio: "Designer criativo responsável pela identidade visual e experiência do usuário da plataforma AGROOKUVANJA.",
    whatsapp: "934692550",
    habilidades: ["UI/UX Design", "Figma", "Identidade Visual", "Design Thinking"],
    cor: "#82B74D"
  },
  {
    id: 6,
    nome: "Paulo Manuel Miguel de Oliveira",
    cargo: "Gestor de Projectos",
    foto: fotoPaulo,
    bio: "Líder visionário com experiência em gestão de projetos agrícolas e tecnológicos. Coordena a equipa AGROOKUVANJA.",
    whatsapp: "933599209",
    habilidades: ["Gestão", "Liderança", "Agronegócio", "Inovação"],
    cor: "#1A4D2E"
  },
  {
    id: 7,
    nome: "Tiago Pedro Menenga Bondo",
    cargo: "Front-End Developer",
    foto: fotoTiago,
    bio: "Desenvolvedor front-end especializado em React e interfaces responsivas. Dá vida às interfaces da AGROOKUVANJA.",
    whatsapp: "938328261",
    habilidades: ["React", "JavaScript", "UI Development", "Framer Motion"],
    cor: "#2D6A4F"
  },
  {
    id: 8,
    nome: "Venâncio Elavoco Cassova Martins",
    cargo: "ML Developer",
    foto: fotoVenancio,
    bio: "Especialista em machine learning responsável pelos algoritmos de detecção de pragas e recomendações inteligentes.",
    whatsapp: "928565837",
    habilidades: ["Machine Learning", "Python", "Computer Vision", "TensorFlow"],
    cor: "#40916C"
  }
];

// Parceiros
const partners = [
  { 
    nome: "Governo de Angola", 
    logo: logoGoverno, 
    url: "https://governo.gov.ao",
    desc: "República de Angola"
  },
  { 
    nome: "PNUD", 
    logo: logoPnud, 
    url: "https://www.undp.org/pt/angola",
    desc: "Programa das Nações Unidas para o Desenvolvimento"
  },
  { 
    nome: "Acelera Angola", 
    logo: logoAceleraAngola, 
    url: "https://acelerangola.com",
    desc: "Programa de Aceleração de Startups"
  },
  { 
    nome: "Acelera Agro", 
    logo: logoAceleraAgro, 
    url: "https://aceleragro.co.ao",
    desc: "Programa de Aceleração do Agronegócio"
  }
];

// Conquistas (COM TEXTO BRANCO GARANTIDO)
const achievements = [
  { 
    icone: <Sprout size={24} />, 
    titulo: "Agricultores Impactados", 
    descricao: "Meta: 500 famílias", 
    cor: "from-green-300 to-green-400"  /* Cores mais claras */
  },
  { 
    icone: <Zap size={24} />, 
    titulo: "Precisão da IA", 
    descricao: "98% em testes", 
    cor: "from-blue-300 to-blue-400" 
  },
  { 
    icone: <Heart size={24} />, 
    titulo: "Províncias", 
    descricao: "Testar em 5 províncias", 
    cor: "from-purple-300 to-pink-300" 
  }
];

// Valores
const valores = [
  { icone: <Heart size={32} />, titulo: "Compromisso", desc: "Com o agricultor e o desenvolvimento sustentável de Angola." },
  { icone: <Shield size={32} />, titulo: "Integridade", desc: "Transparência e ética em todas as nossas ações." },
  { icone: <Zap size={32} />, titulo: "Inovação", desc: "Buscamos soluções tecnológicas de ponta." },
  { icone: <Target size={32} />, titulo: "Eficácia", desc: "Foco em resultados que aumentem a produtividade." }
];

export default function QuemSomos() {
  const [activeMember, setActiveMember] = useState(null);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* ===== HERO SECTION ===== */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  style={{
    position: 'relative',
    borderRadius: '30px',
    overflow: 'hidden',
    height: '450px',
    marginBottom: '50px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  }}
>
  <div style={{
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(135deg, ${cores.verdeAlface}CC, ${cores.verdePimenta}CC)`,
    zIndex: 1
  }}></div>
  
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}></div>
  
  <div style={{
    position: 'relative',
    zIndex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  }}>
    {/* LOGO DA AGROOKUVANJA */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
      style={{
        width: '120px',
        height: '120px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        border: '2px solid rgba(255,255,255,0.3)',
        overflow: 'hidden',
        padding: '15px'
      }}
    >
      <img 
        src={logoAgroOkuvanja} 
        alt="AGROOKUVANJA" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain' 
        }} 
      />
    </motion.div>
    
    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 'bold', marginBottom: '15px' }}
    >
      AGRO<span style={{ color: cores.verdeClaro }}>OKUVANJA</span>
    </motion.h1>
    
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '20px' }}
    >
      Protegendo colheitas, alimentando o futuro de Angola
    </motion.p>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <span style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(5px)',
        padding: '10px 25px',
        borderRadius: '50px',
        fontSize: '0.9rem',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        🤝 Timbuktoo Agritech Hackathon 2026
      </span>
    </motion.div>
  </div>
</motion.div>

      {/* ===== TIMBUKTOO DESTAQUE ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '40px',
          padding: '15px 25px',
          background: cores.verdeClaro,
          borderRadius: '50px',
          border: `1px solid ${cores.verdePimenta}`,
          flexWrap: 'wrap'
        }}
      >
        <img 
          src={logoTimbuktoo} 
          alt="Timbuktoo"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
        />
        <span style={{ color: cores.verdeAlface, fontWeight: 'bold' }}>
          Participante do Timbuktoo Agritech Hackathon 2026
        </span>
      </motion.div>

      {/* ===== CONQUISTAS (VISÍVEIS) ===== */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '60px'
}}>
  {achievements.map((item, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      style={{
        background: `linear-gradient(135deg, ${item.cor.split(' ')[1]}, ${item.cor.split(' ')[3]})`,
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.5)',
          padding: '12px',
          borderRadius: '12px',
          color: '#1A4D2E'
        }}>
          {item.icone}
        </div>
        <div>
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#1A4D2E',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            {item.titulo}
          </p>
          <p style={{ 
            fontSize: '1.3rem', 
            fontWeight: 'bold', 
            color: '#1A4D2E'
          }}>
            {item.descricao}
          </p>
        </div>
      </div>
    </motion.div>
  ))}
</div>

      {/* ===== MISSÃO, VISÃO, VALORES ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '60px'
      }}>
        
        {/* Missão */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ y: -5 }}
          style={{
            background: 'white',
            padding: '35px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderTop: `5px solid ${cores.verdePimenta}`
          }}
        >
          <Target size={48} color={cores.verdeAlface} style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '15px' }}>
            Nossa Missão
          </h3>
          <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
            Capacitar os agricultores com ferramentas acessíveis e eficazes para a deteção precoce 
            e gestão integrada de roedores e aves, reduzindo perdas e promovendo a segurança alimentar em Angola.
          </p>
        </motion.div>

        {/* Visão */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          style={{
            background: 'white',
            padding: '35px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderTop: `5px solid ${cores.verdeAlface}`
          }}
        >
          <Eye size={48} color={cores.verdeAlface} style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '15px' }}>
            Nossa Visão
          </h3>
          <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
            Ser a referência nacional em tecnologia agrícola, criando um futuro onde os agricultores angolanos 
            estejam protegidos contra pragas e maximizem a sua produtividade.
          </p>
        </motion.div>

        {/* Valores */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          style={{
            background: 'white',
            padding: '35px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderTop: `5px solid ${cores.verdePimenta}`
          }}
        >
          <Heart size={48} color={cores.verdeAlface} style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '15px' }}>
            Nossos Valores
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {valores.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: cores.verdePimenta }}>{v.icone}</span>
                <div>
                  <strong style={{ color: cores.verdeAlface, display: 'block', marginBottom: '2px' }}>
                    {v.titulo}
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>{v.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ===== NOSSA HISTÓRIA ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          background: 'white',
          borderRadius: '30px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          marginBottom: '60px'
        }}
      >
        <div style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Leaf size={24} color={cores.verdePimenta} />
            <span style={{ color: cores.verdePimenta, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Nossa História
            </span>
          </div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '20px' }}>
            Proteger quem nos <span style={{ color: cores.verdePimenta }}>alimenta</span>
          </h2>
          
          <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '20px' }}>
            A AGROOKUVANJA nasceu da necessidade urgente de proteger os agricultores angolanos 
            contra as pragas que mais afetam a produtividade agrícola: <strong>roedores e aves</strong>. 
            Com tecnologia de ponta e conhecimento local, desenvolvemos uma solução que combina 
            visão computacional e machine learning.
          </p>
          
          <p style={{ color: '#4B5563', lineHeight: 1.8 }}>
            Nossa Equipa multidisciplinar une desenvolvedores, designers, agrônomos e gestores 
            com um objetivo comum: <strong>reduzir perdas e aumentar a produtividade</strong>.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
            <div style={{ display: 'flex' }}>
              {teamMembers.slice(0, 5).map((member, i) => (
                <img
                  key={i}
                  src={member.foto}
                  alt={member.nome}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    marginLeft: i > 0 ? '-10px' : 0,
                    objectFit: 'cover'
                  }}
                />
              ))}
            </div>
            <span style={{ color: '#6B7280' }}>equipa de 8 especialistas</span>
          </div>
        </div>
        
        <div style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '30px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            color: 'white'
          }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Agricultura familiar em Angola</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Cuanza Sul, 2025</p>
          </div>
        </div>
      </motion.div>

      {/* ===== equipa ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '15px' }}>
          Nossa Equipa
        </h2>
        <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
          8 profissionais dedicados a transformar a agricultura angolana
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '60px'
      }}>
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: `1px solid ${cores.verdeClaro}`
            }}
            onClick={() => setActiveMember(activeMember === member.id ? null : member.id)}
          >
            <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
              <img
                src={member.foto}
                alt={member.nome}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '5px' }}>
                {member.nome}
              </h3>
              <p style={{ color: cores.verdePimenta, fontSize: '0.9rem', marginBottom: '10px' }}>
                {member.cargo}
              </p>
              
              {/* WhatsApp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Phone size={16} color={cores.verdePimenta} />
                <a 
                  href={`https://wa.me/244${member.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#25D366', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  +244 {member.whatsapp}
                </a>
              </div>
              
              <AnimatePresence>
                {activeMember === member.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ fontSize: '0.9rem', color: '#4B5563', borderTop: `1px solid ${cores.verdeClaro}`, paddingTop: '10px' }}
                  >
                    <p style={{ marginBottom: '10px' }}>{member.bio}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {member.habilidades.map((skill, i) => (
                        <span
                          key={i}
                          style={{
                            background: cores.verdeClaro,
                            color: cores.verdeAlface,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ===== ROADMAP 2026 ===== */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  style={{
    background: `linear-gradient(135deg, ${cores.verdeAlface}, ${cores.verdePimenta})`,
    borderRadius: '30px',
    padding: '50px 30px',
    marginBottom: '60px',
    color: 'white',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  }}
>
  <h2 style={{ 
    fontSize: '2.2rem', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  }}>
    Nosso Roadmap 2026
  </h2>
  
  {/* Badge do Hackathon - EM DESTAQUE (FEVEREIRO) */}
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.1 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '40px',
      padding: '20px 30px',
      background: 'rgba(255,215,0,0.25)',
      backdropFilter: 'blur(10px)',
      borderRadius: '60px',
      border: '3px solid gold',
      flexWrap: 'wrap'
    }}
  >
    <span style={{ fontSize: '2.5rem' }}>🏆</span>
    <div>
      <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'gold' }}>
        ACONTECENDO AGORA!
      </span>
      <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
        Timbuktoo Agritech Hackathon - Fevereiro 2026 (3 dias de imersão)
      </p>
    </div>
  </motion.div>
  
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '25px',
    position: 'relative',
    zIndex: 2
  }}>
    
    {/* FEVEREIRO - HACKATHON (DESTAQUE) */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      whileHover={{ y: -10, scale: 1.02 }}
      style={{
        background: 'rgba(255,215,0,0.25)',
        backdropFilter: 'blur(12px)',
        padding: '30px 20px',
        borderRadius: '20px',
        border: '3px solid gold',
        height: 'auto',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Efeito pulsante para indicar "ao vivo" */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        background: 'gold',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      <span style={{
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: 'gold',
        display: 'block',
        marginBottom: '5px'
      }}>
        🔥 AGORA
      </span>
      <span style={{
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: cores.verdeClaro,
        display: 'block',
        marginBottom: '10px'
      }}>
        Fev 2026
      </span>
      <h3 style={{ 
        fontWeight: 'bold', 
        marginBottom: '10px',
        fontSize: '1.3rem',
        color: 'gold'
      }}>
        🏆 Timbuktoo Hackathon
      </h3>
      <p style={{ 
        fontSize: '0.95rem', 
        opacity: 0.9,
        lineHeight: '1.5',
        flex: 1
      }}>
        Participação no hackathon - 3 dias apresentando a AGROOKUVANJA
      </p>
    </motion.div>

    {/* MARÇO */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      whileHover={{ y: -10 }}
      style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        padding: '30px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.3)',
        height: 'auto',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }}
    >
      <span style={{
        fontSize: '2.2rem',
        fontWeight: 'bold',
        color: cores.verdeClaro,
        display: 'block',
        marginBottom: '15px'
      }}>
        Mar
      </span>
      <h3 style={{ 
        fontWeight: 'bold', 
        marginBottom: '10px',
        fontSize: '1.3rem'
      }}>
        ⚙️ Pós-Hackathon
      </h3>
      <p style={{ 
        fontSize: '0.95rem', 
        opacity: 0.9,
        lineHeight: '1.5',
        flex: 1
      }}>
        Refinamento do protótipo com feedback dos mentores
      </p>
    </motion.div>

    {/* ABRIL */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      whileHover={{ y: -10 }}
      style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        padding: '30px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.3)',
        height: 'auto',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }}
    >
      <span style={{
        fontSize: '2.2rem',
        fontWeight: 'bold',
        color: cores.verdeClaro,
        display: 'block',
        marginBottom: '15px'
      }}>
        Abr
      </span>
      <h3 style={{ 
        fontWeight: 'bold', 
        marginBottom: '10px',
        fontSize: '1.3rem'
      }}>
        📊 Validação
      </h3>
      <p style={{ 
        fontSize: '0.95rem', 
        opacity: 0.9,
        lineHeight: '1.5',
        flex: 1
      }}>
        Testes iniciais com agricultores parceiros
      </p>
    </motion.div>

    {/* MAIO */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ y: -10 }}
      style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        padding: '30px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.3)',
        height: 'auto',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }}
    >
      <span style={{
        fontSize: '2.2rem',
        fontWeight: 'bold',
        color: cores.verdeClaro,
        display: 'block',
        marginBottom: '15px'
      }}>
        Mai
      </span>
      <h3 style={{ 
        fontWeight: 'bold', 
        marginBottom: '10px',
        fontSize: '1.3rem'
      }}>
        🌱 Expansão
      </h3>
      <p style={{ 
        fontSize: '0.95rem', 
        opacity: 0.9,
        lineHeight: '1.5',
        flex: 1
      }}>
        Testes de campo em 5 províncias (planejado)
      </p>
    </motion.div>
  </div>

  {/* Badge "Estamos Aqui" */}
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.6 }}
    style={{
      marginTop: '40px',
      textAlign: 'center'
    }}
  >
    <span style={{
      background: cores.verdeClaro,
      color: cores.verdeAlface,
      padding: '12px 30px',
      borderRadius: '50px',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'inline-block',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      border: `2px solid ${cores.verdePimenta}`
    }}>
      🚀 Estamos aqui: Participando do Timbuktoo Hackathon 2026
    </span>
  </motion.div>
</motion.div>


      {/* ===== PARCEIROS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          marginBottom: '60px'
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.verdeAlface, textAlign: 'center', marginBottom: '40px' }}>
          Parceiros Institucionais
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          alignItems: 'center'
        }}>
          {partners.map((partner, index) => (
            <motion.a
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                padding: '20px',
                borderRadius: '15px',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${cores.verdeClaro}`,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
              }}>
                <img
                  src={partner.logo}
                  alt={partner.nome}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontWeight: 'bold', color: cores.verdeAlface, marginBottom: '5px' }}>
                  {partner.nome}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{partner.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* ===== CALL TO ACTION ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${cores.verdeAlface}, ${cores.verdePimenta})`,
          borderRadius: '30px',
          padding: '60px 40px',
          textAlign: 'center',
          color: 'white'
        }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
          Junte-se a nós nesta missão
        </h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px', opacity: 0.9 }}>
          Estamos transformando a agricultura angolana com tecnologia e conhecimento local
        </p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'white',
              color: cores.verdeAlface,
              border: 'none',
              padding: '15px 35px',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Conheça nossas soluções
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '15px 35px',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Fale com a equipa
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}