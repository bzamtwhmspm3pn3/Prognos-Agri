import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, Image, AlertTriangle, CheckCircle, X, Bug, Bird, Rat,
  Loader, Wifi, WifiOff, Volume2, Save, History, Download, Sparkles
} from 'lucide-react';
import PrognosCard from '../components/PrognosCard';
import { detectPestFromImage, checkPythonHealth, mockDetectPestFromImage } from '../../services/pythonService';
import { deteccaoApi } from '../../services/deteccaoApi';
import vozService from '../../services/vozService';
import { useIntegracao } from '../contexts/IntegracaoContext';

const nomesPortugues = {
  'bird': 'Pássaro', 'pigeon': 'Pombo', 'sparrow': 'Pardal',
  'weaver': 'Pássaro-tecelão', 'crow': 'Corvo', 'dove': 'Pomba',
  'rat': 'Ratazana', 'mouse': 'Camundongo', 'rodent': 'Roedor', 'squirrel': 'Esquilo',
  'locust': 'Gafanhoto', 'grasshopper': 'Gafanhoto', 'beetle': 'Besouro',
  'caterpillar': 'Lagarta', 'ant': 'Formiga', 'fly': 'Mosca', 'mosquito': 'Mosquito',
  'bee': 'Abelha', 'wasp': 'Vespa', 'spider': 'Aranha', 'aphid': 'Pulgão',
  'whitefly': 'Mosca-branca', 'thrips': 'Tripes', 'scale': 'Cochonilha',
  'fall_armyworm': 'Lagarta-do-cartucho', 'corn_borer': 'Broca-do-milho',
  'default': 'Praga não identificada'
};

const recomendacoesPorPraga = {
  roedor: [
    'Instalar armadilhas ecológicas com iscas naturais',
    'Plantar hortelã-pimenta, lavanda e alecrim como repelentes naturais',
    'Utilizar predadores naturais como corujas e gatos',
    'Vedar todas as entradas com lã de aço e materiais reciclados',
    'Manter o terreno limpo sem acúmulo de entulho',
    'Armazenar grãos em recipientes herméticos'
  ],
  ave: [
    'Instalar redes de proteção biodegradáveis nas culturas',
    'Plantar culturas armadilha (milho, sorgo) em áreas periféricas',
    'Dispositivos sonoros com energia solar (ultrassom)',
    'Aplicar repelentes naturais à base de extratos de pimenta',
    'Oferecer áreas alternativas para alimentação',
    'Instalar bebedouros longe das culturas principais'
  ],
  inseto: [
    'Controle biológico com fungos entomopatogênicos (Metarhizium)',
    'Plantar crotalária e outras culturas repelentes',
    'Armadilhas luminosas com energia solar',
    'Introduzir joaninhas, crisopas e outros predadores naturais',
    'Aplicar óleo de nim e extratos vegetais',
    'Fazer rotação de culturas'
  ],
  gafanhoto: [
    'Aplicar fungos entomopatogênicos (Metarhizium acridum)',
    'Plantar barreiras verdes com culturas não palatáveis',
    'Proteger pássaros e outros predadores naturais',
    'Pulverizar com óleo de nim e extratos de alho',
    'Monitorar áreas de reprodução após chuvas',
    'Destruir ovos em áreas de postura'
  ],
  lagarta: [
    'Aplicar Bacillus thuringiensis (BT) - biológico e eficaz',
    'Plantar atrativos para vespas parasitoides',
    'Proteger predadores naturais',
    'Pulverizar com extrato de nim e fumo',
    'Fazer inspeção frequente das plantas',
    'Eliminar restos culturais após colheita'
  ],
  default: [
    'Consultar um técnico agrónomo para avaliação específica',
    'Aumentar a frequência de monitoramento na área',
    'Registrar todas as ocorrências para histórico',
    'Considerar medidas de controlo integrado de pragas',
    'Monitorar condições climáticas',
    'Implementar rotação de culturas'
  ]
};

