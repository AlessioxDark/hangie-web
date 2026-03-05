const Auth = require("../models/authModel");
const jwt = require("jsonwebtoken");
const Signup = async (req, res) => {
  ("registrandoti...");
  const token = req.headers.authorization.split(" ")[1];
  const { user, error } = await Auth.createUser(req, token);
  if (error) {
    return res.status(400).json({ success: false, error: { message: error } });
  }
  return res
    .status(200)
    .json({ success: true, message: "Registrazione completata con successo." });
};

module.exports = { Signup };
