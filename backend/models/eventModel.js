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
    const { data, error } = await supabase
      .from("risposte_eventi")
      .select(
        "event_id,status,eventi(event_id,costo,data,titolo,descrizione,data_scadenza,cover_img,event_imgs(*),utenti(user_id,nome),luoghi(*),gruppi(nome,group_cover_img,partecipanti_gruppo(partecipante_id)))",
      )
      .range(offset, offset + EVENTSINPAGE - 1)
      .eq("user_id", user.id);

    if (error) throw error;

    return { data: data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

const getEvents = async () => {
  // const { user_id } = req.params;
  // const { data, error } = await supabase
  // 	.from('risposte_eventi')
  // 	.select(
  // 		'eventi(event_id,luogo,costo,data,titolo,created_by,event_cover_img)'
  // 	)
  // 	// .eq('risposte_eventi.user_id', user_id)
  // 	.eq('status', 'accepted');
  // return { data, error };
};
const getEvent = async (req) => {
  const { event_id } = req.params;

  const { data, error } = await supabase
    .from("eventi")
    .select(
      `
	     *,
	      utenti(creatore:nome,user_id ),
	 	    luoghi(nome, citta,indirizzo),
	 	     risposte_eventi(*,utenti(profile_pic,user_id,nome))
      
	  `,
    )
    .eq("event_id", event_id)
    .single();

  let images = [];
  for (let i = 1; i <= 4; i++) {
    const path = `${event_id}/${i}.jpg`;
    const {
      data: { publicUrl },
      error: publicUrlError,
    } = supabase.storage
      .from("eventi") // Updated bucket name here
      .getPublicUrl(path);
    if (publicUrlError) {
      console.error(
        `Errore nel recuperare l'immagine ${i}.jpg:`,
        publicUrlError,
      );
    }

    images.push(publicUrl);
  }

  const finalData = {
    ...data,
    event_imgs: images,
  };

  return { finalData, error };
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

  const { data: nuovoLuogo, error: insertError } = await supabase
    .from("luoghi")
    .insert([
      { ...realBody, nome: realBody.nome_luogo, latitudine, longitudine },
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
        .select("*, eventi(*, luoghi(*), utenti(nome, user_id))")
        .single(),
      supabase.from("eventi_gruppo").insert([{ event_id: eventId, group_id }]),
      supabase
        .from("partecipanti_gruppo")
        .select("user_id:partecipante_id")
        .eq("group_id", group_id),
    ]);

    if (errorMessage) throw errorMessage;
    if (eventGroupError) throw eventGroupError;
    if (participantsError) throw participantsError;
    const answersToInsert = participantsData.map((participant) => {
      return {
        event_id: eventId,
        user_id: participant.partecipante_id,
        status:
          participant.partecipante_id === user.id ? "accepted" : "pending",
        is_creator: participant.user_id === user.id,
      };
    });
    const { error: answerError } = await supabase
      .from("risposte_eventi")
      .insert(answersToInsert);
    if (answerError) throw answerError;
    return {
      data: {
        event_id: eventId,
        messageDetails: messageData,
        event_details: {
          event_imgs: [],
          ...messageData.eventi,
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
const modifyResponse = async (req) => {
  const { status, event_id } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  let user_id;
  const { user, error: userError } = await supabase.auth.getUser(token);
  if (user) {
    user_id = user.user_id;
  }
  if (userError) {
    return { data: null, userError };
  }
  const finalData = { event_id, user_id, status: status };
  const { data, error } = await supabase
    .from("risposte_eventi")
    .upsert(finalData, { onConflict: "user_id, event_id" })
    .eq("event_id", event_id);
  return { data, error };
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
    const { data, error } = await supabase
      .from("risposte_eventi")
      .select(
        "event_id,status,eventi(event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,cover_img,data_scadenza,event_imgs(*),gruppi(*,partecipanti_gruppo(*)))",
      )
      .eq("user_id", user.id)
      .eq("status", "pending")
      .range(offset, offset + EVENTSINPAGE - 1);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
module.exports = {
  getAll,
  getSuspended,
  getEvent,
  newEvent,
};
