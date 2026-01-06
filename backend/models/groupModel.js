const supabase = require("../config/db");
const getAll = async (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const {
    data: { user },
    error: tokenError,
  } = await supabase.auth.getUser(token);

  const { data, error } = await supabase
    .from("partecipanti_gruppo")
    .select("gruppi(*,messaggi(*),partecipanti_gruppo(*,utenti(*)))")
    .eq("partecipante_id", user.id);
  console.log("uid", user.id);
  if (error) {
    console.log(error);
  }
  console.log(data);

  return { data, error };
};
const getGroup = async (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const {
    data: { user },
    error: tokenError,
  } = await supabase.auth.getUser(token);
  if (tokenError || !user) {
    return {
      data: null,
      error: tokenError || { message: "Utente non autenticato." },
    };
  }
  const { group_id } = req.params;
  const user_id = user.id;

  // FASE 1: Verifica l'accesso e recupera i dati del gruppo (senza messaggi)
  // Seleziona la riga del partecipante per verificare l'accesso.
  const { data: participantRow, error: accessError } = await supabase
    .from("partecipanti_gruppo")
    .select(`gruppi:group_id(*), utenti:partecipante_id(*)`) // Seleziona il gruppo e i dati del partecipante che accede
    .eq("group_id", group_id)
    .eq("partecipante_id", user_id)
    .single();

  if (accessError || !participantRow) {
    return {
      data: null,
      error: accessError || { message: "Gruppo non trovato o accesso negato." },
    };
  }

  // Estraiamo i dati del gruppo principale
  const groupDetails = participantRow.gruppi;

  // FASE 2: Query separata per i messaggi (CORREZIONE APPLICATA)
  const { data: messagesData, error: messagesError } = await supabase
    .from("messaggi")
    .select("*,utenti(*),messaggi_status(*)")
    .eq("group_id", group_id)
    .order("sent_at", { ascending: true }); // Ordina cronologicamente

  if (messagesError) {
    console.error("Errore nel recupero dei messaggi:", messagesError);
    // Continua con messaggi vuoti in caso di errore
  }
  const messages = messagesData || [];

  // 3. IDENTIFICARE GLI EVENTI NEI MESSAGGI
  const eventMessages = messages.filter(
    (m) => m.type === "event" && m.event_id
  );
  const eventIds = eventMessages.map((m) => m.event_id);

  // Fetch dei dettagli di tutti gli eventi in una sola query
  const { data: eventsDetails, error: eventsError } = await supabase
    .from("eventi")
    .select(
      `*,
            utenti(creatore:nome, user_id),
            luoghi(nome, citta, indirizzo),
            risposte_eventi(*, utenti(profile_pic, user_id, nome))`
    )
    .in("event_id", eventIds);

  if (eventsError) {
    console.error("Errore nel recupero dei dettagli eventi:", eventsError);
    // Continuiamo, ma l'errore è loggato
  }

  // Mappa degli eventi per ID
  const eventMap = (eventsDetails || []).reduce((acc, event) => {
    acc[event.event_id] = event;
    return acc;
  }, {});

  // Fetch Asincrono delle Immagini (in parallelo)
  const imagesPromises = (eventsDetails || []).map(async (event) => {
    const imagePublicUrls = [];
    for (let i = 1; i <= 4; i++) {
      const path = `${event.event_id}/${i}.jpg`;
      // Non gestisco l'errore del getPublicUrl perché è implicito che alcune immagini potrebbero non esistere
      const {
        data: { publicUrl },
      } = supabase.storage.from("eventi").getPublicUrl(path);
      imagePublicUrls.push(publicUrl);
    }
    return { event_id: event.event_id, images: imagePublicUrls };
  });

  const imagesResults = await Promise.all(imagesPromises);
  const imageMap = imagesResults.reduce((acc, result) => {
    acc[result.event_id] = result.images;
    return acc;
  }, {});

  // 6. UNIFICAZIONE DEI DATI E RITORNO
  // Arricchiamo i messaggi con i dettagli degli eventi e le immagini
  const finalMessages = messages.map((message) => {
    if (message.type === "event" && message.event_id) {
      const eventDetails = eventMap[message.event_id];

      return {
        ...message,
        event_details: {
          ...eventDetails,
          event_imgs: imageMap[message.event_id] || [],
        },
      };
    }
    return message;
  });

  // const {data:statusData,error:statusError} = await supabase.from("messaggi_status").select("*").eq
  const definitiveMessages = finalMessages.map((m) => {
    const isUser = m.user_id === user.id;
    const statuses = m.messaggi_status || [];

    const isRead =
      statuses.length > 0 && statuses.every((s) => s.status === "read");

    // DOPPIA SPUNTA GRIGIA: Tutti i destinatari devono aver ricevuto (delivered o read)
    const isSent =
      statuses.length > 0 &&
      statuses.every((s) => s.status === "delivered" || s.status === "read");

    return {
      ...m,
      isUser,
      isSent,
      isRead,
      // Possiamo anche passare i dati dell'utente per la UI
      utenti: m.utenti,
    };
  });

  console.log("i dati finali sono", {
    data: {
      // Estraiamo i dati effettivi del gruppo dall'oggetto participantData
      ...groupDetails,
      messaggi: finalMessages,
      partecipanti_gruppo: participantRow.utenti, // Assumo che 'utenti' qui sia l'elenco dei partecipanti
    },
    error: null,
  });
  return {
    data: {
      // Estraiamo i dati effettivi del gruppo dall'oggetto participantData
      ...groupDetails,
      messaggi: definitiveMessages,
      partecipanti_gruppo: participantRow.utenti, // Assumo che 'utenti' qui sia l'elenco dei partecipanti
    },
    error: null,
  };
};
const getEvents = async (req) => {
  const { group_id } = req.params;

  const { data, error } = await supabase
    .from("eventi_gruppo")
    // .select(
    // 	'*,risposte_eventi(event_id,status,eventi(event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,data_scadenza,cover_img,gruppi(*,partecipanti_gruppo(*)))'
    // )
    .select(
      "*, eventi(event_id,costo,data,titolo,utenti (user_id, nome, profile_pic),luoghi(*),risposte_eventi(*),descrizione, data_scadenza,cover_img,event_imgs(*),gruppi(*, partecipanti_gruppo(*)))"
    )
    // .select(
    // 	'*,eventi(*,event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,data_scadenza,cover_img,gruppi(*,partecipanti_gruppo(*))'
    // )
    .eq("group_id", group_id);

  console.log("trovando eventi_gruppo");
  console.log(data);
  return { data, error };
};
const getEvent = async (req) => {
  const { event_id } = req.params;

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .eq("event_id", event_id);
  console.log(data);
  return { data, error };
};

