// utils/helpers.js
const bcrypt = require('bcryptjs');

// Gerar hash da password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Comparar passwords
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Formatar data
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Calcular scans restantes
const calcularScansRestantes = (plano, scansUsados) => {
  if (plano.tipo === 'premium' && plano.ativo) return '∞';
  return Math.max(0, (plano.scansRestantes || 5) - scansUsados);
};

// Gerar código de ativação aleatório
const generateActivationCode = () => {
  const prefix = 'AGRO';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
};

// Validar email
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validar telefone angolano
const isValidAngolanPhone = (phone) => {
  const re = /^(\+244|00244)?9[1-9][0-9]{7}$/;
  return re.test(phone.replace(/\s/g, ''));
};

// Extrair mensagem de erro
const getErrorMessage = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return `${field} já está em uso`;
  }
  return error.message || 'Erro interno do servidor';
};

module.exports = {
  hashPassword,
  comparePassword,
  formatDate,
  calcularScansRestantes,
  generateActivationCode,
  isValidEmail,
  isValidAngolanPhone,
  getErrorMessage
};