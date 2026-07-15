// src/contexts/AppContext.jsx - DEPRECATED: Não utilizado no Prognos Agri v2.0
import React, { createContext, useState } from 'react';

// --- Cores globais ---
export const COLORS = {
  primaryBg: 'bg-gray-100',
  secondaryBg: 'bg-white',
  text: 'text-gray-800',
};

// --- Header de painel ---
export const PanelHeader = ({ icon: Icon, title, description }) => (
  <div className="mb-6">
    <div className="flex items-center space-x-3">
      {Icon && <Icon className="w-6 h-6" />}
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    <p className="text-gray-500">{description}</p>
  </div>
);

// --- Hook de tradução (simples placeholder) ---
export const useTranslation = () => {
  const t = (key) => key;
  return { t };
};

// --- AuthContext stub (deprecated, usar PrognosContext) ---
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario] = useState(null);
  const [token] = useState(null);

  return (
    <AuthContext.Provider value={{ usuario, token }}>
      {children}
    </AuthContext.Provider>
  );
};
