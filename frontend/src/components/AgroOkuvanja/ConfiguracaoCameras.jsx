// frontend/src/components/AgroOkuvanja/ConfiguracaoCameras.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Video, Wifi, WifiOff, Play, Pause,
  Settings, Save, Plus, Trash2, Edit, Check,
  AlertTriangle, Loader, RefreshCw, Globe,
  MapPin, Calendar, Clock, Volume2, VolumeX,
  Bell, BellRing, Download, Share2, X
} from 'lucide-react';
import { detectPestFromImage } from '../../services/pythonService';
import vozService from '../../services/vozService';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444',
  amarelo: '#F59E0B',
  azul: '#3B82F6',
  roxo: '#8B5CF6',
  cinza: '#6B7280'
};

// Mapeamento de nomes de pragas
const nomesPortugues = {
  'bird': 'Pássaro',
  'rat': 'Ratazana',
  'mouse': 'Camundongo',
  'roedor': 'Roedor',
  'ave': 'Ave'
};

const getProxyUrl = (camera) => {
  const apiBase = process.env.REACT_APP_API_URL || '';
  const params = new URLSearchParams({ url: camera.url });
  if (camera.username) params.set('username', camera.username);
  if (camera.password) params.set('password', camera.password);
  return `${apiBase}/api/cameras/frame?${params.toString()}`;
};

