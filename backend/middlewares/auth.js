const supabase = require("../config/db");
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const {
    data: { user },
    error: tokenError,
  } = await supabase.auth.getUser(token);
  if (tokenError) {
    tokenError;
    return res.status(400).json({
      success: false,
      error: { message: "Token scaduto o non valido" },
    });
  }
  next();
};
module.exports = { authMiddleware };
