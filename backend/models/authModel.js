const supabase = require("../config/db");

const createUser = async (req, token) => {
  const { email, nomeCompleto, username } = req.body;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError) {
    ("errore ottenere utente da token", token);
    return { user, error: userError };
  }
  ("token", token);

  const { error: profileError } = await supabase
    .from("utenti")
    .insert([
      {
        nome: nomeCompleto,
        email: email,
        handle: username,
        user_id: user.id,
      },
    ])
    .select();

  if (profileError) {
    console.error(
      "Errore nell'inserimento del profilo utente:",
      profileError.message,
    );
    return { user, error: profileError };
  }

  return { user, error: null };
};

const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("utenti")
    .select("email")
    .eq("email", email);

  if (error) {
    console.error("Errore durante la ricerca per email:", error);
    return null;
  }
  return data;
};
const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from("utenti")
    .select("handle")
    .eq("handle", username);

  if (error) {
    console.error("Errore durante la ricerca per username:", error);
    return null;
  }
  return data;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
};