const newGroup = async (req) => {
  const body = req.body;
  const token = req.headers.authorization.split(" ")[1];

  const { participants, ...newBody } = body;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError) {
    console.log("errore ottenere utente da token", token);
    return { data: null, error: userError };
  }
  const { data: groupData, error: groupError } = await supabase
    .from("gruppi")
    .insert([{ ...newBody, createdBy: user.id }])
    .select("*");
  if (groupError) {
    console.log("errore con gruppi");
    return { data: null, error: groupError };
  }
  const groupId = groupData[0].group_id;
  const newPartecipantiArray = participants.map((participant) => {
    return {
      partecipante_id: participant.user_id,
      group_id: groupId,
      role: "member",
    };
  });

  newPartecipantiArray.push({
    partecipante_id: user.id,
    group_id: groupId,
    role: "admin",
  });
  const { data: participantsData, error: participantsError } = await supabase
    .from("partecipanti_gruppo")
    .insert(newPartecipantiArray);
  if (participantsError) {
    console.log("errorePartecipanti");
    return { data: null, error: participantsError };
  }

  // aggiungo immagine a database

  return {
    data: {
      success: "ok",
      group_id: groupId,
      groupData: groupData[0],
      participants,
      creator: user,
    },
    error: null,
  };
};

const modify = async (req) => {
  const { group_id } = req.params;
  const body = req.body;

  const { data, error } = await supabase
    .from("gruppi")
    .update([{ ...body }])
    .eq("group_id", group_id);
  return { data, error };
};

