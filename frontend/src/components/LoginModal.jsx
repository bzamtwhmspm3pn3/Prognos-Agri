// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { login } from '../services/auth';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelhoErro: '#DC2626',
  verdeSucesso: '#10B981'
};

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) {
  const [modo, setModo] = useState('login'); // 'login', 'recuperar', 'recuperar-enviado'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      
      if (response.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        onLoginSuccess(response.user, response.token);
        onClose();
        // Reset estados
        setModo('login');
        setFormData({ email: '', password: '' });
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    
    if (!emailRecuperacao) {
      setError('Digite seu email');
      return;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecuperacao)) {
      setError('Digite um email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simular envio de email de recuperação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você pode implementar a chamada real para o backend
      // Por enquanto, vamos apenas simular o sucesso
      
      setSucesso('Enviamos um link de recuperação para seu email');
      setModo('recuperar-enviado');
      
      // Opcional: salvar email para referência
      localStorage.setItem('recoveryEmail', emailRecuperacao);
      
    } catch (err) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const voltarParaLogin = () => {
    setModo('login');
    setError('');
    setSucesso('');
    setEmailRecuperacao('');
  };

  // Modo: Recuperar Senha (Formulário)
  const renderRecuperarSenha = () => (
    <>
      <button
        onClick={voltarParaLogin}
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: cores.verdeAlface,
          padding: '8px',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.9rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = cores.verdeClaro;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          padding: '5px',
          borderRadius: '5px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F3F4F6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={20} />
      </button>

      <h2 style={{ 
        color: cores.verdeAlface, 
        fontSize: '1.8rem', 
        marginBottom: '10px', 
        textAlign: 'center',
        marginTop: '20px'
      }}>
        Recuperar Senha 🔐
      </h2>
      
      <p style={{ 
        textAlign: 'center', 
        color: '#6B7280', 
        marginBottom: '30px',
        fontSize: '0.95rem'
      }}>
        Digite seu email para receber um link de recuperação
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FEE2E2',
            color: cores.vermelhoErro,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleRecuperarSenha}>
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: cores.verdeAlface,
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>
            Email
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: `2px solid ${error ? cores.vermelhoErro : cores.verdeClaro}`,
            borderRadius: '10px',
            transition: 'all 0.3s'
          }}>
            <span style={{ padding: '0 12px', color: '#9CA3AF' }}>
              <Mail size={20} />
            </span>
            <input
              type="email"
              value={emailRecuperacao}
              onChange={(e) => setEmailRecuperacao(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '15px 15px 15px 0',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                background: 'transparent'
              }}
              disabled={loading}
            />
          </div>
          <p style={{
            fontSize: '0.8rem',
            color: '#9CA3AF',
            marginTop: '5px',
            marginLeft: '10px'
          }}>
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#9CA3AF' : cores.verdePimenta,
            color: loading ? 'white' : cores.verdeAlface,
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.3s',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {loading ? 'Enviando...' : (
            <>
              <Send size={18} />
              Enviar Link
            </>
          )}
        </motion.button>
      </form>

      <p style={{ 
        textAlign: 'center', 
        color: '#6B7280', 
        fontSize: '0.85rem',
        marginTop: '10px'
      }}>
        Lembrou sua senha?{' '}
        <span
          onClick={voltarParaLogin}
          style={{
            color: cores.verdePimenta,
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'underline'
          }}
        >
          Voltar ao login
        </span>
      </p>
    </>
  );

  // Modo: Recuperar Senha - Enviado com Sucesso
  const renderRecuperarEnviado = () => (
    <>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          padding: '5px',
          borderRadius: '5px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <X size={20} />
      </button>

      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: cores.verdeSucesso,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 10px 20px ${cores.verdeSucesso}40`
          }}
        >
          <CheckCircle size={40} color="white" />
        </motion.div>

        <h2 style={{ 
          color: cores.verdeAlface, 
          fontSize: '1.8rem', 
          marginBottom: '15px'
        }}>
          Email Enviado! 📧
        </h2>
        
        <p style={{ 
          color: '#6B7280', 
          marginBottom: '10px',
          fontSize: '1rem'
        }}>
          Enviamos um link de recuperação para:
        </p>
        
        <p style={{ 
          color: cores.verdePimenta, 
          fontWeight: 'bold',
          fontSize: '1.1rem',
          marginBottom: '20px',
          backgroundColor: cores.verdeClaro,
          padding: '8px 15px',
          borderRadius: '30px',
          display: 'inline-block'
        }}>
          {emailRecuperacao}
        </p>
        
        <p style={{ 
          color: '#6B7280', 
          marginBottom: '30px',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          Verifique sua caixa de entrada e spam.<br />
          O link é válido por 24 horas.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={voltarParaLogin}
            style={{
              background: 'none',
              border: `2px solid ${cores.verdePimenta}`,
              color: cores.verdeAlface,
              padding: '12px 25px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Voltar ao Login
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              background: cores.verdeAlface,
              border: 'none',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Fechar
          </motion.button>
        </div>
      </div>
    </>
  );

  // Modo: Login Padrão
  const renderLogin = () => (
    <>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          padding: '5px',
          borderRadius: '5px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <X size={20} />
      </button>

      <h2 style={{ 
        color: cores.verdeAlface, 
        fontSize: '2rem', 
        marginBottom: '10px', 
        textAlign: 'center' 
      }}>
        Bem-vindo de volta! 👋
      </h2>
      
      <p style={{ 
        textAlign: 'center', 
        color: '#6B7280', 
        marginBottom: '30px',
        fontSize: '0.95rem'
      }}>
        Acesse sua conta para continuar
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FEE2E2',
            color: cores.vermelhoErro,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: cores.verdeAlface,
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>
            Email
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: `2px solid ${error && !formData.email ? cores.vermelhoErro : cores.verdeClaro}`,
            borderRadius: '10px',
            transition: 'all 0.3s'
          }}>
            <span style={{ padding: '0 12px', color: '#9CA3AF' }}>
              <Mail size={20} />
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '15px 15px 15px 0',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                background: 'transparent'
              }}
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: cores.verdeAlface,
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>
            Senha
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: `2px solid ${error && !formData.password ? cores.vermelhoErro : cores.verdeClaro}`,
            borderRadius: '10px',
            transition: 'all 0.3s'
          }}>
            <span style={{ padding: '0 12px', color: '#9CA3AF' }}>
              <Lock size={20} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '15px 15px 15px 0',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                background: 'transparent'
              }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 12px',
                color: '#9CA3AF',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = cores.verdeAlface}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6B7280',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: cores.verdePimenta
              }}
            />
            Lembrar-me
          </label>
          <button
            type="button"
            onClick={() => {
              setModo('recuperar');
              setError('');
              setSucesso('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: cores.verdePimenta,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = cores.verdeAlface}
            onMouseLeave={(e) => e.target.style.color = cores.verdePimenta}
          >
            Esqueceu a senha?
          </button>
        </div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#9CA3AF' : cores.verdeAlface,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.3s',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </motion.button>
      </form>

      <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.95rem' }}>
        Não tem uma conta?{' '}
        <span
          onClick={() => {
            onClose();
            onSwitchToRegister();
          }}
          style={{
            color: cores.verdePimenta,
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.color = cores.verdeAlface}
          onMouseLeave={(e) => e.target.style.color = cores.verdePimenta}
        >
          Cadastre-se
        </span>
      </p>
    </>
  );

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
        zIndex: 9999,
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
          width: '90%',
          position: 'relative',
          zIndex: 10000,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={modo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {modo === 'login' && renderLogin()}
            {modo === 'recuperar' && renderRecuperarSenha()}
            {modo === 'recuperar-enviado' && renderRecuperarEnviado()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}