function getRecomendacoes(detections) {
  const tipos = new Set();
  detections.forEach(d => {
    const cls = d.class?.toLowerCase() || '';
    if (['rat', 'mouse', 'rodent', 'squirrel'].includes(cls)) tipos.add('roedor');
    else if (['bird', 'pigeon', 'sparrow', 'weaver', 'crow', 'dove'].includes(cls)) tipos.add('ave');
    else if (['locust', 'grasshopper'].includes(cls)) tipos.add('gafanhoto');
    else if (['caterpillar', 'fall_armyworm', 'corn_borer'].includes(cls)) tipos.add('lagarta');
    else if (['beetle', 'ant', 'fly', 'mosquito', 'bee', 'wasp', 'spider', 'aphid', 'whitefly', 'thrips', 'scale'].includes(cls)) tipos.add('inseto');
    else tipos.add('default');
  });
  const recs = [];
  tipos.forEach(t => {
    recs.push(`--- ${t === 'roedor' ? 'Roedores' : t === 'ave' ? 'Aves' : t === 'gafanhoto' ? 'Gafanhotos' : t === 'lagarta' ? 'Lagartas' : t === 'inseto' ? 'Insetos' : 'Geral'} ---`);
    recomendacoesPorPraga[t]?.forEach(r => recs.push(r));
  });
  return recs;
}

function calcularImpacto(detections) {
  const perdas = { roedor: 15000, ave: 8000, inseto: 5000, gafanhoto: 20000, lagarta: 12000, default: 3000 };
  let total = 0;
  detections.forEach(d => {
    const cls = d.class?.toLowerCase() || '';
    if (['rat', 'mouse', 'rodent', 'squirrel'].includes(cls)) total += perdas.roedor;
    else if (['bird', 'pigeon', 'sparrow', 'weaver', 'crow', 'dove'].includes(cls)) total += perdas.ave;
    else if (['locust', 'grasshopper'].includes(cls)) total += perdas.gafanhoto;
    else if (['caterpillar', 'fall_armyworm', 'corn_borer'].includes(cls)) total += perdas.lagarta;
    else if (['beetle', 'ant', 'fly', 'mosquito', 'bee', 'wasp', 'spider', 'aphid', 'whitefly', 'thrips', 'scale'].includes(cls)) total += perdas.inseto;
    else total += perdas.default;
  });
  const avgConf = detections.reduce((s, d) => s + (d.confidence || 0), 0) / detections.length;
  const nivel = avgConf > 0.8 ? 'ALTO' : avgConf > 0.5 ? 'MÉDIO' : 'BAIXO';
  return { total, nivel };
}

function getIconForClass(cls) {
  const c = cls?.toLowerCase() || '';
  if (['bird', 'pigeon', 'sparrow', 'weaver', 'crow', 'dove'].includes(c)) return 'bird';
  if (['rat', 'mouse', 'rodent', 'squirrel'].includes(c)) return 'rat';
  return 'bug';
}

function getColorForClass(cls) {
  const c = cls?.toLowerCase() || '';
  if (['bird', 'pigeon', 'sparrow', 'weaver', 'crow', 'dove'].includes(c)) return '#F5A623';
  if (['rat', 'mouse', 'rodent', 'squirrel'].includes(c)) return '#8B4513';
  return '#3b82f6';
}

