const supabase = require("../config/db");

const createUser = async (req) => {
  const { email, nomeCompleto, username } = req.body;
  const user = req.user;

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
    return null;
  }
  return data;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
};