const leave = async (req) => {
  console.log("abbandonando...");
  const { group_id } = req.params;
  const token = req.headers.authorization.split(" ")[1];

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  const { data, error } = await supabase
    .from("partecipanti_gruppo")
    .delete("*")
    .eq("group_id", group_id)
    .eq("partecipante_id", user.id);

  const { data: participantsData, error: participantsError } = await supabase
    .from("partecipanti_gruppo")
    .select("*")
    .eq("group_id", group_id)
    .order("joinedAt", { ascending: false });
  const { data: groupData, error: groupError } = await supabase
    .from("gruppi")
    .select("*")
    .eq("group_id", group_id)
    .single();

  const isAdmin = participantsData.some((p) => p.role == "admin");
  const isCreator = participantsData.some(
    (p) => p.partecipante_id == groupData.createdBy
  );
  if (!isAdmin) {
    const { data: adminData, error: adminError } = await supabase
      .from("partecipanti_gruppo")
      .update({ role: "admin" })
      .eq("partecipante_id", participantsData[0].partecipante_id);
  }
  if (!isCreator) {
    const { data: adminGroupData, error: adminGroupError } = await supabase
      .from("gruppi")
      .update({ createdBy: participantsData[0].partecipante_id })
      .eq("group_id", group_id);
  }

  const { count, error: countError } = await supabase
    .from("partecipanti_gruppo")
    .select("*", { count: "exact", head: true })
    .eq("group_id", group_id);

  if (count == 0) {
    const { data: messages } = await supabase
      .from("messaggi")
      .select("message_id,type,event_id")
      .eq("group_id", group_id);
    const messageEvents = messages.filter((m) => m.type == "filter");
    if (messages && messages.length > 0) {
      const messageIds = messages.map((m) => m.message_id);

      // 2. Elimina gli stati per quei messaggi
      await supabase
        .from("messaggi_status")
        .delete()
        .in("messaggio_id", messageIds);
    }
    if (messageEvents) {
      const messageEventsEventsIds = messageEvents.map((m) => m.event_id);
      for (const eventId of messageEventsEventsIds) {
        if (!eventId) continue; // Salta se per caso l'ID è nullo

        // 1. Elenca i file nella cartella dell'evento
        const { data: folderContent } = await supabase.storage
          .from("eventi")
          .list(eventId);

        if (folderContent && folderContent.length > 0) {
          // 2. Crea i percorsi completi
          const filesToDelete = folderContent.map(
            (file) => `${eventId}/${file.name}`
          );

          // 3. Elimina i file dallo storage
          await supabase.storage.from("eventi").remove(filesToDelete);
          console.log(`Cartella evento ${eventId} eliminata`);
        }
      }

      await supabase
        .from("eventi")
        .delete()
        .in("event_id", messageEventsEventsIds);
    }
    const { error: messagesError } = await supabase
      .from("messaggi")
      .delete()
      .eq("group_id", group_id);

    const { data: folderContent } = await supabase.storage
      .from("group_cover_imgs")
      .list(group_id);
    if (folderContent && folderContent.length > 0) {
      // Trasforma la lista in percorsi completi: "ID_GRUPPO/file.jpg"
      const filesToDelete = folderContent.map(
        (file) => `${group_id}/${file.name}`
      );

      // Elimina i file: questo farà sparire la cartella
      await supabase.storage.from("group_cover_imgs").remove(filesToDelete);
    }

    const { error: GroupError } = await supabase
      .from("gruppi")
      .delete()
      .eq("group_id", group_id);
    console.log("eliminato gruppo con successo");
  }
  return { data, error };
};
const addParticipants = async (req) => {
  const { group_id } = req.params;

  const participantsIds = req.body;

  const participantsInsert = participantsIds.map((participant) => {
    return {
      group_id,
      partecipante_id: participant.user_id,
      role: "member",
    };
  });
  const { data, error } = await supabase
    .from("partecipanti_gruppo")
    .insert(participantsInsert);
  return { data, error };
};
const removeParticipant = async (req) => {
  const { group_id } = req.params;
  const { user_id } = req.body;
  console.log("arriva il remove participant");
  const { data, error } = await supabase
    .from("partecipanti_gruppo")
    .delete()
    .eq("group_id", group_id)
    .eq("partecipante_id", user_id);

  return { data, error };
};

module.exports = {
  getAll,
  getGroup,
  getEvent,
  newGroup,
  modify,
  getEvents,
  leave,
  addParticipants,
  removeParticipant,
};
