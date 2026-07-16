// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

let upload;
try {
  upload = require('../middleware/upload');
} catch (error) {
  upload = {
    single: () => (req, res, next) => { next(); }
  };
}

router.use(protect);

router.get('/:userId', profileController.getProfile);
router.put('/:userId', profileController.updateProfile);
router.post('/:userId/image', upload.single('imagemPerfil'), profileController.uploadProfileImage);
router.post('/:userId/activate', profileController.activatePlan);

module.exports = router;