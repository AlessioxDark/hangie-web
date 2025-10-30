const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/auth');
// Definisci la route per ottenere tutti gli eventi
// router.post('/register', authController.Signup);
// router.post('/login', authController.Login);
router.get('/getpfp', profileController.getPfp);

// router.get('/login', authController.Login);
module.exports = router;
