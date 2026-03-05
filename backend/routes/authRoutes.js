const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// Definisci la route per ottenere tutti gli eventi
router.post("/register", authController.Signup);

module.exports = router;
