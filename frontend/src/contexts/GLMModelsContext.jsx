// src/contexts/GLMModelsContext.jsx - DEPRECATED: Não utilizado no Prognos Agri v2.0
// Este contexto era do sistema JIAM anterior. Mantido apenas para referência.
import React, { createContext, useContext, useState } from 'react';

const GLMModelsContext = createContext();

export const useGLMModels = () => {
  const context = useContext(GLMModelsContext);
  if (!context) {
    throw new Error('useGLMModels deve ser usado dentro de GLMModelsProvider');
  }
  return context;
};

export const GLMModelsProvider = ({ children }) => {
  const [modelosGLM] = useState({
    frequencia: null,
    severidade: null,
    resultadosCompletos: null,
    estatisticas: null,
    equacoes: null,
    timestamp: null,
    tarifacaoCompleta: false
  });

  return (
    <GLMModelsContext.Provider value={{ modelosGLM }}>
      {children}
    </GLMModelsContext.Provider>
  );
};