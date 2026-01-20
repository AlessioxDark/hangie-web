const supabase = require("../config/db");
const getAll = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Header Auth" };
    const token = req.headers.authorization.split(" ")[1];
    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError) throw tokenError;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .select(
        `
      gruppi(
      *,
      messaggi(*),
      partecipanti_gruppo(*,
      utenti(nome, handle, user_id, profile_pic
      )
    )
  )  
      `,
      )
      .eq("partecipante_id", user.id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.log("ho trowato", err);
    return { data: null, error: err };
  }
};
const getGroup = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Header Auth" };
    const token = req.headers.authorization.split(" ")[1];
    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    if (tokenError || !user) {
      throw {
        error: tokenError || { message: "Utente non autenticato." },
      };
    }
    const { group_id } = req.params;
    const user_id = user.id;

    const [
      { data: participantRow, error: accessError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("partecipanti_gruppo")
        .select(`gruppi:group_id(*), utenti:partecipante_id(*)`) // Seleziona il gruppo e i dati del partecipante che accede
        .eq("group_id", group_id)
        .eq("partecipante_id", user_id)
        .single(),
      supabase
        .from("messaggi")
        .select("*,utenti(*),messaggi_status(*)")
        .eq("group_id", group_id)
        .order("sent_at", { ascending: true }),
    ]);

    if (accessError || !participantRow) {
      throw {
        message: "Gruppo non trovato o accesso negato.",
      };
    }
    const groupDetails = participantRow.gruppi;

    if (messagesError) throw messagesError;
    const messages = messagesData || [];

    const eventIds = messages
      .filter((m) => m.type === "event" && m.event_id)
      .map((m) => m.event_id);

    const { data: eventsDetails, error: eventsError } = await supabase
      .from("eventi")
      .select(
        `*,
            utenti(creatore:nome, user_id),
            luoghi(nome, citta, indirizzo),
            risposte_eventi(*, utenti(profile_pic, user_id, nome))
            `,
      )
      .in("event_id", eventIds);

    if (eventsError) throw eventsError;

    const eventDetail = eventsDetails.reduce((acc, event) => {
      acc[event.event_id] = event;
      return acc;
    }, {});

    const definitiveMessages = messages.map((m) => {
      const isUser = m.user_id === user.id;
      const statuses = m.messaggi_status || [];
      const event_details =
        m.type === "event" ? eventDetail[m.event_id] || null : null;
      const isRead =
        statuses.length > 0 && statuses.every((s) => s.status === "read");

      const isSent =
        statuses.length > 0 &&
        statuses.every((s) => s.status === "delivered" || s.status === "read");

      return {
        ...m,
        isUser,
        isSent,
        isRead,
        event_details,
        utenti: m.utenti,
      };
    });

    return {
      data: {
        ...groupDetails,
        messaggi: definitiveMessages,
        partecipanti_gruppo: participantRow,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
const getEvents = async (req) => {
  try {
    const { group_id } = req.params;

    const { data, error } = await supabase
      .from("eventi_gruppo")

      .select(
        "*, eventi(event_id,costo,data,titolo,utenti (user_id, nome, profile_pic),luoghi(*),risposte_eventi(*),descrizione, data_scadenza,cover_img,event_imgs(*),gruppi(*, partecipanti_gruppo(*)))",
      )
      .eq("group_id", group_id);
    if (error) throw error;
    console.log("trovando eventi_gruppo");
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const getEvent = async (req) => {
  try {
    const { event_id } = req.params;

    const { data, error } = await supabase
      .from("eventi")
      .select("*")
      .eq("event_id", event_id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};

const newGroup = async (req) => {
  try {
    const body = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Auth Header" };
    const token = authHeader.split(" ")[1];

    const { participants, ...newBody } = body;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    const { data: groupData, error: groupError } = await supabase
      .from("gruppi")
      .insert([{ ...newBody, createdBy: user.id }])
      .select("*")
      .single();
    if (groupError) throw groupError;
    const groupId = groupData.group_id;
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
    if (participantsError) throw participantsError;

    // aggiungo immagine a database

    return {
      data: {
        group_id: groupId,
        groupData: groupData[0],
        participants,
        creator: user,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};

const modify = async (req) => {
  try {
    const { group_id } = req.params;
    const body = req.body;
    if (body.isAdmin) {
      const { data, error } = await supabase
        .from("gruppi")
        .update([{ [body.field]: body.fieldValue }])
        .eq("group_id", group_id);

      if (error) throw error;
      return { data, error: null };
    } else {
      throw { message: "Solo gli admin possono modificare il gruppo" };
    }
  } catch (err) {
    return { data: null, error: err };
  }
};

const leave = async (req) => {
  try {
    const { group_id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw { message: "Manca Auth Header" };
    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .delete("*")
      .eq("group_id", group_id)
      .eq("partecipante_id", user.id);
    if (error) throw error;

    const { data: participantsData, error: participantsError } = await supabase
      .from("partecipanti_gruppo")
      .select("*")
      .eq("group_id", group_id)
      .order("joinedAt", { ascending: false });
    if (participantsError) throw participantsError;

    const { data: groupData, error: groupError } = await supabase
      .from("gruppi")
      .select("*")
      .eq("group_id", group_id)
      .single();
    if (groupError) throw groupError;

    const isAdmin = participantsData.some((p) => p.role == "admin");
    const isCreator = participantsData.some(
      (p) => p.partecipante_id == groupData.createdBy,
    );
    if (!isAdmin) {
      const { data: adminData, error: adminError } = await supabase
        .from("partecipanti_gruppo")
        .update({ role: "admin" })
        .eq("partecipante_id", participantsData[0].partecipante_id);
      if (adminError) throw adminError;
    }
    if (!isCreator) {
      const { data: adminGroupData, error: adminGroupError } = await supabase
        .from("gruppi")
        .update({ createdBy: participantsData[0].partecipante_id })
        .eq("group_id", group_id);
      if (adminGroupError) throw adminGroupError;
    }

    const { count, error: countError } = await supabase
      .from("partecipanti_gruppo")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group_id);
    if (countError) throw countError;

    if (count == 0) {
      const { data: messages, error: messageError } = await supabase
        .from("messaggi")
        .select("message_id,type,event_id")
        .eq("group_id", group_id);
      if (messageError) throw messageError;

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
          const { data: folderContent, error: folderError } =
            await supabase.storage.from("eventi").list(eventId);
          if (folderError) throw folderError;

          if (folderContent && folderContent.length > 0) {
            // 2. Crea i percorsi completi
            const filesToDelete = folderContent.map(
              (file) => `${eventId}/${file.name}`,
            );

            // 3. Elimina i file dallo storage
            await supabase.storage.from("eventi").remove(filesToDelete);
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
      if (messagesError) throw messagesError;

      const { data: folderContent, error: folderError } = await supabase.storage
        .from("group_cover_imgs")
        .list(group_id);
      if (folderError) throw folderError;

      if (folderContent && folderContent.length > 0) {
        // Trasforma la lista in percorsi completi: "ID_GRUPPO/file.jpg"
        const filesToDelete = folderContent.map(
          (file) => `${group_id}/${file.name}`,
        );

        // Elimina i file: questo farà sparire la cartella
        await supabase.storage.from("group_cover_imgs").remove(filesToDelete);
      }

      const { error: GroupsError } = await supabase
        .from("gruppi")
        .delete()
        .eq("group_id", group_id);
      if (GroupsError) throw GroupsError;
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const addParticipants = async (req) => {
  try {
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
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const removeParticipant = async (req) => {
  try {
    const { group_id } = req.params;
    const { user_id } = req.body;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .delete()
      .eq("group_id", group_id)
      .eq("partecipante_id", user_id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
};
const modifyParticipant = async (req) => {
  try {
    const { group_id } = req.params;
    const { user_id } = req.body;
    const { data, error } = await supabase
      .from("partecipanti_gruppo")
      .update({ role: "admin" })
      .eq("group_id", group_id)
      .eq("partecipante_id", user_id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { error: err, data: null };
  }
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
  modifyParticipant,
};
