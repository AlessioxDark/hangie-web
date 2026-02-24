const supabase = require("../config/db");
const getPfp = async (req) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("utenti")
      .select("profile_pic")
      .eq("user_id", user_id);

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const getData = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Header Auth" };
    const token = req.headers.authorization.split(" ")[1];
    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError) throw tokenError;

    const { data: profileData, error: profileError } = await supabase
      .from("utenti")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (profileError) throw profileError;
    const { count: friendsCount, error: friendsCountError } = await supabase
      .from("amicizie")
      .select("*", { count: "exact", head: true })
      .or(`user_id.eq.${user.id},amico_id.eq.${user.id}`);
    console.log("i friends", friendsCount, friendsCountError);
    if (friendsCountError) throw friendsCountError;
    const { count: createdEventsCount, error: createdEventsCountError } =
      await supabase
        .from("eventi")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id);
    if (createdEventsCountError) throw createdEventsCountError;
    const { data: acceptedEvents, error: acceptedEventsError } = await supabase
      .from("risposte_eventi")
      .select("eventi(data)")
      .eq("user_id", user.id)
      .eq("status", "accepted");
    if (acceptedEventsError) throw acceptedEventsError;

    return {
      data: {
        ...profileData,
        acceptedEventsCount: acceptedEvents.length,
        pastAttendedCount: acceptedEvents.filter(
          (e) => e.eventi.data < Date.now(),
        ).length,
        createdEventsCount,
        friendsCount,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
module.exports = {
  getPfp,
  getData,
};
