// frontend/src/components/AgroOkuvanja/TestPython.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { checkPythonHealth } from '../../services/pythonService';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444'
};

export default function TestPython() {
  const [status, setStatus] = useState('carregando');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    testarConexao();
  }, []);

  const testarConexao = async () => {
    try {
      const result = await checkPythonHealth();
      if (result.status === 'healthy') {
        setStatus('online');
        setInfo(result);
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: cores.verdeAlface, marginBottom: '20px' }}>
        🔌 Status da Integração Python
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          border: `1px solid ${cores.verdeClaro}`
        }}
      >
        {status === 'carregando' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Loader className="spin" />
            <span>A verificar conexão...</span>
          </div>
        )}

        {status === 'online' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle size={24} color={cores.verdePimenta} />
              <span style={{ color: cores.verdeAlface, fontWeight: 'bold' }}>
                ✅ Serviço Python Online
              </span>
            </div>
            
            <div style={{
              background: cores.verdeClaro,
              borderRadius: '10px',
              padding: '15px'
            }}>
              <p><strong>Status:</strong> {info?.status}</p>
              <p><strong>Modelo carregado:</strong> {info?.models_loaded ? '✅ Sim' : '❌ Não'}</p>
              <p><strong>Timestamp:</strong> {new Date(info?.timestamp).toLocaleString()}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ color: cores.verdeAlface, marginBottom: '10px' }}>Endpoints disponíveis:</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={endpointStyle}>POST /api/python/detect/image - Deteção de pragas</li>
                <li style={endpointStyle}>GET /api/python/health - Health check</li>
              </ul>
            </div>
          </>
        )}

        {status === 'offline' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <XCircle size={24} color={cores.vermelho} />
            <span style={{ color: cores.vermelho }}>
              ❌ Serviço Python offline. Verifica se o servidor está rodando.
            </span>
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

const endpointStyle = {
  padding: '8px',
  background: '#F9FAFB',
  borderRadius: '5px',
  marginBottom: '5px',
  fontSize: '0.9rem'
};