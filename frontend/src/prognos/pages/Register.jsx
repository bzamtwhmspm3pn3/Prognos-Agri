import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { usePrognos } from '../contexts/PrognosContext';
import { register as registerService } from '../../services/auth';
import logoHeader from '../../assets/logo-header.png';

export default function Register() {
  const navigate = useNavigate();
  const { login } = usePrognos();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const result = await registerService({
        username: form.username,
        email: form.email,
        password: form.password
      });
      if (result.success) {
        login(result.user, result.token);
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
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
        <div style={{ marginBottom: '16px' }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.85rem'
          }}>
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ margin: '0 auto 16px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoHeader} alt="Prognos Agri" style={{ height: '64px', width: 'auto' }} />
          </div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#003366' }}>
            Criar Conta
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Crie a sua conta gratuita no Prognos Agri
          </p>
        </div>

        {error && (
          <div className="notification notification-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Nome de Utilizador</label>
            <input type="text" className="input" placeholder="Seu username"
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input" placeholder="seu@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Mínimo 6 caracteres"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '40px' }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Confirmar Senha</label>
            <input type="password" className="input" placeholder="Repita a senha"
              value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'A criar conta...' : <><LogIn size={18} /> Criar Conta</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/login" style={{ color: '#003366', fontSize: '0.9rem', fontWeight: 500 }}>
            Já tem conta? Entre aqui
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.75rem', color: '#94a3b8' }}>
          © 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴
        </div>
      </div>
    </div>
  );
}