const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
// Definisci la route per ottenere tutti gli eventi
router.post("/register", authMiddleware.authMiddleware, authController.Signup);

module.exports = router;
