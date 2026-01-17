const supabase = require("../config/db");

const messageHandlers = (io, socket) => {
  socket.on(
    "send_message",
    async (message, room, partecipanti, token, groupData) => {
      console.log(
        `Utente ${socket.id} ha inviato un messaggio: ${message} con room ${room}`
      );
      console.log(partecipanti);
      console.log("eccoli oh", partecipanti);
      const {
        data: { user },
        error: tokenError,
      } = await supabase.auth.getUser(token);
      console.log(user);
      const { data: messageData, error } = await supabase
        .from("messaggi")
        .insert([{ content: message, user_id: user.id, group_id: room }])
        .select("message_id");
      const messageId = messageData[0].message_id;
      const rowStatus = partecipanti
        .filter((p) => p.partecipante_id !== user.id)
        .map((partecipante) => {
          return {
            message_id: messageId,
            user_id: partecipante.partecipante_id,
          };
        });

      const notificationInsert = partecipanti
        .filter((p) => p.partecipante_id !== user.id)
        .map((partecipante) => {
          return {
            type: "new_message",
            sender_id: user.id,
            is_read: false,
            group_id: room,
            user_id: partecipante.partecipante_id,
            message_id: messageId,
          };
        });
      console.log("questi sono gli status delle row", rowStatus);
      // 1. Devi mettere AWAIT qui
      const { data: messageStatus, error: errorStatus } = await supabase
        .from("messaggi_status")
        .insert(rowStatus)
        .select(); // Il select serve a popolare messageStatus dopo l'inserimento
      console.log("da aggiungere a messsaggi_stauts", rowStatus);
      const { data: userInfo, error: userError } = await supabase
        .from("utenti")
        .select("*")
        .eq("user_id", user.id);
      const sender = userInfo[0];
      console.log("sender", sender);

      partecipanti.forEach((p) => {
        io.to(p.partecipante_id).emit("receive_message", {
          message: message,
          message_id: messageId,
          group_id: room, // AGGIUNGI QUESTO: fondamentale per il Context
          sender_id: user.id, // AGGIUNGI QUESTO: utile per la UI
          sender: sender,
        });
      });
      io.to(user.id).emit("receive_message", {
        message: message,
        message_id: messageId,
        group_id: room, // AGGIUNGI QUESTO: fondamentale per il Context
        sender_id: user.id, // AGGIUNGI QUESTO: utile per la UI
        sender: sender,
      });

      const { data: notificationData, error: errorNotification } =
        await supabase.from("notifiche").insert(notificationInsert);
      const receiverData = partecipanti.filter(
        (p) => p.partecipante_id !== user.id
      );
      console.log("invio notifiche a", receiverData);
      receiverData.forEach((receiver) => {
        // Invia alla stanza privata dell'utente (se l'hai creata)
        io.to(receiver.partecipante_id).emit("new_notification", {
          type: "new_message",
          sender: sender,
          receiver: receiver,
          group_id: room,
          messaggio: { content: message },
          gruppo: groupData,
          user_id: receiver.partecipante_id, // Il client filtrerà se è per lui
          created_at: new Date(),
          is_read: false,
        });
      });
    }
  );
  socket.on("message_sent", async (message_id, user_id, room) => {
    // console.log(
    //   `Utente ${socket.id} ha inviato un messaggio: ${message} con room ${room}`
    // );
    console.log("arrivato message_sent a server");
    const { data: partecipantiDB } = await supabase
      .from("partecipanti_gruppo")
      .select("partecipante_id")
      .eq("group_id", room);
    console.log("avviato message arrived");
    const { data: messageStatus, error: errorStatus } = await supabase
      .from("messaggi_status")
      .update({ status: "delivered" })
      .eq("user_id", user_id)
      .eq("message_id", message_id);

    const { count, error: countError } = await supabase
      .from("messaggi_status")
      .select("*", { count: "exact", head: true })
      .eq("message_id", message_id)
      .eq("status", "sent");

    console.log(count, countError);

    if (count == 0) {
      partecipantiDB.forEach((p) => {
        io.to(p.partecipante_id).emit("message_arrived", {
          message_id,
          group_id: room,
        });
      });
    }
  });
  socket.on("message_read", async (message_id, user_id, room) => {
    console.log(`sto leggendo nel servers`);
    const { data: partecipantiDB } = await supabase
      .from("partecipanti_gruppo")
      .select("partecipante_id")
      .eq("group_id", room);
    console.log("avviato message read");
    const { data: messageStatus, error: errorStatus } = await supabase
      .from("messaggi_status")
      .update({ status: "read" })
      .eq("user_id", user_id)
      .eq("message_id", message_id);

    const { data: notificationData, error: errorNotification } = await supabase
      .from("notifiche")
      .update({ is_read: "true" })
      .eq("user_id", user_id)
      .eq("group_id", room)
      .eq("is_read", false)
      .select("*");

    if (notificationData && notificationData.length > 0) {
      console.log(
        `Pulizia di ${notificationData.length} notifiche per l'utente`
      );

      io.to(user_id).emit("clear_notifications_count", {
        group_id: room,
        user_id,
      });
    }
    const { count, error: countError } = await supabase
      .from("messaggi_status")
      .select("*", { count: "exact", head: true })
      .eq("message_id", message_id)
      .neq("status", "read");
    // .or("status", "sent");

    console.log("il conto del read è", count, countError);
    // console.log()
    if (count == 0) {
      console.log("il conto è zero mando read", room);
      partecipantiDB.forEach((p) => {
        console.log("mando read a", p.partecipante_id);
        io.to(p.partecipante_id).emit("give_read", {
          message_id,
          group_id: room,
        });
      });
    }
  });
  socket.on(
    "send_event",
    async (eventId, room, token, eventDetails, messageDetails) => {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*")
        .eq("group_id", room);
      console.log("partecipanti", participants);
      participants.forEach((p) => {
        io.to(p.partecipante_id).emit("sent_event", {
          event: { ...eventDetails, event_id: eventId },
          messageDetails,
        });
      });
      console.log(
        `Utente ${socket.id} ha inviato un messaggio: ${eventId} con room ${room}`
      );
    }
  );
};
module.exports = messageHandlers;
