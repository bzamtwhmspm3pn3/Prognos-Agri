import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Shield, Zap } from 'lucide-react';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8'
};

export default function Hero({ onComecarClick }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${cores.verdeAlface}, ${cores.verdePimenta})`,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos animados */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
          }}
          transition={{ 
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 0.2
          }}
          style={{
            position: 'absolute',
            fontSize: `${20 + Math.random() * 40}px`,
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        >
          {['🌱', '🌿', '🍃', '🌾'][i % 4]}
        </motion.div>
      ))}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', color: 'white' }}
        >
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '20px' }}
          >
            AGROOKUVANJA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '1.5rem', marginBottom: '40px', opacity: 0.9 }}
          >
            Protegendo colheitas, alimentando o futuro
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onComecarClick}
            style={{
              backgroundColor: cores.verdeClaro,
              color: cores.verdeAlface,
              border: 'none',
              padding: '15px 40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '50px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '60px'
            }}
          >
            Começar Agora <ArrowRight />
          </motion.button>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Award />, text: 'Timbuktoo Hackathon' },
              { icon: <Shield />, text: '98% Precisão' },
              { icon: <Zap />, text: 'IA Avançada' }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}