import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { getDashboard } from '../../services/dashboardService';

const PrognosContext = createContext();

export function PrognosProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('prognos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem('prognos_token', token);
    localStorage.setItem('prognos_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('prognos_token');
    localStorage.removeItem('prognos_user');
    setUser(null);
    setDashboardData(null);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const addNotificacao = useCallback(() => {
    setNotificacoes(prev => prev + 1);
  }, []);

  const clearNotificacoes = useCallback(() => {
    setNotificacoes(0);
  }, []);

  const isAuthenticated = !!user;

  return (
    <PrognosContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      logout,
      isAuthenticated,
      dashboardData,
      loadDashboard,
      sidebarOpen,
      toggleSidebar,
      notificacoes,
      addNotificacao,
      clearNotificacoes
    }}>
      {children}
    </PrognosContext.Provider>
  );
}

export function usePrognos() {
  const context = useContext(PrognosContext);
  if (!context) {
    throw new Error('usePrognos deve ser usado dentro de PrognosProvider');
  }
  return context;
}

export default PrognosContext;
