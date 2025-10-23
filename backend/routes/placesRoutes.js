const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
const authMiddleware = require('../middlewares/auth');
// Definisci la route per ottenere tutti gli eventi
router.post('/nearby', placesController.getNearbyEvents);

module.exports = router;
