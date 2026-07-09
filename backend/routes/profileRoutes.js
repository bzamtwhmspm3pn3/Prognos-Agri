// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// Importar upload (pode falhar se não existir)
let upload;
try {
  upload = require('../middleware/upload');
  console.log('✅ Upload middleware carregado');
} catch (error) {
  console.log('⚠️ Upload middleware não encontrado, usando dummy');
  // Middleware dummy para não quebrar a aplicação
  upload = {
    single: () => (req, res, next) => {
      console.log('⚠️ Upload dummy usado');
      next();
    }
  };
}

console.log('🔍 profileController:', {
  getProfile: typeof profileController?.getProfile,
  updateProfile: typeof profileController?.updateProfile,
  uploadProfileImage: typeof profileController?.uploadProfileImage,
  activatePlan: typeof profileController?.activatePlan
});

// Todas as rotas de perfil são protegidas
router.use(protect);

router.get('/:userId', profileController.getProfile);
router.put('/:userId', profileController.updateProfile);
router.post('/:userId/image', upload.single('imagemPerfil'), profileController.uploadProfileImage);
router.post('/:userId/activate', profileController.activatePlan);

module.exports = router;