// Componente para configurar uma câmara (igual ao original)
const CameraConfigModal = ({ isOpen, onClose, onSave, cameraEditando }) => {
  const [formData, setFormData] = useState({
    nome: '',
    url: '',
    tipo: 'ipwebcam',
    username: '',
    password: '',
    localizacao: '',
    notificacoes: true,
    alertasSonoros: true,
    intervalo: 2
  });
  const [testando, setTestando] = useState(false);
  const [testeResultado, setTesteResultado] = useState(null);

  useEffect(() => {
    if (cameraEditando) {
      setFormData(cameraEditando);
    } else {
      setFormData({
        nome: '',
        url: '',
        tipo: 'ipwebcam',
        username: '',
        password: '',
        localizacao: '',
        notificacoes: true,
        alertasSonoros: true,
        intervalo: 2
      });
    }
    setTesteResultado(null);
  }, [cameraEditando, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const testarConexao = async () => {
    setTestando(true);
    setTesteResultado(null);

    try {
      const api = (await import('../../services/api')).default;
      const res = await api.post('/cameras/test', {
        url: formData.url,
        username: formData.username || undefined,
        password: formData.password || undefined
      });
      setTesteResultado(res.data);
    } catch (error) {
      setTesteResultado({ 
        success: false, 
        message: `❌ ${error.response?.data?.message || 'Erro ao testar conexão'}` 
      });
    } finally {
      setTestando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: cameraEditando?.id || Date.now(),
      ativa: cameraEditando?.ativa || false
    });
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: cores.verdeAlface, fontSize: '1.5rem' }}>
            {cameraEditando ? '✏️ Editar Câmara' : '➕ Adicionar Câmara'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={cores.cinza} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Nome da Câmara</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Câmara Talhão Norte"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>URL da Câmara</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="http://192.168.1.100:8080/video"
                required
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={testarConexao}
                disabled={!formData.url || testando}
                style={{
                  padding: '10px 15px',
                  background: testando ? cores.cinza : cores.azul,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: testando ? 'not-allowed' : 'pointer'
                }}
              >
                {testando ? <Loader size={18} className="spin" /> : 'Testar'}
              </button>
            </div>
            {testeResultado && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                background: testeResultado.success ? '#D1FAE5' : '#FEE2E2',
                color: testeResultado.success ? cores.verdeAlface : cores.vermelho,
                borderRadius: '6px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {testeResultado.success ? <Check size={16} /> : <AlertTriangle size={16} />}
                {testeResultado.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Localização (opcional)</label>
            <input
              type="text"
              name="localizacao"
              value={formData.localizacao}
              onChange={handleChange}
              placeholder="Ex: Talhão Norte, Pomar"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Intervalo de deteção (segundos)</label>
            <select
              name="intervalo"
              value={formData.intervalo}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="1">1 segundo (tempo real)</option>
              <option value="2">2 segundos</option>
              <option value="3">3 segundos</option>
              <option value="5">5 segundos</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="notificacoes"
                checked={formData.notificacoes}
                onChange={handleChange}
              />
              <span>Receber notificações</span>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="alertasSonoros"
                checked={formData.alertasSonoros}
                onChange={handleChange}
              />
              <span>Alertas sonoros</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                background: cores.verdePimenta,
                color: cores.verdeAlface,
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <Save size={18} style={{ marginRight: '8px' }} />
              Guardar Câmara
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'white',
                color: cores.cinza,
                border: `1px solid ${cores.verdeClaro}`,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Card de câmara (igual ao original)
const CameraCard = ({ camera, onAtivar, onEditar, onRemover, onVerStream }) => {
  const [testando, setTestando] = useState(false);
  const [testeOk, setTesteOk] = useState(null);

  const testarConexao = async () => {
    setTestando(true);
    setTesteOk(null);
    
    try {
      const api = (await import('../../services/api')).default;
      const res = await api.post('/cameras/test', {
        url: camera.url,
        username: camera.username || undefined,
        password: camera.password || undefined
      });
      setTesteOk(res.data.success);
    } catch {
      setTesteOk(false);
    } finally {
      setTestando(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        background: camera.ativa ? 'white' : '#F9FAFB',
        borderRadius: '15px',
        padding: '20px',
        border: `1px solid ${camera.ativa ? cores.verdePimenta : cores.verdeClaro}`,
        boxShadow: camera.ativa ? '0 5px 15px rgba(130,183,77,0.2)' : 'none',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {camera.ativa ? (
          <>
            <Wifi size={16} color={cores.verdePimenta} />
            <span style={{ fontSize: '0.7rem', color: cores.verdePimenta }}>Online</span>
          </>
        ) : (
          <>
            <WifiOff size={16} color={cores.cinza} />
            <span style={{ fontSize: '0.7rem', color: cores.cinza }}>Offline</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: camera.ativa ? cores.verdeClaro : '#F0F0F0',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Camera size={24} color={camera.ativa ? cores.verdeAlface : cores.cinza} />
        </div>
        <div>
          <h3 style={{ fontWeight: 'bold', color: cores.verdeAlface }}>{camera.nome}</h3>
          <p style={{ fontSize: '0.8rem', color: cores.cinza }}>{camera.localizacao || 'Sem localização'}</p>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: cores.cinza, marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <Globe size={12} />
          <span style={{ wordBreak: 'break-all' }}>{camera.url}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={12} />
          <span>Deteção a cada {camera.intervalo || 2} segundos</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onAtivar(camera.id)}
          style={{
            flex: 1,
            padding: '8px',
            background: camera.ativa ? cores.vermelho : cores.verdePimenta,
            color: camera.ativa ? 'white' : cores.verdeAlface,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}
        >
          {camera.ativa ? '⏹️ Parar' : '▶️ Ativar'}
        </button>
        
        {camera.ativa && (
          <button
            onClick={() => onVerStream(camera)}
            style={{
              padding: '8px 12px',
              background: cores.azul,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Video size={16} />
          </button>
        )}
        
        <button
          onClick={testarConexao}
          disabled={testando}
          style={{
            padding: '8px 12px',
            background: testando ? cores.cinza : 'white',
            color: cores.verdeAlface,
            border: `1px solid ${cores.verdeClaro}`,
            borderRadius: '6px',
            cursor: testando ? 'not-allowed' : 'pointer'
          }}
        >
          {testando ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
        </button>
        
        <button
          onClick={() => onEditar(camera)}
          style={{
            padding: '8px 12px',
            background: 'white',
            color: cores.azul,
            border: `1px solid ${cores.verdeClaro}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Edit size={16} />
        </button>
        
        <button
          onClick={() => onRemover(camera.id)}
          style={{
            padding: '8px 12px',
            background: 'white',
            color: cores.vermelho,
            border: `1px solid ${cores.verdeClaro}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {testeOk !== null && (
        <div style={{
          marginTop: '10px',
          padding: '5px',
          background: testeOk ? '#D1FAE5' : '#FEE2E2',
          color: testeOk ? cores.verdeAlface : cores.vermelho,
          borderRadius: '4px',
          fontSize: '0.7rem',
          textAlign: 'center'
        }}>
          {testeOk ? '✅ Conexão OK' : '❌ Falha na conexão'}
        </div>
      )}
    </motion.div>
  );
};

// Visualizador de stream com TODOS os callbacks (MODIFICADO)
const StreamViewer = ({ 
  camera, 
  onClose,
  onDeteccaoRoedor,    // Para GestaoRoedores
  onDeteccaoAve,       // Para GestaoAves
  onDeteccaoGeral,     // Para Dashboard/Relatórios
  onAtualizarMapaRisco, // Para MapaRisco
  onAtualizarDashboard  // Para atualizar dashboard
}) => {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [audioAtivo, setAudioAtivo] = useState(true);
  const [ultimaDeteccao, setUltimaDeteccao] = useState(null);
  const [contador, setContador] = useState(0);
  const [analisando, setAnalisando] = useState(false);
  const [historicoDeteccoes, setHistoricoDeteccoes] = useState([]);
  const [streamSrc, setStreamSrc] = useState('');
  
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamIntervalRef = useRef(null);

  // Build proxy URL and refresh periodically for live stream
  useEffect(() => {
    if (camera?.url) {
      const refreshStream = () => {
        setStreamSrc(getProxyUrl(camera) + '&t=' + Date.now());
      };
      refreshStream();
      streamIntervalRef.current = setInterval(refreshStream, (camera.intervalo || 2) * 1000);
      return () => clearInterval(streamIntervalRef.current);
    }
  }, [camera?.url, camera?.intervalo, camera?.username, camera?.password]);

  // Função para capturar frame e analisar com o Python (MODIFICADA)
  const capturarEAnalisar = async () => {
    if (!imgRef.current || analisando) return;

    try {
      setAnalisando(true);
      
      // Criar canvas para capturar o frame atual
      const canvas = document.createElement('canvas');
      canvas.width = imgRef.current.naturalWidth || 640;
      canvas.height = imgRef.current.naturalHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
      
      // Converter canvas para blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
      
      // Enviar para API Python
      const resultado = await detectPestFromImage(file);
      
      // SÓ mostrar deteções se houver resultados REAIS
      if (resultado.detections && resultado.detections.length > 0) {
        // Criar objeto completo da deteção
        const novaDeteccao = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          localizacao: camera.localizacao || 'Área da câmara',
          camera: camera.nome,
          cameraId: camera.id,
          detections: resultado.detections.map(d => ({
            ...d,
            class_pt: nomesPortugues[d.class] || d.class
          })),
          total_count: resultado.detections.length,
          confianca_media: resultado.detections.reduce((acc, d) => acc + d.confidence, 0) / resultado.detections.length
        };
        
        setUltimaDeteccao({
          praga: novaDeteccao.detections[0].class_pt,
          hora: new Date().toLocaleTimeString(),
          confianca: Math.round(novaDeteccao.detections[0].confidence * 100)
        });
        
        setContador(prev => prev + 1);
        setHistoricoDeteccoes(prev => [novaDeteccao, ...prev].slice(0, 10));

        // Alertas sonoros
        if (audioAtivo && camera.alertasSonoros) {
          const nomes = novaDeteccao.detections.map(d => d.class_pt).join(' e ');
          vozService.falar(`Atenção! Detectada ${nomes} na ${camera.nome}`);
        }

        // ENVIAR PARA COMPONENTES ESPECÍFICOS
        novaDeteccao.detections.forEach(det => {
          const classe = det.class?.toLowerCase() || '';
          
          // 1. Para GestaoRoedores
          if (classe.includes('rat') || classe.includes('mouse')) {
            if (onDeteccaoRoedor) {
              onDeteccaoRoedor({
                ...det,
                camera: camera.nome,
                localizacao: camera.localizacao,
                timestamp: novaDeteccao.timestamp
              });
            }
          }
          
          // 2. Para GestaoAves
          if (classe.includes('bird') || classe.includes('pigeon')) {
            if (onDeteccaoAve) {
              onDeteccaoAve({
                ...det,
                camera: camera.nome,
                localizacao: camera.localizacao,
                timestamp: novaDeteccao.timestamp
              });
            }
          }
        });
        
        // 3. Para Dashboard/Relatórios (geral)
        if (onDeteccaoGeral) {
          onDeteccaoGeral(novaDeteccao);
        }
        
        // 4. Para Mapa de Risco
        if (onAtualizarMapaRisco) {
          onAtualizarMapaRisco({
            localizacao: camera.localizacao,
            camera: camera.nome,
            pragas: novaDeteccao.detections,
            timestamp: novaDeteccao.timestamp,
            nivelRisco: novaDeteccao.confianca_media > 0.7 ? 'ALTO' : 'MÉDIO'
          });
        }
        
        // 5. Para atualizar dashboard
        if (onAtualizarDashboard) {
          onAtualizarDashboard();
        }
      }
      
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setAnalisando(false);
    }
  };

  // Configurar intervalo de captura
  useEffect(() => {
    if (camera && camera.ativa) {
      setCarregando(false);
      
      const intervalo = (camera.intervalo || 2) * 1000;
      intervalRef.current = setInterval(capturarEAnalisar, intervalo);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [camera, audioAtivo]);

  const handleImageError = () => {
    setErro('Erro ao conectar à câmara. Verifique se a câmara está acessível.');
    setCarregando(false);
  };

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
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        background: '#1a1a1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          <h2 style={{ fontSize: '1.2rem' }}>
            📹 {camera.nome} - {camera.localizacao || 'Sem localização'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => setAudioAtivo(!audioAtivo)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            {audioAtivo ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <span style={{ 
            background: contador > 0 ? cores.vermelho : cores.cinza,
            padding: '5px 10px', 
            borderRadius: '20px', 
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <AlertTriangle size={14} />
            Pragas: {contador}
          </span>
        </div>
      </div>

      {/* Stream */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {carregando ? (
          <div style={{ textAlign: 'center' }}>
            <Loader size={48} className="spin" color={cores.verdePimenta} />
            <p style={{ color: 'white', marginTop: '10px' }}>A conectar à câmara...</p>
          </div>
        ) : erro ? (
          <div style={{ textAlign: 'center', color: cores.vermelho }}>
            <AlertTriangle size={48} />
            <p style={{ marginTop: '10px' }}>{erro}</p>
            <p style={{ fontSize: '0.9rem', color: cores.cinza, marginTop: '10px' }}>
              Verifique se:
              <br />• A câmara está ligada
              <br />• O URL está correto
              <br />• A câmara permite acesso externo
            </p>
          </div>
        ) : (
          <>
            <img
              ref={imgRef}
              src={streamSrc}
              crossOrigin="anonymous"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              alt={`Stream ${camera.nome}`}
              onLoad={() => setCarregando(false)}
              onError={handleImageError}
            />
            {analisando && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem'
              }}>
                <Loader size={12} className="spin" style={{ marginRight: '5px' }} />
                Analisando...
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Overlay de deteção */}
      <AnimatePresence>
        {ultimaDeteccao && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '80px',
              right: '20px',
              background: cores.vermelho,
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
              maxWidth: '250px',
              zIndex: 10002
            }}
          >
            <AlertTriangle size={20} style={{ marginBottom: '5px' }} />
            <p style={{ fontWeight: 'bold' }}>⚠️ PRAGA DETECTADA!</p>
            <p style={{ fontSize: '0.9rem' }}>Tipo: {ultimaDeteccao.praga}</p>
            <p style={{ fontSize: '0.9rem' }}>Confiança: {ultimaDeteccao.confianca}%</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>{ultimaDeteccao.hora}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé */}
      <div style={{
        padding: '10px 20px',
        background: '#1a1a1a',
        color: 'white',
        fontSize: '0.9rem',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>⏱️ Análise a cada {camera.intervalo || 2} segundos</span>
        <span>🎥 {historicoDeteccoes.length} deteções registadas</span>
      </div>
    </motion.div>
  );
};

// Componente principal (MODIFICADO - recebe novas props)
export default function ConfiguracaoCameras({ 
  onAtualizarDashboard,
  onDeteccaoRoedor,
  onDeteccaoAve,
  onDeteccaoGeral,
  onAtualizarMapaRisco,
  onCamerasChange
}) {
  const [cameras, setCameras] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [cameraEditando, setCameraEditando] = useState(null);
  const [streamAtivo, setStreamAtivo] = useState(null);
  const [audioGlobal, setAudioGlobal] = useState(true);

  useEffect(() => {
    carregarCameras();
  }, []);

  const carregarCameras = () => {
    const saved = localStorage.getItem('agrookuvanja_cameras');
    if (saved) {
      setCameras(JSON.parse(saved));
    } else {
      setCameras([]);
    }
  };

  const salvarCameras = (novasCameras) => {
    setCameras(novasCameras);
    localStorage.setItem('agrookuvanja_cameras', JSON.stringify(novasCameras));
    if (onCamerasChange) onCamerasChange(novasCameras);
  };

  const handleAdicionar = (novaCamera) => {
    const novas = [...cameras, { ...novaCamera, id: Date.now() }];
    salvarCameras(novas);
    setModalAberto(false);
    setCameraEditando(null);
    
    vozService.falar(`Câmara ${novaCamera.nome} adicionada com sucesso`);
  };

  const handleEditar = (cameraEditada) => {
    const novas = cameras.map(cam => 
      cam.id === cameraEditada.id ? cameraEditada : cam
    );
    salvarCameras(novas);
    setModalAberto(false);
    setCameraEditando(null);
  };

  const handleRemover = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta câmara?')) {
      const novas = cameras.filter(cam => cam.id !== id);
      salvarCameras(novas);
      vozService.falar('Câmara removida');
    }
  };

  const handleAtivar = (id) => {
    const novas = cameras.map(cam =>
      cam.id === id ? { ...cam, ativa: !cam.ativa } : cam
    );
    salvarCameras(novas);

    const camera = novas.find(c => c.id === id);
    if (camera.ativa) {
      vozService.falar(`Câmara ${camera.nome} ativada`);
    } else {
      vozService.falar(`Câmara ${camera.nome} desativada`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.verdeAlface }}>
            🎥 Configuração de Câmaras
          </h1>
          <p style={{ color: cores.cinza, marginTop: '5px' }}>
            Adicione as tuas câmaras IP para monitorização em tempo real
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setAudioGlobal(!audioGlobal)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: audioGlobal ? cores.verdePimenta : cores.vermelho,
              color: audioGlobal ? cores.verdeAlface : 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {audioGlobal ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {audioGlobal ? 'Alertas Ativos' : 'Alertas Mudos'}
          </button>

          <button
            onClick={() => {
              setCameraEditando(null);
              setModalAberto(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: cores.verdeAlface,
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <Plus size={18} />
            Adicionar Câmara
          </button>
        </div>
      </motion.div>

      {/* Informações importantes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: cores.azul + '10',
          borderRadius: '15px',
          padding: '15px',
          marginBottom: '20px',
          border: `1px solid ${cores.azul}`,
          color: cores.azul
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={20} />
          <span>
            Para câmaras IP, use URLs como: 
            <strong> http://192.168.1.100:8080/video</strong> (IP Webcam Android) ou 
            <strong> rtsp://usuario:senha@192.168.1.101:554/stream1</strong> (RTSP)
          </span>
        </div>
      </motion.div>

      {/* Grid de câmaras */}
      {cameras.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '60px 40px',
          textAlign: 'center',
          border: `2px dashed ${cores.verdeClaro}`
        }}>
          <Camera size={64} color={cores.cinza} />
          <h3 style={{ color: cores.verdeAlface, marginTop: '20px', fontSize: '1.3rem' }}>
            Nenhuma câmara configurada
          </h3>
          <p style={{ color: cores.cinza, marginTop: '10px', maxWidth: '400px', margin: '10px auto' }}>
            Adicione a tua primeira câmara IP para começar a monitorizar as tuas plantações em tempo real.
          </p>
          <button
            onClick={() => {
              setCameraEditando(null);
              setModalAberto(true);
            }}
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              background: cores.verdePimenta,
              color: cores.verdeAlface,
              border: 'none',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={20} />
            Adicionar Primeira Câmara
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          <AnimatePresence>
            {cameras.map(camera => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onAtivar={handleAtivar}
                onEditar={(cam) => {
                  setCameraEditando(cam);
                  setModalAberto(true);
                }}
                onRemover={handleRemover}
                onVerStream={setStreamAtivo}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de configuração */}
      <AnimatePresence>
        {modalAberto && (
          <CameraConfigModal
            isOpen={modalAberto}
            onClose={() => {
              setModalAberto(false);
              setCameraEditando(null);
            }}
            onSave={cameraEditando ? handleEditar : handleAdicionar}
            cameraEditando={cameraEditando}
          />
        )}
      </AnimatePresence>

      {/* Visualizador de stream - AGORA COM CALLBACKS */}
      <AnimatePresence>
        {streamAtivo && (
          <StreamViewer
            camera={streamAtivo}
            onClose={() => setStreamAtivo(null)}
            onDeteccaoRoedor={onDeteccaoRoedor}
            onDeteccaoAve={onDeteccaoAve}
            onDeteccaoGeral={onDeteccaoGeral}
            onAtualizarMapaRisco={onAtualizarMapaRisco}
            onAtualizarDashboard={onAtualizarDashboard}
          />
        )}
      </AnimatePresence>

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

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  color: cores.verdeAlface,
  fontWeight: '500',
  fontSize: '0.9rem'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: `1px solid ${cores.verdeClaro}`,
  fontSize: '0.95rem'
};