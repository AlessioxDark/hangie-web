const Auth = require("../models/authModel");
const jwt = require("jsonwebtoken");
const Signup = async (req, res) => {
  try {
    const { user, error } = await Auth.createUser(req);
    if (error) {
      return res.status(400).json({ success: false, error: { message: error } });
    }
    return res
      .status(200)
      .json({ success: true, message: "Registrazione completata con successo." });
  } catch (error) {
    console.error("Errore durante Signup:", error);
    return res.status(500).json({ success: false, error: { message: "Errore interno del server" } });
  }
};

module.exports = { Signup };
