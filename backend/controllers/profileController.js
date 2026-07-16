const Profile = require('../models/profile');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    let profile = await Profile.findOne({ user: userId }).populate('user', 'username email role');
    
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
      }
      try {
        profile = await Profile.create({
          user: userId,
          nome: user.username || 'Utilizador',
          email: user.email,
          tipo: 'individual',
          status: 'completo',
          execucoesUsadas: 0,
          limiteExecucoes: 50
        });
      } catch (createErr) {
        console.warn('Profile.create falhou, tentando findOne again:', createErr.message);
        profile = await Profile.findOne({ user: userId }).populate('user', 'username email role');
      }
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Erro getProfile:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar perfil', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    const allowedFields = [
      'nome', 'tipo', 'nomeOrganizacao', 'identificacao', 'tipoIdentificacao',
      'dataNascimento', 'dataFundacao', 'telefone',
      'endereco', 'dadosAdicionais', 'configuracoes'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Handle nested objects
    if (req.body.endereco) {
      updateData.endereco = { ...req.body.endereco };
    }
    if (req.body.dadosAdicionais) {
      updateData.dadosAdicionais = { ...req.body.dadosAdicionais };
    }
    if (req.body.configuracoes) {
      updateData.configuracoes = { ...req.body.configuracoes };
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'username email role');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil não encontrado' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Erro updateProfile:', error);
    res.status(500).json({ success: false, message: 'Erro ao actualizar perfil' });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          'imagemPerfil.url': imageUrl,
          'imagemPerfil.secure_url': imageUrl
        }
      },
      { new: true }
    );

    res.json({ success: true, imageUrl, data: profile });
  } catch (error) {
    console.error('Erro uploadProfileImage:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar imagem' });
  }
};

const activatePlan = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil não encontrado' });
    }

    try {
      await profile.ativarProduto(req.body.codigo);
      res.json({ success: true, message: 'Produto activado com sucesso', data: profile });
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Código de activação inválido' });
    }
  } catch (error) {
    console.error('Erro activatePlan:', error);
    res.status(500).json({ success: false, message: 'Erro ao activar produto' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  activatePlan
};
