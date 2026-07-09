// controllers/profileController.js
const getProfile = (req, res) => {
  console.log('✅ getProfile chamado');
  res.json({ 
    success: true, 
    message: 'getProfile OK', 
    data: {
      nome: 'Agricultor Teste',
      email: 'teste@agrookuvanja.ao',
      propriedade: 'Fazenda Esperança',
      hectares: 50
    }
  });
};

const updateProfile = (req, res) => {
  console.log('✅ updateProfile chamado');
  res.json({ 
    success: true, 
    message: 'updateProfile OK' 
  });
};

const uploadProfileImage = (req, res) => {
  console.log('✅ uploadProfileImage chamado');
  res.json({ 
    success: true, 
    message: 'uploadProfileImage OK', 
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null
  });
};

const activatePlan = (req, res) => {
  console.log('✅ activatePlan chamado');
  res.json({ 
    success: true, 
    message: 'activatePlan OK' 
  });
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  activatePlan
};