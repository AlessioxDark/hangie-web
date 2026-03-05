const supabase = require("../config/db");
const getAll = async (req) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("amicizie")
    .select(
      `
    *,
    user_1:utenti!amicizie_user_id_fkey(*),
    user_2:utenti!amicizie_amico_id_fkey(*),
    sender_id
  `,
    )
    .or(`user_id.eq.${user_id},amico_id.eq.${user_id}`);
  const friendsOnly = data.map((rel) => {
    // Se user_1 sono io, l'amico è user_2. Altrimenti è user_1.
    const isUser1Me = rel.user_1.user_id === user_id;
    const profiloAmico = isUser1Me ? rel.user_2 : rel.user_1;

    return {
      ...profiloAmico,
      status: rel.status,
      friendship_id: rel.id, // Utile per gestire l'amicizia (es. rimuoverla)
      joined_at: rel.created_at, // Utile per sapere da quanto siete amici
      sender_id: rel.sender_id, // <--- FONDAMENTALE: aggiungiamo chi ha inviato la richiesta,
      is_receiver: rel.status === "pending" && rel.sender_id !== user_id, // Flag di comodità
    };
  });

  return { data: friendsOnly, error: null };
};
const getPending = async (req) => {
  const { user_id } = req.params;
  ("le ha chieste", user_id);
  const { data, error } = await supabase
    .from("amicizie")
    .select(
      `
    *,
    user_1:utenti!amicizie_user_id_fkey(*),
    user_2:utenti!amicizie_amico_id_fkey(*)
  `,
    )
    .or(`user_id.eq.${user_id},amico_id.eq.${user_id}`)
    .eq("status", "pending")
    .not("sender_id", "eq", user_id);
  return { data, error };
};
const sendRequest = async (req) => {
  try {
    ("inviata richiesta con", req.body);
    const { friend_id, user_id, status } = req.body;
    if (status == "pending") {
      const { data: FriendData, error: friendError } = await supabase
        .from("amicizie")
        .insert({ user_id, amico_id: friend_id, status, sender_id: user_id });
      if (friendError) throw friendError;
    } else if (status == "delete") {
      const { data: FriendData, error: friendError } = await supabase
        .from("amicizie")
        .delete()
        .match({
          sender_id: user_id,
          status: "pending", // Sicurezza extra: cancella solo se è ancora pendente
        });
      if (friendError) throw friendError;
    } else if (status === "accepted") {
      // 3. ACCETTA RICHIESTA
      const { error: friendError } = await supabase
        .from("amicizie")
        .update({ status: "accepted" })
        // Cruciale: Cerchiamo la riga dove l'ALTRO era il sender (user_id) e IO il receiver (amico_id)
        .match({ user_id: friend_id, amico_id: user_id });

      if (friendError) throw friendError;
    }

    return { data: { success: true }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const acceptRequest = async (req) => {
  const { friend_id } = req.body;
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("amicizie")
    .update([{ status: "accepted" }])
    .or(`user_id.eq.${user_id},user_id.eq.${friend_id}`)
    .or(`amico_id.eq.${user_id},amico_id.eq.${friend_id}`);
  return { data, error };
};
const denyRequest = async (req) => {
  const { friend_id } = req.body;
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("amicizie")
    .delete()
    .or(`user_id.eq.${user_id},user_id.eq.${friend_id}`)
    .or(`amico_id.eq.${user_id},amico_id.eq.${friend_id}`);
  return { data, error };
};
const getAccepted = async (req) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("amicizie")
    .select(
      `
    *,
    user_1:utenti!amicizie_user_id_fkey(*),
    user_2:utenti!amicizie_amico_id_fkey(*)
  `,
    )
    .or(`user_id.eq.${user_id},amico_id.eq.${user_id}`)
    .eq("status", "accepted");
  const friendsOnly = data.map((rel) => {
    // Se user_1 sono io, l'amico è user_2. Altrimenti è user_1.
    const isUser1Me = rel.user_1.user_id === user_id;
    const profiloAmico = isUser1Me ? rel.user_2 : rel.user_1;

    return {
      ...profiloAmico,
      friendship_id: rel.id, // Utile per gestire l'amicizia (es. rimuoverla)
      joined_at: rel.created_at, // Utile per sapere da quanto siete amici
    };
  });

  return { data: friendsOnly, error: null };
};
const getByQuery = async (req) => {
  try {
    ("ottenendo by query");
    const { query } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Header Auth" };
    const token = req.headers.authorization.split(" ")[1];
    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError) throw tokenError;
    const { data: FriendsData, error: FriendsError } = await supabase
      .from("amicizie")
      .select(`user_id, amico_id`)
      .or(`user_id.eq.${user.id},amico_id.eq.${user.id}`);
    if (FriendsError) throw FriendsError;

    const friendsIds = FriendsData.map((f) =>
      f.user_id === user.id ? f.amico_id : f.user_id,
    );

    friendsIds;
    const { data, error } = await supabase
      .from("utenti")
      .select(
        `
    * `,
      )
      .ilike("handle", `%${query}%`)
      .not("user_id", "eq", user.id) // Il simbolo % indica "qualsiasi carattere prima o dopo"  if (error) return error;
      .not("user_id", "in", `(${friendsIds.join(",")})`);
    if (error) throw error;

    const finalData = data.map((f) => {
      return f;
    });
    ("ottenendo by query eccolo il data", data);

    return { data: finalData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const deleteFriend = async (req) => {
  try {
    ("ottenendo by query");
    const { friend_id } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Header Auth" };
    const token = req.headers.authorization.split(" ")[1];
    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError) throw tokenError;
    const { data: FriendsData, error: FriendsError } = await supabase
      .from("amicizie")
      .delete()
      .or(
        `and(user_id.eq.${user.id},amico_id.eq.${friend_id}),and(user_id.eq.${friend_id},amico_id.eq.${user.id})`,
      );
    if (FriendsError) throw FriendsError;

    return { data: { success: true }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
module.exports = {
  getAll,
  getPending,
  sendRequest,
  acceptRequest,
  denyRequest,
  getAccepted,
  getByQuery,
  deleteFriend,
};
