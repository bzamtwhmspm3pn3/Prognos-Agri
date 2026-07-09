// src/components/RegisterModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { register } from '../services/auth';

const cores = {
  verdeAlface: '#1A4D2E',
  verdePimenta: '#82B74D',
  verdeClaro: '#E8F0E8',
  vermelhoErro: '#DC2626'
};

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Preencha todos os campos');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (!termsAccepted) {
      setError('Você deve aceitar os termos de uso');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        setSuccess('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => {
          onClose();
          onSwitchToLogin();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
        {/* Botão fechar */}
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
            transition: 'all 0.3s'
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
          Criar conta 🚀
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#6B7280', 
          marginBottom: '30px',
          fontSize: '0.95rem'
        }}>
          Junte-se a nós na missão de proteger a agricultura angolana
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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#D1FAE5',
              color: cores.verdeAlface,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem'
            }}
          >
            <CheckCircle size={18} />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nome de utilizador */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: cores.verdeAlface,
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Nome de utilizador
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: `2px solid ${cores.verdeClaro}`,
              borderRadius: '10px',
              transition: 'all 0.3s'
            }}>
              <span style={{ padding: '0 12px', color: '#9CA3AF' }}>
                <User size={20} />
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ex: agricultor123"
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

          {/* Email */}
          <div style={{ marginBottom: '15px' }}>
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
              border: `2px solid ${cores.verdeClaro}`,
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

          {/* Senha */}
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
              border: `2px solid ${cores.verdeClaro}`,
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
                  color: '#9CA3AF'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: cores.verdeAlface,
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Confirmar senha
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: `2px solid ${cores.verdeClaro}`,
              borderRadius: '10px',
              transition: 'all 0.3s'
            }}>
              <span style={{ padding: '0 12px', color: '#9CA3AF' }}>
                <Lock size={20} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 12px',
                  color: '#9CA3AF'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Termos de uso */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '25px',
            color: '#6B7280',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: cores.verdePimenta
              }}
            />
            <span>
              Aceito os{' '}
              <span style={{ color: cores.verdePimenta, textDecoration: 'underline' }}>
                Termos de Uso
              </span>{' '}
              e{' '}
              <span style={{ color: cores.verdePimenta, textDecoration: 'underline' }}>
                Política de Privacidade
              </span>
            </span>
          </label>

          {/* Botão Cadastrar */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#9CA3AF' : cores.verdePimenta,
              color: cores.verdeAlface,
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
            {loading ? 'Criando conta...' : 'Criar conta gratuita'}
          </motion.button>
        </form>

        {/* Link para login */}
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.95rem' }}>
          Já tem uma conta?{' '}
          <span
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            style={{
              color: cores.verdePimenta,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Entre aqui
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
}