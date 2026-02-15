const supabase = require("../config/db");

const getCoords = async ({ indirizzo, citta, cap }) => {
  const queryCompleta = `${indirizzo}, ${cap} ${citta}, Italia`;
  const queryCodificata = encodeURIComponent(queryCompleta);
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${queryCodificata}&format=json&limit=1`;
  try {
    console.log("coords prima fetch");
    const response = await fetch(nominatimUrl);
    console.log("coords dopo fetch");
    if (!response.ok) {
      console.error(
        `Errore nella richiesta API: Stato ${response.status} - ${response.statusText}`,
      );
      throw { data: null, error: "Impossibile effettuare chiamata api" };
    }

    // 5. Parsa il corpo della risposta come JSON
    const data = await response.json();

    // 6. Elabora il risultato
    console.log("coords ho trovato data", data);

    if (data.length > 0) {
      console.log("coords eseguo calcoli");

      // L'API restituisce un array, prendiamo il primo risultato
      const primoRisultato = data[0];

      // Le coordinate sono presenti come stringhe, le convertiamo in numeri
      const latitudine = parseFloat(primoRisultato.lat);
      const longitudine = parseFloat(primoRisultato.lon);

      console.log(`Geocoding Riuscito:`);
      console.log(` - Trovato: ${primoRisultato.display_name}`);
      console.log(` - Latitudine (lat): ${latitudine}`);
      console.log(` - Longitudine (lon): ${longitudine}`);

      return { latitudine, longitudine, error: null };
    } else {
      throw {
        message: "Non esiste nessun luogo con quell'indirizzo",
        details: "l'array è vuoto",
      };
    }
  } catch (err) {
    return { data: null, error: err };
  }
};

const getAll = async (req) => {
  try {
    const EVENTSINPAGE = 12;
    const { offset } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error({ message: "Token mancante" });
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError) throw tokenError;

    const [
      { data: acceptedEvents, error: acceptedEventsError },
      { data: pendingEvents, error: pendingEventsError },
    ] = await Promise.all([
      supabase
        .from("risposte_eventi")
        .select(
          "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome),luoghi(*),gruppi(group_id,nome,group_cover_img,group_id,partecipanti_gruppo(partecipante_id)))",
        )
        .range(offset, offset + EVENTSINPAGE - 1)
        .eq("user_id", user.id)
        .eq("status", "accepted"),
      supabase
        .from("risposte_eventi")
        .select(
          "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome),luoghi(*),gruppi(group_id,nome,group_cover_img,partecipanti_gruppo(partecipante_id)))",
        )
        .limit(3)
        .eq("user_id", user.id)
        .eq("status", "pending"),
    ]);
    if (acceptedEventsError) throw acceptedEventsError;
    if (pendingEventsError) throw pendingEventsError;
    const eventsList = [...acceptedEvents, ...pendingEvents];
    if (eventsList.length == 0) return { data: [], error: null };
    const eventIds = eventsList.map((e) => e.event_id);
    const groupIds = eventsList.map((e) => e.eventi.gruppi.group_id);
    const { data: risposte, error: risposteError } = await supabase
      .from("risposte_eventi")
      .select(
        "user_id,is_creator,status, eventi!inner(event_id,gruppi(group_id))",
      )
      .eq("status", "accepted")
      .in("eventi.event_id", eventIds)
      .in("eventi.gruppi.group_id", groupIds);
    // risolvere bug ricerca eventi su incognito
    if (risposteError) throw risposteError;

    console.log("risposte", risposte, eventsList);

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

    const finalData = eventsList.map((e) => {
      return {
        ...e,
        partecipanti: eventParticipantsMap[e.event_id],
      };
    });
    return { data: finalData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

const deleteEvent = async (req) => {
  try {
    console.log("provando ad eliminare");
    const { event_id } = req.params;
    console.log("id evento", event_id);
    const { error: messageError } = await supabase
      .from("messaggi")
      .delete()
      .eq("event_id", event_id);
    if (messageError) throw messageError;

    const { error: eventGroupError } = await supabase
      .from("eventi_gruppo")
      .delete()
      .eq("event_id", event_id);
    if (eventGroupError) throw eventGroupError;

    const { error: imgsError } = await supabase
      .from("event_imgs")
      .delete()
      .eq("event_id", event_id);
    if (imgsError) throw imgsError;

    const { err: eventError } = await supabase
      .from("eventi")
      .delete()
      .eq("event_id", event_id);
    if (eventError) throw eventError;

    // rimuovi immgaini
    console.log("cerco le immagini");
    const { data: files, error: listError } = await supabase.storage
      .from("eventi")
      .list(`${event_id}`);
    console.log("file ottenuti", files);
    if (listError) throw listError;
    console.log("file ottenuti", files);
    if (!files || files.length === 0) {
      console.log(
        "La cartella è già vuota, procedo con l'eliminazione del record.",
      );
      return { data: { message: "ok" }, error: null };
    }
    const filesToRemove = files.map((x) => `${event_id}/${x.name}`);
    console.log("rimuoviamo ", filesToRemove);
    // 2. Crea i percorsi completi (folder/file.jpg)

    // 3. Elimina i file in blocco
    const { error: deleteError } = await supabase.storage
      .from("eventi")
      .remove(filesToRemove);

    if (deleteError) throw deleteError;

    return { data: { message: "ok" }, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const getEvent = async (req) => {
  try {
    const { event_id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Token mancante" };
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    const { data: eventData, error: eventError } = await supabase
      .from("risposte_eventi")
      .select(
        `event_id,
        status,eventi(event_id,
                      costo,
                      created_at,
                      created_by,
                      data,
                      titolo,
                      descrizione,
                      data_scadenza,
                      cover_img,
                      event_imgs(*),
                      utenti(user_id,nome),
                      luoghi(*),
                      gruppi(group_id,nome,group_cover_img,partecipanti_gruppo(partecipante_id)))`,
      )
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single();
    if (eventError) throw eventError;

    console.log("datipls", eventData);
    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status,utente:utenti(*),eventi(*),created_at,is_creator")
        .eq("eventi.event_id", event_id);
    if (eventParticipantsError) throw eventParticipantsError;

    const newRisposte = eventParticipants.map((risposta) => {
      return {
        utenti: risposta.utente,
        status: risposta.status,
        created_at: risposta.created_at,
        is_creator: risposta.is_creator,
      };
    });

    const finalData = {
      ...eventData,
      partecipanti: newRisposte,
    };

    return {
      data: finalData,
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};

const modify = async (req) => {
  const { event_id } = req.params;
  const body = req.body;
  const { data, error } = await supabase
    .from("eventi")
    .update([{ ...body }])
    .eq("event_id", event_id);
  return { data, error };
};
const getOrCreateLuogo = async (realBody) => {
  const {
    latitudine,
    longitudine,
    error: errorCoords,
  } = await getCoords(realBody);
  if (errorCoords) throw errorCoords;

  const { data: luogo, error } = await supabase
    .from("luoghi")
    .select("luogo_id")
    .match({ longitudine, latitudine })
    .maybeSingle(); // Più pulito di .single() se può non esistere
  if (error) throw error;
  if (luogo) return luogo.luogo_id;
  console.log(realBody);
  const { cap, indirizzo, citta } = realBody;
  const { data: nuovoLuogo, error: insertError } = await supabase
    .from("luoghi")
    .insert([
      {
        cap,
        indirizzo,
        citta,
        nome: realBody.nome_luogo,
        latitudine,
        longitudine,
      },
    ])
    .select("luogo_id")
    .single();

  if (insertError) throw insertError;
  return nuovoLuogo.luogo_id;
};
const newEvent = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "manca header auth" };
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const { images, ...realBody } = req.body.data;
    const group_id = realBody.group_id;
    const luogoId = await getOrCreateLuogo(realBody);
    const { cap, indirizzo, nome_luogo, citta, ...eventBody } = realBody;
    const { data: eventData, error: eventError } = await supabase
      .from("eventi")
      .insert([{ ...eventBody, luogo_id: luogoId, created_by: user.id }])
      .select("*")
      .single();
    if (eventError) throw eventError;
    const eventId = eventData.event_id;
    const [
      { data: messageData, error: errorMessage },
      { error: eventGroupError },
      { data: participantsData, error: participantsError },
    ] = await Promise.all([
      supabase
        .from("messaggi")
        .insert([
          {
            type: "event",
            event_id: eventId,
            user_id: user.id,
            group_id,
          },
        ])
        .select(
          "*, eventi(*,scadenza:data_scadenza, luogo:luoghi(*), utente:utenti(nome, user_id),gruppo:gruppi(*),cover_img,created_by)",
        )
        .single(),
      supabase.from("eventi_gruppo").insert([{ event_id: eventId, group_id }]),
      supabase
        .from("partecipanti_gruppo")
        .select("user_id:partecipante_id")
        .eq("group_id", group_id),
    ]);
    console.log("questi sono i dati dei partecipanti", participantsData);
    if (errorMessage) throw errorMessage;
    if (eventGroupError) throw eventGroupError;
    if (participantsError) throw participantsError;
    const answersToInsert = participantsData.map((participant) => {
      return {
        event_id: eventId,
        user_id: participant.user_id,
        status: participant.user_id === user.id ? "accepted" : "pending",
        is_creator: participant.user_id === user.id,
      };
    });
    console.log("aggiungo queste alle risposte degli eventi", answersToInsert);
    const { error: answerError } = await supabase
      .from("risposte_eventi")
      .insert(answersToInsert);
    if (answerError) throw answerError;

    const { data: eventParticipants, error: eventParticipantsError } =
      await supabase
        .from("risposte_eventi")
        .select("status,utente:utenti(*),eventi(*),created_at,is_creator")
        .eq("eventi.event_id", eventId);
    if (eventParticipantsError) throw eventParticipantsError;

    const newRisposte = eventParticipants.map((risposta) => {
      return {
        utenti: risposta.utente,
        user_id: risposta.utente.user_id,
        status: risposta.status,
        created_at: risposta.created_at,
        is_creator: risposta.is_creator,
      };
    });
    console.log("questo è message data per gli eventi", messageData.eventi);
    console.log("aggiunto nuovo evento", {
      event_imgs: [],
      ...messageData.eventi,
      risposte_evento: {
        rejected: newRisposte.filter((r) => r.status == "rejected"),
        accepted: newRisposte.filter((r) => r.status == "accepted"),
        pending: newRisposte.filter((r) => r.status == "pending"),
      },
    });

    return {
      data: {
        event_id: eventId,
        group_id: messageData.group_id, // Fondamentale per la tua setMessagesMap
        messageDetails: {
          ...messageData,
          // Iniettiamo i dettagli calcolati direttamente nell'oggetto eventi
          eventi: {
            ...messageData.eventi,
            event_imgs: [],
            risposte_evento: [...newRisposte],
          },
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
const modifyResponse = async (req) => {
  try {
    const { event_id } = req.params;
    const { status, prevStatus } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "manca header auth" };
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    const { data: answerData, error: answerError } = await supabase
      .from("risposte_eventi")
      .update({ status })
      .eq("event_id", event_id)
      .eq("user_id", user.id);
    if (answerError) throw answerError;
    return { data: { ...answerData, prevStatus }, error: null };
  } catch (err) {
    return { data: null, err: err };
  }
};
const getSuspended = async (req) => {
  try {
    const { offset } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "manca header auth" };
    const token = authHeader.split(" ")[1];
    const EVENTSINPAGE = 12;

    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError) throw tokenError;
    const { data: eventsList, error: eventsListError } = await supabase
      .from("risposte_eventi")
      .select(
        "event_id,status,eventi(event_id,costo,created_at,created_by,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome),luoghi(*),gruppi(group_id,nome,group_cover_img,group_id,partecipanti_gruppo(partecipante_id)))",
      )
      .eq("user_id", user.id)
      .eq("status", "pending")
      .range(offset, offset + EVENTSINPAGE - 1);
    if (eventsListError) throw eventsListError;

    if (eventsList.length == 0) return { data: [], error: null };
    const eventIds = eventsList.map((e) => e.event_id);
    const groupIds = eventsList.map((e) => e.eventi.gruppi.group_id);
    const { data: risposte, error: risposteError } = await supabase
      .from("risposte_eventi")
      .select(
        "user_id,is_creator,status, eventi!inner(event_id,gruppi(group_id))",
      )
      .eq("status", "accepted")
      .in("eventi.event_id", eventIds)
      .in("eventi.gruppi.group_id", groupIds);
    // risolvere bug ricerca eventi su incognito
    if (risposteError) throw risposteError;

    console.log("risposte", risposte, eventsList);

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

    const finalData = eventsList.map((e) => {
      return {
        ...e,
        partecipanti: eventParticipantsMap[e.event_id],
      };
    });
    console.log("ecco cosa invio", finalData);
    return { data: finalData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
module.exports = {
  getAll,
  getSuspended,
  getEvent,
  newEvent,
  deleteEvent,
  modifyResponse,
};
