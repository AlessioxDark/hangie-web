const supabase = require("../config/db");

const groupHandlers = (io, socket) => {
  socket.on("join_room", (room_id) => {
    ("room_joinata");
    socket.join(room_id);
  });
  socket.on(
    "add_participants",
    async (groupId, token, finalEventsResponses) => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(token);
        if (userError) throw userError;
        const { data: allParticipants, error: participantsError } =
          await supabase
            .from("partecipanti_gruppo")
            .select("*,utenti(*),user_id:partecipante_id")
            .eq("group_id", groupId);
        if (participantsError) throw participantsError;

        const { data: groupInfo, error: groupError } = await supabase
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
          .eq("group_id", groupId)
          .eq("partecipante_id", user.id)
          .single();
        if (groupError) throw groupError;
        ("i dati del gruppo", groupInfo);
        let ultimoMessaggio = null;
        groupInfo?.gruppi.messaggi.forEach(async (messaggio) => {
          if (!ultimoMessaggio || messaggio.sent_at > ultimoMessaggio.sent_at) {
            ultimoMessaggio = messaggio;
          }
        });
        if (ultimoMessaggio.type == "event") {
          const { data: titoloData, error: titoloError } = await supabase
            .from("eventi")
            .select("titolo")
            .eq("event_id", ultimoMessaggio.event_id)
            .single();
          ultimoMessaggio = {
            ...ultimoMessaggio,
            content: titoloData.titolo,
          };
          if (titoloError) throw titoloError;
        }
        const { gruppi } = groupInfo;
        const formattedData = {
          ...gruppi,
          ultimoMessaggio,
        };
        const { data: groupEvents, error: groupsError } = await supabase
          .from("eventi_gruppo")
          .select("*")
          .eq("group_id", groupId);

        ("groupEvnts", groupEvents, { groupId, user_id: user.id });
        if (groupsError) {
          ("groupsError", groupsError);
          throw groupsError;
        }
        const groupEventsIds = groupEvents.map((e) => e.event_id);
        groupEventsIds;
        const { data: eventsDetails, error: eventsError } = await supabase
          .from("risposte_eventi")
          .select(
            `
    status,
    created_at,
    is_creator,
    utente:utenti(*),
    eventi!inner(
      *,
      scadenza:data_scadenza,
      luogo:luoghi(*),
      utente:utenti(nome, user_id,profile_pic),
      gruppo:gruppi(*),
      cover_img,
      created_by,
      event_imgs(img_url)
    )
  `,
          )
          .in("event_id", groupEventsIds);
        if (eventsError) {
          ("c'è un eventsErro", eventsError);
          throw eventsError;
        }
        const reducedEventsData = eventsDetails.reduce((acc, response) => {
          // 1. L'evento è dentro response.eventi
          const event = response.eventi;
          const eventId = event.event_id;

          // 2. Se è la prima volta che vediamo questo evento, creiamo l'oggetto base
          if (!acc[eventId]) {
            acc[eventId] = {
              ...event,
              risposte_evento: [], // Inizializziamo l'array delle risposte
              status: response.status, // Lo status dell'utente attuale
            };
          }

          // 3. Aggiungiamo la risposta corrente all'array dell'evento
          acc[eventId].risposte_evento.push({
            utenti: response.utente,
            user_id: response.utente.user_id,
            status: response.status,
            created_at: response.created_at,
            is_creator: response.is_creator,
          });

          return acc;
        }, {});
        // const reducedEventsData = eventsDetails.reduce((acc, response) => {
        //   // 1. L'evento è dentro response.eventi
        //   const event = response.eventi;
        //   const eventId = event.event_id;

        //   // 2. Se è la prima volta che vediamo questo evento, creiamo l'oggetto base
        //   if (!acc[eventId]) {
        //     acc[eventId] = {
        //       ...event,
        //       risposte_evento: [], // Inizializziamo l'array delle risposte
        //       user_status: response.status, // Lo status dell'utente attuale
        //     };
        //   }

        //   // 3. Aggiungiamo la risposta corrente all'array dell'evento
        //   acc[eventId].risposte_evento.push({
        //     utenti: response.utente,
        //     user_id: response.utente.user_id,
        //     status: response.status,
        //     created_at: response.created_at,
        //     is_creator: response.is_creator,
        //   });

        //   return acc;
        // }, {});
        ("le final responses", finalEventsResponses);
        const finalEventsArray = Object.values(reducedEventsData);
        ("i groupInfo", groupInfo, formattedData);
        allParticipants.forEach((p) => {
          io.to(p.user_id).emit("added_participants", {
            group_id: groupId,
            newParticipants: allParticipants,
            groupInfo: formattedData, // <--- FONDAMENTALE PER IL NUOVO UTENTE
            eventsDetails: finalEventsArray,
            eventsResponses: finalEventsResponses,
            // eventi:
            // finalEventResponses: finaleventResponses,
          });
        });
      } catch (err) {
        console.error("Errore add_participants:", err);
      }
    },
  );
  socket.on("edit_field", async (groupId, field, fieldValue) => {
    ("ricevuto add participants server.js");
    // manca creatore gruppo in participants
    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*,user_id:partecipante_id")
        .eq("group_id", groupId);
      if (participantsError) throw participantsError;

      participants.forEach((p) => {
        io.to(p.partecipante_id).emit("edited_field", {
          group_id: groupId,
          field,
          fieldValue,
        });
      });
    } catch (err) {
      console.error("Errore in GroupHandlers:", err);
    }
  });
  socket.on("admin_participant", async (groupId, participant) => {
    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*,user_id:partecipante_id")
        .eq("group_id", groupId);
      if (participantsError) throw participantsError;

      participants.forEach((p) => {
        io.to(p.user_id).emit("admined_participant", {
          group_id: groupId,
          participant,
          participants,
        });
      });
    } catch (err) {
      console.error("Errore in GroupHandlers:", err);
    }
  });
  socket.on("add_new_group", async (groupId, groupData, imgUrl, creatorId) => {
    try {
      ("io sto qua", { groupId, groupData, imgUrl, creatorId });
      const [
        { data: sender, error: userError },
        { data: participants, error: participantsError },
      ] = await Promise.all([
        supabase.from("utenti").select("*").eq("user_id", creatorId).single(),

        supabase
          .from("partecipanti_gruppo")
          .select("*,user_id:partecipante_id,utenti(*)")
          .eq("group_id", groupId),
      ]);
      if (userError) throw userError;
      if (participantsError) throw participantsError;
      const insertNotification = participants.map((p) => {
        return {
          type: "new_group",
          group_id: groupId,
          is_read: false,
          sender_id: creatorId,
          user_id: p.user_id,
        };
      });
      ("aggiungo notifiche", insertNotification);

      const { error: notificationError } = await supabase
        .from("notifiche")
        .insert(insertNotification);
      if (notificationError) throw notificationError;

      const participantsWithRoles = participants.map((p) => {
        return p.user_id == creatorId
          ? { ...p, role: "admin" }
          : { ...p, role: "member" };
      });
      participants.forEach((p) => {
        io.to(p.user_id).emit(
          "added_new_group",
          groupId,
          groupData,
          participantsWithRoles,
          imgUrl,
          sender,
        );
        io.to(p.user_id).emit("new_notification", {
          type: "new_group",
          sender: sender,
          receiver: p,
          group_id: groupId,
          gruppo: groupData.groupData,
          user_id: p.user_id,
          created_at: new Date(),
          is_read: false,
        });
      });
    } catch (err) {
      console.error("Errore add_new_group:", err);
    }
  });
  socket.on("leave_group", async (groupId, userId) => {
    ("ricevuto leave group server.js", groupId, userId);
    // manca creatore gruppo in participants
    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*,user_id:partecipante_id")
        .eq("group_id", groupId);
      if (participantsError) throw participantsError;
      ("i partecipanti", participants);
      participants.forEach((p) => {
        ("adesso invio left group no user");
        io.to(p.user_id).emit("left_group", groupId, userId);
      });
      if (
        participants.length == 0 ||
        participants.some((p) => p.user_id !== userId)
      ) {
        ("adesso invio left group");
        io.to(userId).emit("left_group", groupId, userId);
      }
    } catch (err) {
      console.error("Errore in GroupHandlers:", err);
    }
  });
  socket.on("remove_participant", async (groupId, participant) => {
    ("ricevuto remove participant server.js");
    // manca creatore gruppo in participants

    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*,user_id:partecipante_id")
        .eq("group_id", groupId);
      if (participantsError) throw participantsError;
      const { data: groupEvents, error: groupEventsError } = await supabase
        .from("eventi_gruppo")
        .select("event_id")
        .eq("group_id", groupId);
      if (groupEventsError) throw groupEventsError;

      const groupEventsIds = groupEvents.map((e) => e.event_id);
      participants.forEach((p) => {
        io.to(p.user_id).emit("removed_participant", {
          group_id: groupId,
          participant,
          groupEventsIds,
        });
      });
      if (participants.some((p) => p.user_id !== participant.user_id)) {
        io.to(participant.user_id).emit("removed_participant", {
          group_id: groupId,
          participant,
        });
      }
    } catch (err) {
      console.error("Errore in GroupHandlers:", err);
    }
  });
};
module.exports = groupHandlers;
