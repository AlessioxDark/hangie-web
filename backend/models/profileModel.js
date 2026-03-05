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
    const { userHandle } = req.params;

    // 1. Recupero ID Utente
    const { data: userData, error: userError } = await supabase
      .from("utenti")
      .select("user_id")
      .eq("handle", userHandle)
      .single();

    if (userError || !userData) throw new Error("Utente non trovato");
    const user_id = userData.user_id;

    // 2. Recupero Profilo e Conteggi Base (Friends/Created)
    // Usiamo Promise.all per velocizzare
    const [profileRes, friendsRes, createdRes, acceptedRes] = await Promise.all(
      [
        supabase.from("utenti").select("*").eq("user_id", user_id).single(),
        supabase
          .from("amicizie")
          .select("*", { count: "exact", head: true })
          .or(`user_id.eq.${user_id},amico_id.eq.${user_id}`)
          .eq("status", "accepted"),
        supabase
          .from("eventi")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user_id),
        supabase
          .from("risposte_eventi")
          .select("eventi(data)")
          .eq("user_id", user_id)
          .eq("status", "accepted"),
      ],
    );

    if (profileRes.error) throw profileRes.error;

    // Variabili di appoggio con valori di default
    let newEventsData = [];
    let nuovoKarma = profileRes.data.karma || 100; // Default al karma attuale o 100
    const profileData = profileRes.data;
    const friendsCount = friendsRes.count || 0;
    const createdEventsCount = createdRes.count || 0;
    const acceptedEvents = acceptedRes.data || [];

    // 3. Recupero Eventi a cui partecipa
    const { data: eventsData, error: eventsError } = await supabase
      .from("risposte_eventi")
      .select(
        `
        event_id, 
        status, 
        eventi(
          event_id, costo, created_at, created_by, data, titolo, descrizione, 
          data_scadenza, cover_img, event_imgs(*), utenti(user_id, nome), 
          luoghi(*), gruppi(group_id, nome, group_cover_img, partecipanti_gruppo(partecipante_id))
        )
      `,
      )
      .eq("user_id", user_id);

    if (eventsError) throw eventsError;

    // 4. Se ci sono eventi, elaboriamo i dettagli e il Karma
    if (eventsData && eventsData.length > 0) {
      const eventIds = eventsData
        .map((e) => e?.eventi?.event_id)
        .filter((id) => id);

      if (eventIds.length > 0) {
        const { data: eventParticipants, error: eventParticipantsError } =
          await supabase
            .from("risposte_eventi")
            .select(
              "status, utente:utenti(*), eventi(*), created_at, is_creator",
            )
            .in("event_id", eventIds);

        const eventParticipantsMap = (eventParticipants || []).reduce(
          (acc, curr) => {
            const id = curr?.eventi?.event_id;
            if (id) {
              if (!acc[id]) acc[id] = [];
              acc[id].push({
                utenti: curr?.utente,
                status: curr?.status,
                is_creator: curr?.is_creator,
                created_at: curr?.created_at,
              });
            }
            return acc;
          },
          {},
        );

        newEventsData = eventsData.map((e) => ({
          event_id: e?.event_id,
          status: e?.status,
          costo: e?.eventi?.costo,
          data: e?.eventi?.data,
          titolo: e?.eventi?.titolo,
          group_id: e?.eventi?.group_id,
          descrizione: e?.eventi?.descrizione,
          created_by: e?.eventi?.created_by,
          cover_img: e?.eventi?.cover_img,
          event_imgs: e?.eventi?.event_imgs,
          luogo: e?.eventi?.luoghi,
          utente: e?.eventi?.utenti,
          gruppo: e?.eventi?.gruppi,
          scadenza: e?.eventi?.data_scadenza,
          risposte_evento: eventParticipantsMap[e?.event_id] || [],
        }));

        // Calcolo Karma
        const now = new Date().toISOString();
        const acceptedPast = eventsData.filter(
          (e) => e?.eventi?.data < now && e.status === "accepted",
        ).length;
        const rejectedPast = eventsData.filter(
          (e) => e?.eventi?.data < now && e.status === "rejected",
        ).length;

        nuovoKarma =
          100 + acceptedPast * 10 - rejectedPast * 20 + createdEventsCount * 20;

        // Aggiorna il Karma nel DB
        await supabase
          .from("utenti")
          .update({ karma: nuovoKarma })
          .eq("user_id", user_id);
      }
    }

    // 5. Return Finale (Tutte le variabili sono definite grazie ai default sopra)
    return {
      data: {
        ...profileData,
        karma: nuovoKarma,
        acceptedEventsCount: acceptedEvents.length,
        pastAttendedCount: acceptedEvents.filter(
          (e) => e.eventi?.data && new Date(e.eventi.data) < new Date(),
        ).length,
        createdEventsCount,
        friendsCount,
        newEventsData,
      },
      error: null,
    };
  } catch (err) {
    console.error("Crash in getData:", err.message);
    return { data: null, error: err.message };
  }
};
module.exports = {
  getPfp,
  getData,
};
