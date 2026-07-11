import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const IntegracaoContext = createContext();

const STORAGE_KEY_CAMERAS = 'agrookuvanja_cameras';
const STORAGE_KEY_DETECCOES = 'prognos_deteccoes';

export function IntegracaoProvider({ children }) {
  const [cameras, setCameras] = useState([]);
  const [deteccoesRecentes, setDeteccoesRecentes] = useState([]);
  const [mapaRisco, setMapaRisco] = useState({});
  const [refreshDashboard, setRefreshDashboard] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CAMERAS);
    if (saved) setCameras(JSON.parse(saved));
    const savedDet = localStorage.getItem(STORAGE_KEY_DETECCOES);
    if (savedDet) setDeteccoesRecentes(JSON.parse(savedDet));
  }, []);

  const getActiveCameras = useCallback(() => {
    return cameras.filter(c => c.ativa);
  }, [cameras]);

  const atualizarCameras = useCallback((novasCameras) => {
    setCameras(novasCameras);
    localStorage.setItem(STORAGE_KEY_CAMERAS, JSON.stringify(novasCameras));
  }, []);

  const recarregarCameras = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CAMERAS);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCameras(parsed);
      return parsed;
    }
    return [];
  }, []);

  const emitirDeteccao = useCallback((deteccao) => {
    setDeteccoesRecentes(prev => {
      const updated = [deteccao, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_DETECCOES, JSON.stringify(updated));
      return updated;
    });
    setRefreshDashboard(prev => prev + 1);
  }, []);

  const atualizarMapaRisco = useCallback((dados) => {
    setMapaRisco(prev => ({
      ...prev,
      [dados.localizacao || 'default']: {
        ...dados,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  return (
    <IntegracaoContext.Provider value={{
      cameras,
      setCameras: atualizarCameras,
      getActiveCameras,
      recarregarCameras,
      deteccoesRecentes,
      emitirDeteccao,
      mapaRisco,
      atualizarMapaRisco,
      refreshDashboard
    }}>
      {children}
    </IntegracaoContext.Provider>
  );
}

export function useIntegracao() {
  const context = useContext(IntegracaoContext);
  if (!context) {
    throw new Error('useIntegracao deve ser usado dentro de IntegracaoProvider');
  }
  return context;
}

export default IntegracaoContext;
