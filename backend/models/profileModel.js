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
    console.log("ciao da profile", userHandle);
    const {
      data: { user_id },
      error: userError,
    } = await supabase
      .from("utenti")
      .select("user_id")
      .eq("handle", userHandle)
      .single();
    console.log("ecco user_id", user_id);
    if (userError) throw userError;

    const { data: profileData, error: profileError } = await supabase
      .from("utenti")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (profileError) throw profileError;
    const { count: friendsCount, error: friendsCountError } = await supabase
      .from("amicizie")
      .select("*", { count: "exact", head: true })
      .or(`user_id.eq.${user_id},amico_id.eq.${user_id}`)
      .eq("status", "accepted");
    console.log("i friends", friendsCount, friendsCountError);
    if (friendsCountError) throw friendsCountError;

    const { count: createdEventsCount, error: createdEventsCountError } =
      await supabase
        .from("eventi")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user_id);

    if (createdEventsCountError) throw createdEventsCountError;
    const { data: acceptedEvents, error: acceptedEventsError } = await supabase
      .from("risposte_eventi")
      .select("eventi(data)")
      .eq("user_id", user_id)
      .eq("status", "accepted");
    if (acceptedEventsError) throw acceptedEventsError;
    console.log("i profilidata", profileData);

    const { data: eventsData, error: eventsError } = await supabase
      .from("risposte_eventi")
      .select(
        "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome),luoghi(*),gruppi(group_id,nome,group_cover_img,group_id,partecipanti_gruppo(partecipante_id)))",
      )
      .eq("user_id", user_id);
    const eventIds = eventsData.map((e) => e.eventi.event_id);

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status,utente:utenti(*),eventi(*),created_at,is_creator")
        .in("eventi.event_id", eventIds);

    const eventParticipantsMap = eventParticipants.reduce((acc, curr) => {
      if (!acc[curr.eventi.event_id]) acc[curr.eventi.event_id] = [];
      acc[curr.eventi.event_id].push({
        utenti: curr.utente,
        status: curr.status,
        is_creator: curr.is_creator,
        created_at: curr.created_at,
      });
      return acc;
    }, {});
    if (eventParticipantsError) throw eventParticipantsError;
    if (eventsError) throw eventsError;

    const newEventsData = eventsData.map((e) => {
      return {
        event_id: e.event_id,
        status: e.status, // Stato (pending, accepted, refused)
        costo: e.eventi.costo,
        data: e.eventi.data,
        titolo: e.eventi.titolo,
        group_id: e.eventi.group_id,
        descrizione: e.eventi.descrizione,
        created_by: e.eventi.created_by,

        cover_img: e.eventi.cover_img,
        event_imgs: e.eventi.event_imgs,
        luogo: e.eventi.luoghi, // Attenzione, qui è 'luoghi' non 'luogo'
        utente: e.eventi.utenti,
        gruppo: e.eventi.gruppi, // Attenzione, qui è 'gruppi' non 'gruppo'
        scadenza: e.eventi.data_scadenza,
        risposte_evento: eventParticipantsMap[e.event_id],
      };
      // return { ...e.eventi, status: e.status };
    });

    const acceptedPastEvents = eventsData.filter(
      (e) => e.eventi.data < new Date().toISOString() && e.status == "accepted",
    );
    const rejectedPastEvents = eventsData.filter(
      (e) => e.eventi.data < new Date().toISOString() && e.status == "rejected",
    );

    console.log("acceptedpas", acceptedPastEvents, eventsData);
    console.log("rejectedpast", rejectedPastEvents);
    const bonusOrganizzatore = createdEventsCount * 20;
    const nuovoKarma =
      100 +
      acceptedPastEvents.length * 10 -
      rejectedPastEvents.length * 20 +
      bonusOrganizzatore;
    const { error: karmaError } = await supabase
      .from("utenti")
      .update({
        karma: nuovoKarma,
      })
      .eq("user_id", user_id);
    if (karmaError) throw karmaError;
    return {
      data: {
        ...profileData,
        karma: nuovoKarma,
        acceptedEventsCount: acceptedEvents.length,
        pastAttendedCount: acceptedEvents.filter(
          (e) => e.eventi.data < Date.now(),
        ).length,
        createdEventsCount,
        friendsCount,
        newEventsData,
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
