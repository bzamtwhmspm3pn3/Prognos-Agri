// src/contexts/AuthContext.js - DEPRECATED: Usar PrognosContext em vez deste ficheiro
// Este contexto foi mantido para compatibilidade mas já não deve ser usado.
// O contexto activo é PrognosContext em src/prognos/contexts/PrognosContext.jsx
import React, { createContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
};
