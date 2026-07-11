import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrognosProvider, usePrognos } from './prognos/contexts/PrognosContext';
import { IntegracaoProvider } from './prognos/contexts/IntegracaoContext';
import PrognosHeader from './prognos/components/PrognosHeader';
import PrognosSidebar from './prognos/components/PrognosSidebar';
import PrognosFooter from './prognos/components/PrognosFooter';
import Dashboard from './prognos/pages/Dashboard';
import Predictions from './prognos/pages/Predictions';
import Market from './prognos/pages/Market';
import Chatbot from './prognos/pages/Chatbot';
import Community from './prognos/pages/Community';
import Rastreabilidade from './prognos/pages/Rastreabilidade';
import Profile from './prognos/pages/Profile';
import FreeLanding from './prognos/pages/FreeLanding';
import Login from './prognos/pages/Login';
import Register from './prognos/pages/Register';
import DeteccaoPragas from './prognos/pages/DeteccaoPragas';
import ConfiguracaoCamerasPage from './prognos/pages/ConfiguracaoCamerasPage';
import MonitoramentoCampoPage from './prognos/pages/MonitoramentoCampoPage';
import RelatoriosColheitaPage from './prognos/pages/RelatoriosColheitaPage';
import HistoricoOcorrenciasPage from './prognos/pages/HistoricoOcorrenciasPage';
import IrrigacaoPage from './prognos/pages/IrrigacaoPage';
import './theme.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = usePrognos();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = usePrognos();
  return isAuthenticated ? <Navigate to="/app/dashboard" /> : children;
}

function AppLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const { sidebarOpen, toggleSidebar } = usePrognos();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PrognosHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={toggleSidebar}
        />
        <PrognosSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className="prognos-content" style={{ width: '100%' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/previsoes" element={<Predictions />} />
            <Route path="/mercado" element={<Market />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/comunidade" element={<Community />} />
            <Route path="/rastreabilidade" element={<Rastreabilidade />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/deteccao" element={<DeteccaoPragas />} />
            <Route path="/cameras" element={<ConfiguracaoCamerasPage />} />
            <Route path="/monitoramento" element={<MonitoramentoCampoPage />} />
            <Route path="/relatorios" element={<RelatoriosColheitaPage />} />
            <Route path="/historico" element={<HistoricoOcorrenciasPage />} />
            <Route path="/irrigacao" element={<IrrigacaoPage />} />
          </Routes>
        </main>
      </div>
      <PrognosFooter />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <IntegracaoProvider>
        <PrognosProvider>
        <Routes>
          <Route path="/" element={<FreeLanding />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/app/*" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          } />
        </Routes>
        </PrognosProvider>
      </IntegracaoProvider>
    </BrowserRouter>
  );
}