export default function DeteccaoPragas() {
  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pythonStatus, setPythonStatus] = useState('checking');
  const [historico, setHistorico] = useState([]);
  const [saving, setSaving] = useState(false);
  const [somAtivo, setSomAtivo] = useState(true);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState(null);
  const [camerasIP, setCamerasIP] = useState([]);
  const [cameraIPSelecionada, setCameraIPSelecionada] = useState(null);
  const [ipCameraFeedAtiva, setIpCameraFeedAtiva] = useState(false);
  const [ipCameraErro, setIpCameraErro] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const ipCameraImgRef = useRef(null);
  const { getActiveCameras, emitirDeteccao } = useIntegracao();

  useEffect(() => {
    checkPythonHealth().then(status => {
      setPythonStatus(status.online ? 'online' : 'offline');
    });
    try {
      const saved = JSON.parse(localStorage.getItem('prognos_deteccoes') || '[]');
      setHistorico(saved);
    } catch {}
    setCamerasIP(getActiveCameras());
    return () => pararCamera();
  }, [getActiveCameras]);

  const iniciarCamera = async () => {
    setErroCamera(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraAtiva(true);
    } catch (err) {
      console.error('Erro ao aceder à câmera:', err);
      setErroCamera('Não foi possível aceder à câmera. Verifique as permissões.');
    }
  };

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraAtiva(false);
  };

  const capturarCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setResultado(null);
      pararCamera();
    }, 'image/jpeg', 0.9);
  };

  const capturarFrameIP = () => {
    if (!ipCameraImgRef.current) return;
    const img = ipCameraImgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 640;
    canvas.height = img.naturalHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], `ipcam_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setResultado(null);
      setIpCameraFeedAtiva(false);
    }, 'image/jpeg', 0.9);
  };

  const handleFile = (file) => {
    if (!file) return;
    setImagem(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultado(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDetectar = async () => {
    if (!imagem) return;
    setLoading(true);

    try {
      let data;
      let usedMock = false;
      if (pythonStatus === 'online') {
        try {
          data = await detectPestFromImage(imagem);
        } catch (e) {
          console.warn('API Python falhou, a usar fallback local:', e.message);
          setPythonStatus('offline');
          data = await mockDetectPestFromImage();
          usedMock = true;
        }
      } else {
        data = await mockDetectPestFromImage();
        usedMock = true;
      }

      const detections = (data.detections || data.resultados || []).map(d => ({
        ...d,
        class_pt: nomesPortugues[d.class?.toLowerCase()] || d.class_pt || nomesPortugues.default
      }));

      const impacto = data.impact?.nivel_risco
        ? { total: data.impact.total_loss_kz || 0, nivel: data.impact.nivel_risco }
        : calcularImpacto(detections);

      const recomendacoes = data.recomendacoes || getRecomendacoes(detections);
      const totalCount = data.total_count || detections.length;

      const novoResultado = {
        total_count: totalCount,
        nivelRisco: impacto.nivel,
        detections,
        perdaEstimada: impacto.total,
        recomendacoes,
        timestamp: new Date().toISOString(),
        modoSimulacao: usedMock || data.modoSimulacao || false
      };

      setResultado(novoResultado);

      if (somAtivo) {
        const pestNames = detections.map(d => d.class_pt).join(' e ');
        vozService.falar(`Detetados ${totalCount} ${totalCount === 1 ? 'praga' : 'pragas'}: ${pestNames}. Nível de risco ${impacto.nivel}. Perda estimada ${impacto.total.toLocaleString()} kwanzas.`);
      }

      const novoHistorico = [novoResultado, ...historico].slice(0, 20);
      setHistorico(novoHistorico);
      localStorage.setItem('prognos_deteccoes', JSON.stringify(novoHistorico));

      emitirDeteccao(novoResultado);

      try {
        setSaving(true);
        await deteccaoApi.salvar({
          imagemUrl: previewUrl,
          localizacao: { type: 'Point', coordinates: [0, 0] },
          detections,
          nivelRisco: impacto.nivel,
          perdaEstimada: impacto.total
        });
      } catch {
        // Fallback: já salvo no localStorage
      } finally {
        setSaving(false);
      }
    } catch (err) {
      console.error('Erro na deteção:', err);
      if (somAtivo) {
        vozService.falar('Erro ao processar imagem. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportHistorico = () => {
    const blob = new Blob([JSON.stringify(historico, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deteccoes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCorRisco = (nivel) => {
    switch (nivel) {
      case 'CRÍTICO': case 'ALTO': return '#ef4444';
      case 'MÉDIO': return '#F5A623';
      case 'BAIXO': return '#4A7C59';
      default: return '#64748b';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>
            🔍 Detecção de Pragas
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Faça upload de uma imagem para identificar pragas com IA
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '50px',
            background: pythonStatus === 'online' ? 'rgba(74,124,89,0.1)' :
                       pythonStatus === 'offline' ? 'rgba(239,68,68,0.1)' : 'rgba(245,166,35,0.1)',
            fontSize: '0.8rem', fontWeight: 500
          }}>
            {pythonStatus === 'online' ? <Wifi size={14} color="#4A7C59" /> :
             pythonStatus === 'offline' ? <WifiOff size={14} color="#ef4444" /> :
             <Loader size={14} className="spinner" />}
            <span style={{
              color: pythonStatus === 'online' ? '#4A7C59' :
                     pythonStatus === 'offline' ? '#ef4444' : '#F5A623'
            }}>
              {pythonStatus === 'online' ? 'IA Online' :
               pythonStatus === 'offline' ? 'Modo Simulação' : 'A verificar...'}
            </span>
          </div>
          <button
            onClick={() => setSomAtivo(!somAtivo)}
            style={{
              padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer',
              color: somAtivo ? 'var(--secondary)' : 'var(--text-muted)'
            }}
            title={somAtivo ? 'Desativar som' : 'Ativar som'}
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
        <div>
          <PrognosCard title="Upload de Imagem" icon={<Camera size={18} />}>
            {/* Câmera do dispositivo */}
            {cameraAtiva && (
              <div style={{ marginBottom: '16px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%', maxHeight: '300px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'contain', background: '#000'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button className="btn btn-secondary" onClick={pararCamera} style={{ flex: 1 }}>
                    <X size={16} /> Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={capturarCamera} style={{ flex: 1 }}>
                    <Camera size={16} /> Capturar
                  </button>
                </div>
              </div>
            )}

            {/* Feed de câmara IP */}
            {ipCameraFeedAtiva && cameraIPSelecionada && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  position: 'relative',
                  background: '#000', borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden', minHeight: '200px'
                }}>
                  <img
                    ref={ipCameraImgRef}
                    src={cameraIPSelecionada.url + '?t=' + Date.now()}
                    style={{
                      width: '100%', maxHeight: '300px',
                      objectFit: 'contain'
                    }}
                    alt={`Feed ${cameraIPSelecionada.nome}`}
                    onError={() => setIpCameraErro('Erro ao conectar à câmara IP')}
                  />
                </div>
                {ipCameraErro && (
                  <div style={{
                    padding: '8px', background: 'rgba(239,68,68,0.1)',
                    borderRadius: 'var(--radius)', marginTop: '8px',
                    fontSize: '0.85rem', color: '#ef4444'
                  }}>
                    {ipCameraErro}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => { setIpCameraFeedAtiva(false); setIpCameraErro(null); }} style={{ flex: 1 }}>
                    <X size={16} /> Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={capturarFrameIP} style={{ flex: 1 }}>
                    <Camera size={16} /> Capturar Frame
                  </button>
                </div>
              </div>
            )}

            {/* Drop zone / Preview */}
            {!cameraAtiva && !ipCameraFeedAtiva && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: previewUrl ? 'transparent' : 'var(--bg-body)',
                  transition: 'all 0.3s ease',
                  marginBottom: '16px'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{
                    maxWidth: '100%', maxHeight: '300px',
                    borderRadius: 'var(--radius)', objectFit: 'contain'
                  }} />
                ) : (
                  <>
                    <Image size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>
                      Clique ou arraste uma imagem aqui
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      JPG, PNG ou WEBP • Máx 10MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            )}

            {erroCamera && (
              <div style={{
                padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
                borderRadius: 'var(--radius)', marginBottom: '12px',
                fontSize: '0.85rem', color: '#ef4444'
              }}>
                {erroCamera}
              </div>
            )}

            {/* Câmaras IP configuradas */}
            {!cameraAtiva && !ipCameraFeedAtiva && !previewUrl && camerasIP.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Câmaras configuradas:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {camerasIP.map(cam => (
                    <button
                      key={cam.id}
                      onClick={() => { setCameraIPSelecionada(cam); setIpCameraFeedAtiva(true); setIpCameraErro(null); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', background: 'var(--bg-body)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                        cursor: 'pointer', textAlign: 'left', width: '100%'
                      }}
                    >
                      <Camera size={16} color="var(--secondary)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{cam.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cam.localizacao || cam.url}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Usar →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {previewUrl && (
                <button className="btn btn-ghost" onClick={() => { setImagem(null); setPreviewUrl(null); setResultado(null); }}>
                  <X size={16} /> Remover
                </button>
              )}
              {!cameraAtiva && !ipCameraFeedAtiva && !previewUrl && (
                <button className="btn btn-secondary" onClick={iniciarCamera} style={{ flex: 1 }}>
                  <Camera size={16} /> Abrir Câmera
                </button>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={handleDetectar}
                disabled={!imagem || loading}
                style={{ flex: 1 }}
              >
                {loading ? <Loader size={18} className="spinner" /> : <Sparkles size={18} />}
                {loading ? 'A analisar com IA...' : 'Detectar Pragas'}
              </button>
            </div>
          </PrognosCard>

          {historico.length > 0 && (
            <PrognosCard title="Histórico" icon={<History size={18} />} style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Últimas {Math.min(historico.length, 20)} deteções
                </span>
                <button className="btn btn-ghost" onClick={handleExportHistorico} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  <Download size={14} /> Exportar
                </button>
              </div>
              {historico.slice(0, 5).map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', background: 'var(--bg-body)',
                  borderRadius: 'var(--radius)', marginBottom: '6px',
                  cursor: 'pointer', fontSize: '0.85rem'
                }} onClick={() => setResultado(h)}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: getCorRisco(h.nivelRisco), flexShrink: 0
                  }} />
                  <span style={{ flex: 1, fontWeight: 500 }}>{h.total_count} praga(s)</span>
                  <span style={{ color: getCorRisco(h.nivelRisco), fontWeight: 600, fontSize: '0.75rem' }}>
                    {h.nivelRisco}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(h.timestamp).toLocaleDateString('pt-AO')}
                  </span>
                </div>
              ))}
            </PrognosCard>
          )}
        </div>

        {resultado && (
          <div>
            <PrognosCard title="Resultado da Detecção" icon={<Bug size={18} />}>
              {saving && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', background: 'rgba(59,130,246,0.1)',
                  borderRadius: 'var(--radius)', marginBottom: '12px',
                  fontSize: '0.85rem', color: '#3b82f6'
                }}>
                  <Loader size={14} className="spinner" /> A salvar no servidor...
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: `${getCorRisco(resultado.nivelRisco)}10`,
                border: `1px solid ${getCorRisco(resultado.nivelRisco)}30`,
                marginBottom: '16px'
              }}>
                <AlertTriangle size={24} color={getCorRisco(resultado.nivelRisco)} />
                <div>
                  <div style={{ fontWeight: 700, color: getCorRisco(resultado.nivelRisco) }}>
                    Nível de Risco: {resultado.nivelRisco}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {resultado.total_count} praga(s) detectada(s) • Perda estimada: {resultado.perdaEstimada.toLocaleString()} Kz
                  </div>
                </div>
              </div>

              <h4 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem' }}>
                Pragas Detectadas:
              </h4>
              {resultado.detections.map((det, i) => {
                const iconType = getIconForClass(det.class);
                const color = getColorForClass(det.class);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', background: 'var(--bg-body)',
                    borderRadius: 'var(--radius)', marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: `${color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color
                    }}>
                      {iconType === 'bird' ? <Bird size={18} /> :
                       iconType === 'rat' ? <Rat size={18} /> : <Bug size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{det.class_pt}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Confiança: {Math.round((det.confidence || 0) * 100)}%
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: '50px',
                      background: det.confidence > 0.7 ? 'rgba(239,68,68,0.1)' :
                                 det.confidence > 0.4 ? 'rgba(245,166,35,0.1)' : 'rgba(74,124,89,0.1)',
                      color: det.confidence > 0.7 ? '#ef4444' :
                             det.confidence > 0.4 ? '#F5A623' : '#4A7C59',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>
                      {det.confidence > 0.7 ? 'ALTA' : det.confidence > 0.4 ? 'MÉDIA' : 'BAIXA'}
                    </div>
                  </div>
                );
              })}
            </PrognosCard>

            <PrognosCard title="Recomendações" icon={<CheckCircle size={18} />} style={{ marginTop: '16px' }}>
              {resultado.recomendacoes.map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', padding: '10px 0',
                  borderBottom: i < resultado.recomendacoes.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <CheckCircle size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{rec}</span>
                </div>
              ))}
            </PrognosCard>
          </div>
        )}

        {!resultado && !loading && (
          <PrognosCard title="Como funciona" icon={<Sparkles size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { passo: '1', desc: 'Faça upload de uma foto da sua plantação' },
                { passo: '2', desc: 'A IA analisa e identifica pragas automaticamente' },
                { passo: '3', desc: 'Receba recomendações personalizadas de controlo' },
                { passo: '4', desc: 'Acompanhe as métricas e evolução no Dashboard' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
                  }}>{item.passo}</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </PrognosCard>
        )}
      </div>
    </div>
  );
}
