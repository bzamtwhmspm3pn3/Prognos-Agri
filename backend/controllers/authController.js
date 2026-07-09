// controllers/authController.js
const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/helpers');
const jwt = require('jsonwebtoken');

// Register
const register = async (req, res, next) => {
  try {
    const { username, email, password, role = 'agricultor' } = req.body;
    console.log('📝 register chamado:', { username, email });

    // Verificar se já existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email ou username já estão em uso'
      });
    }

    // Criar novo utilizador
    const hashedPassword = await hashPassword(password);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      profile: { nome: username }
    });

    await user.save();

    // Gerar token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 login chamado:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou password inválidos'
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou password inválidos'
      });
    }

    user.ultimoAcesso = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        plano: user.plano
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Me
const getMe = async (req, res, next) => {
  try {
    console.log('👤 getMe chamado para userId:', req.userId);
    const user = await User.findById(req.userId).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Exportar TUDO corretamente
module.exports = {
  register,
  login,
  getMe
};