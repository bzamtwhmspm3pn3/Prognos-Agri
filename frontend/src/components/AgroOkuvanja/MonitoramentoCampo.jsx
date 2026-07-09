// src/components/AgroOkuvanja/MonitoramentoCampo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, MapPin, Calendar, Clock, Thermometer,
  Droplets, Wind, Sun, Volume2, Navigation,
  Compass, Cloud, CloudRain, Eye, RefreshCw,
  Share2  // ← Share2 adicionado aqui
} from 'lucide-react';
import vozService from '../../services/vozService';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelho: '#EF4444',
  amarelo: '#F59E0B',
  azul: '#3B82F6',
  laranja: '#F97316',
  roxo: '#8B5CF6'
};

export default function MonitoramentoCampo({ onNovaDeteccao, onAtualizarDashboard }) {
  const [dados, setDados] = useState({
    localizacao: null,
    clima: null,
    fotos: [],
    carregandoGeo: true,
    carregandoClima: true,
    erroGeo: null,
    erroClima: null
  });

  const [fotoAtual, setFotoAtual] = useState(null);
  const [modoCamera, setModoCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // ===== OBTER LOCALIZAÇÃO REAL =====
  useEffect(() => {
    obterLocalizacao();
  }, []);

  const obterLocalizacao = () => {
    setDados(prev => ({ ...prev, carregandoGeo: true, erroGeo: null }));

    if (!navigator.geolocation) {
      setDados(prev => ({
        ...prev,
        carregandoGeo: false,
        erroGeo: 'Geolocalização não é suportada pelo seu navegador'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Sucesso
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Obter endereço a partir das coordenadas (geocodificação reversa)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const localizacao = {
            latitude,
            longitude,
            precisao: position.coords.accuracy,
            altitude: position.coords.altitude,
            endereco: data.display_name || '',
            cidade: data.address?.city || data.address?.town || data.address?.village || 'Desconhecido',
            regiao: data.address?.state || '',
            pais: data.address?.country || '',
            bairro: data.address?.suburb || data.address?.neighbourhood || '',
            timestamp: new Date().toISOString()
          };

          setDados(prev => ({
            ...prev,
            localizacao,
            carregandoGeo: false
          }));

          // Após obter localização, buscar clima
          obterClima(latitude, longitude);

        } catch (error) {
          console.error('Erro ao obter endereço:', error);
          setDados(prev => ({
            ...prev,
            localizacao: {
              latitude,
              longitude,
              precisao: position.coords.accuracy,
              altitude: position.coords.altitude,
              timestamp: new Date().toISOString()
            },
            carregandoGeo: false
          }));
          
          // Mesmo sem endereço, buscar clima
          obterClima(latitude, longitude);
        }
      },
      // Erro
      (error) => {
        let mensagemErro = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            mensagemErro = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            mensagemErro = 'Informação de localização indisponível';
            break;
          case error.TIMEOUT:
            mensagemErro = 'Tempo excedido ao obter localização';
            break;
          default:
            mensagemErro = 'Erro desconhecido ao obter localização';
        }
        
        setDados(prev => ({
          ...prev,
          carregandoGeo: false,
          erroGeo: mensagemErro
        }));
      },
      // Opções
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // ===== OBTER CLIMA REAL =====
  const obterClima = async (lat, lon) => {
    setDados(prev => ({ ...prev, carregandoClima: true, erroClima: null }));

    try {
      // Usando API grátis do Open-Meteo (não precisa de chave)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`
      );
      
      const data = await response.json();

      // Mapear código do tempo para descrição
      const descricaoTempo = obterDescricaoTempo(data.current?.weather_code);

      const clima = {
        temperatura: data.current?.temperature_2m || 0,
        humidade: data.current?.relative_humidity_2m || 0,
        ventoVelocidade: data.current?.wind_speed_10m || 0,
        ventoDirecao: data.current?.wind_direction_10m || 0,
        precipitacao: data.current?.precipitation || 0,
        chuva: data.current?.rain || 0,
        pressao: data.current?.pressure_msl || 0,
        nebulosidade: data.current?.cloud_cover || 0,
        indiceUV: data.current?.uv_index || 0,
        codigoTempo: data.current?.weather_code,
        descricaoTempo,
        icone: obterIconeTempo(data.current?.weather_code),
        atualizadoEm: new Date().toISOString(),
        proximasHoras: data.hourly?.time?.slice(0, 8).map((time, index) => ({
          hora: new Date(time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          temp: data.hourly.temperature_2m[index],
          probChuva: data.hourly.precipitation_probability[index],
          codigoTempo: data.hourly.weather_code[index]
        })) || []
      };

      setDados(prev => ({
        ...prev,
        clima,
        carregandoClima: false
      }));

    } catch (error) {
      console.error('Erro ao obter clima:', error);
      setDados(prev => ({
        ...prev,
        carregandoClima: false,
        erroClima: 'Erro ao carregar dados climáticos'
      }));
    }
  };

  // ===== FUNÇÕES AUXILIARES PARA CLIMA =====
  const obterDescricaoTempo = (code) => {
    const codigos = {
      0: 'Céu limpo',
      1: 'Principalmente limpo',
      2: 'Parcialmente nublado',
      3: 'Encoberto',
      45: 'Nevoeiro',
      48: 'Nevoeiro com geada',
      51: 'Chuvisco leve',
      53: 'Chuvisco moderado',
      55: 'Chuvisco intenso',
      56: 'Chuvisco congelante leve',
      57: 'Chuvisco congelante intenso',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva intensa',
      66: 'Chuva congelante leve',
      67: 'Chuva congelante intensa',
      71: 'Neve leve',
      73: 'Neve moderada',
      75: 'Neve intensa',
      77: 'Grãos de neve',
      80: 'Pancadas de chuva leves',
      81: 'Pancadas de chuva moderadas',
      82: 'Pancadas de chuva violentas',
      85: 'Pancadas de neve leves',
      86: 'Pancadas de neve intensas',
      95: 'Tempestade',
      96: 'Tempestade com granizo leve',
      99: 'Tempestade com granizo intenso'
    };
    return codigos[code] || 'Condições desconhecidas';
  };

  const obterIconeTempo = (code) => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '☔';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '☀️';
  };

  // ===== FUNÇÕES DA CÂMARA =====
  const iniciarCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usar câmera traseira se disponível
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      setStream(mediaStream);
      setModoCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setModoCamera(false);
    setFotoAtual(null);
  };

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const fotoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Criar objeto da foto com dados reais
      const novaFoto = {
        id: Date.now(),
        dataUrl: fotoDataUrl,
        timestamp: new Date().toISOString(),
        localizacao: dados.localizacao ? {
          latitude: dados.localizacao.latitude,
          longitude: dados.localizacao.longitude,
          endereco: dados.localizacao.endereco,
          precisao: dados.localizacao.precisao
        } : null,
        clima: dados.clima ? {
          temperatura: dados.clima.temperatura,
          humidade: dados.clima.humidade,
          descricaoTempo: dados.clima.descricaoTempo
        } : null
      };
      
      setFotoAtual(novaFoto);
      setDados(prev => ({
        ...prev,
        fotos: [novaFoto, ...prev.fotos].slice(0, 20) // Manter últimas 20 fotos
      }));
      
      // Se houver callback de nova deteção, enviar
      if (onNovaDeteccao) {
        onNovaDeteccao({
          tipo: 'foto_campo',
          foto: novaFoto,
          localizacao: dados.localizacao,
          clima: dados.clima
        });
      }
    }
  };

  const compartilharLocalizacao = () => {
    if (!dados.localizacao) return;
    
    const texto = `📍 Localização no AgroOkuvanja\n\n` +
      `Latitude: ${dados.localizacao.latitude}\n` +
      `Longitude: ${dados.localizacao.longitude}\n` +
      `Precisão: ${Math.round(dados.localizacao.precisao)} metros\n` +
      `Endereço: ${dados.localizacao.endereco || 'Não disponível'}\n` +
      `Data: ${new Date(dados.localizacao.timestamp).toLocaleString('pt-PT')}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Localização no Campo',
        text: texto,
        url: `https://maps.google.com/?q=${dados.localizacao.latitude},${dados.localizacao.longitude}`
      });
    } else {
      navigator.clipboard.writeText(texto);
      alert('Localização copiada para área de transferência!');
    }
  };

  const falarMonitoramento = () => {
    if (!dados.localizacao || !dados.clima) return;
    
    const mensagem = `Monitoramento de Campo. ` +
      `Localização: ${dados.localizacao.cidade || 'desconhecida'}. ` +
      `Temperatura atual ${dados.clima.temperatura} graus. ` +
      `Humidade ${dados.clima.humidade} por cento. ` +
      `Vento ${dados.clima.ventoVelocidade} quilómetros por hora. ` +
      `Condições: ${dados.clima.descricaoTempo}.`;
    
    vozService.falar(mensagem);
  };

  const formatarCoordenadas = (lat, lon) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
  };

  if (dados.carregandoGeo) {
    return (
      <div style={carregandoStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Navigation size={40} color={cores.verdePimenta} />
        </motion.div>
        <p>Obtendo localização...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2rem', color: cores.verdeAlface, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={32} color={cores.verdePimenta} />
            Monitoramento de Campo
          </h1>
          <p style={{ color: '#666', marginTop: '5px' }}>
            Dados em tempo real da sua localização
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={obterLocalizacao} style={acaoButtonStyle}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button onClick={falarMonitoramento} style={audioButtonStyle}>
            <Volume2 size={16} /> Falar
          </button>
        </div>
      </div>

      {/* Cards de Localização e Clima */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Card de Localização */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={cardStyle}
        >
          <div style={cardHeaderStyle}>
            <MapPin color={cores.verdePimenta} size={20} />
            <h3 style={{ color: cores.verdeAlface }}>Localização Atual</h3>
          </div>
          
          {dados.localizacao ? (
            <div>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Coordenadas:</span>
                <span style={infoValueStyle}>
                  {formatarCoordenadas(dados.localizacao.latitude, dados.localizacao.longitude)}
                </span>
              </div>
              
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Precisão:</span>
                <span style={infoValueStyle}>{Math.round(dados.localizacao.precisao)} metros</span>
              </div>
              
              {dados.localizacao.altitude && (
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Altitude:</span>
                  <span style={infoValueStyle}>{Math.round(dados.localizacao.altitude)} m</span>
                </div>
              )}
              
              {dados.localizacao.cidade && (
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Cidade:</span>
                  <span style={infoValueStyle}>{dados.localizacao.cidade}</span>
                </div>
              )}
              
              {dados.localizacao.bairro && (
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Bairro:</span>
                  <span style={infoValueStyle}>{dados.localizacao.bairro}</span>
                </div>
              )}
              
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Atualizado:</span>
                <span style={infoValueStyle}>
                  {new Date(dados.localizacao.timestamp).toLocaleTimeString('pt-PT')}
                </span>
              </div>
              
              <button onClick={compartilharLocalizacao} style={compartilharButtonStyle}>
                <Share2 size={14} /> Compartilhar Localização
              </button>
            </div>
          ) : (
            <p style={{ color: cores.vermelho }}>{dados.erroGeo || 'Localização indisponível'}</p>
          )}
        </motion.div>

        {/* Card de Clima */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={cardStyle}
        >
          <div style={cardHeaderStyle}>
            <Sun color={cores.amarelo} size={20} />
            <h3 style={{ color: cores.verdeAlface }}>Condições Climáticas</h3>
          </div>
          
          {dados.carregandoClima ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Carregando clima...</p>
            </div>
          ) : dados.clima ? (
            <div>
              <div style={climaPrincipalStyle}>
                <span style={{ fontSize: '3rem' }}>{dados.clima.icone}</span>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: cores.verdeAlface }}>
                    {dados.clima.temperatura}°C
                  </div>
                  <div style={{ color: '#666' }}>{dados.clima.descricaoTempo}</div>
                </div>
              </div>
              
              <div style={climaGridStyle}>
                <div style={climaItemStyle}>
                  <Droplets size={16} color={cores.azul} />
                  <span>{dados.clima.humidade}%</span>
                </div>
                <div style={climaItemStyle}>
                  <Wind size={16} color="#666" />
                  <span>{dados.clima.ventoVelocidade} km/h</span>
                </div>
                <div style={climaItemStyle}>
                  <Compass size={16} color="#666" />
                  <span>{dados.clima.ventoDirecao}°</span>
                </div>
                <div style={climaItemStyle}>
                  <Cloud size={16} color="#666" />
                  <span>{dados.clima.nebulosidade}%</span>
                </div>
                <div style={climaItemStyle}>
                  <CloudRain size={16} color={cores.azul} />
                  <span>{dados.clima.precipitacao} mm</span>
                </div>
                <div style={climaItemStyle}>
                  <Eye size={16} color="#666" />
                  <span>UV {dados.clima.indiceUV}</span>
                </div>
              </div>

              {/* Previsão próximas horas */}
              {dados.clima.proximasHoras.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ color: cores.verdeAlface, marginBottom: '10px' }}>Próximas Horas</h4>
                  <div style={proximasHorasStyle}>
                    {dados.clima.proximasHoras.map((hora, i) => (
                      <div key={i} style={horaPrevisaoStyle}>
                        <div style={{ fontWeight: 'bold' }}>{hora.hora}</div>
                        <div>{hora.temp}°C</div>
                        <div style={{ fontSize: '0.8rem', color: hora.probChuva > 0 ? cores.azul : '#999' }}>
                          {hora.probChuva > 0 ? `${hora.probChuva}%` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: cores.vermelho }}>{dados.erroClima || 'Clima indisponível'}</p>
          )}
        </motion.div>
      </div>

      {/* Área da Câmera */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={cameraAreaStyle}
      >
        <div style={cameraHeaderStyle}>
          <h3 style={{ color: cores.verdeAlface }}>📸 Registro Fotográfico</h3>
          {!modoCamera ? (
            <button onClick={iniciarCamera} style={cameraButtonStyle}>
              <Camera size={16} /> Abrir Câmera
            </button>
          ) : (
            <button onClick={pararCamera} style={fecharCameraButtonStyle}>
              <Camera size={16} /> Fechar Câmera
            </button>
          )}
        </div>

        {modoCamera && (
          <div style={cameraContainerStyle}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={videoStyle}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div style={cameraControlesStyle}>
              <button onClick={tirarFoto} style={fotoButtonStyle}>
                <Camera size={24} />
              </button>
            </div>

            {fotoAtual && (
              <div style={fotoPreviewStyle}>
                <h4 style={{ color: cores.verdeAlface }}>Última Foto</h4>
                <img src={fotoAtual.dataUrl} alt="Preview" style={previewImageStyle} />
                <div style={fotoInfoStyle}>
                  <p>📍 {fotoAtual.localizacao?.endereco?.substring(0, 50) || 'Localização não disponível'}</p>
                  <p>🌡️ {fotoAtual.clima?.temperatura}°C - {fotoAtual.clima?.descricaoTempo}</p>
                  <p>🕐 {new Date(fotoAtual.timestamp).toLocaleString('pt-PT')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Galeria de Fotos */}
        {dados.fotos.length > 0 && (
          <div style={galeriaStyle}>
            <h4 style={{ color: cores.verdeAlface, marginBottom: '10px' }}>
              Últimas Fotos ({dados.fotos.length})
            </h4>
            <div style={fotosGridStyle}>
              {dados.fotos.slice(0, 6).map((foto, index) => (
                <motion.div
                  key={foto.id}
                  whileHover={{ scale: 1.05 }}
                  style={fotoThumbStyle}
                  onClick={() => setFotoAtual(foto)}
                >
                  <img src={foto.dataUrl} alt={`Foto ${index + 1}`} style={thumbImageStyle} />
                  <div style={thumbInfoStyle}>
                    <small>{new Date(foto.timestamp).toLocaleTimeString('pt-PT')}</small>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Estilos
const carregandoStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '20px',
  color: cores.verdeAlface
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '25px',
  flexWrap: 'wrap',
  gap: '15px'
};

const acaoButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: 'white',
  color: cores.verdeAlface,
  border: `1px solid ${cores.verdeClaro}`,
  borderRadius: '30px',
  cursor: 'pointer'
};

const audioButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: cores.verdeAlface,
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer'
};

const cardStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  border: `1px solid ${cores.verdeClaro}`,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '15px',
  paddingBottom: '10px',
  borderBottom: `1px solid ${cores.verdeClaro}`
};

const infoRowStyle = {
  display: 'flex',
  marginBottom: '8px',
  fontSize: '0.95rem'
};

const infoLabelStyle = {
  width: '100px',
  color: '#666'
};

const infoValueStyle = {
  flex: 1,
  color: cores.verdeAlface,
  fontWeight: '500'
};

const compartilharButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  marginTop: '15px',
  padding: '8px 15px',
  background: cores.verdeClaro,
  border: 'none',
  borderRadius: '8px',
  color: cores.verdeAlface,
  cursor: 'pointer'
};

const climaPrincipalStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '15px'
};

const climaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
  marginBottom: '15px'
};

const climaItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '8px',
  background: cores.verdeClaro,
  borderRadius: '8px',
  fontSize: '0.9rem'
};

const proximasHorasStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px'
};

const horaPrevisaoStyle = {
  textAlign: 'center',
  padding: '8px',
  background: cores.verdeClaro,
  borderRadius: '8px',
  fontSize: '0.85rem'
};

const cameraAreaStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  border: `1px solid ${cores.verdeClaro}`,
  marginTop: '20px'
};

const cameraHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const cameraButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '8px 15px',
  background: cores.verdePimenta,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

const fecharCameraButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '8px 15px',
  background: cores.vermelho,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

const cameraContainerStyle = {
  position: 'relative',
  marginBottom: '20px'
};

const videoStyle = {
  width: '100%',
  maxHeight: '400px',
  objectFit: 'cover',
  borderRadius: '12px',
  background: '#000'
};

const cameraControlesStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '15px'
};

const fotoButtonStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'white',
  border: '3px solid',
  borderColor: cores.verdePimenta,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
};

const fotoPreviewStyle = {
  marginTop: '15px',
  padding: '15px',
  background: cores.verdeClaro,
  borderRadius: '12px'
};

const previewImageStyle = {
  width: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  borderRadius: '8px',
  marginTop: '10px'
};

const fotoInfoStyle = {
  marginTop: '10px',
  fontSize: '0.9rem',
  color: '#666'
};

const galeriaStyle = {
  marginTop: '20px'
};

const fotosGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '10px'
};

const fotoThumbStyle = {
  position: 'relative',
  cursor: 'pointer',
  borderRadius: '8px',
  overflow: 'hidden'
};

const thumbImageStyle = {
  width: '100%',
  height: '80px',
  objectFit: 'cover'
};

const thumbInfoStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0,0,0,0.5)',
  color: 'white',
  padding: '2px 5px',
  fontSize: '0.7rem',
  textAlign: 'center'
};