import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { usePrognos } from '../contexts/PrognosContext';
import { login as loginService, register as registerService } from '../../services/auth';
import logoHeader from '../../assets/logo-header.png';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = usePrognos();
  const [isRegister, setIsRegister] = useState(searchParams.get('register') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setIsRegister(searchParams.get('register') === 'true');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        if (form.password !== form.confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
        const result = await registerService({
          username: form.username,
          email: form.email,
          password: form.password
        });
        if (result.success) {
          setSuccess('Conta criada com sucesso! A redirecionar...');
          setTimeout(() => {
            login(result.user, result.token);
            navigate('/app/dashboard');
          }, 1000);
        }
      } else {
        const result = await loginService(form.email, form.password);
        if (result.success) {
          login(result.user, result.token);
          navigate('/app/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003366 0%, #0055A5 50%, #4A7C59 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px',
        maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            margin: '0 auto 16px', cursor: 'pointer', width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onClick={() => navigate('/')}>
            <img src={logoHeader} alt="Prognos Agri" style={{ height: '64px', width: 'auto' }} />
          </div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#003366' }}>
            Prognos <span style={{ color: '#4A7C59' }}>Agri</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            {isRegister ? 'Crie a sua conta gratuita' : 'Entre na sua conta'}
          </p>
        </div>

        {error && (
          <div className="notification notification-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="notification notification-success" style={{ marginBottom: '16px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label">Nome de Utilizador</label>
              <input
                type="text"
                className="input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Seu username"
                required
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Sua senha"
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="input-group">
              <label className="input-label">Confirmar Senha</label>
              <input
                type="password"
                className="input"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repita a senha"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'A processar...' : (
              <>{isRegister ? 'Criar Conta' : 'Entrar'} {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#003366', fontSize: '0.9rem', fontWeight: 500 }}
          >
            {isRegister ? 'Já tem conta? Entre aqui' : 'Não tem conta? Registre-se'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}
          >
            ← Voltar ao início
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#94a3b8' }}>
          © 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴
        </div>
      </div>
    </div>
  );
}
