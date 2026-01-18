const supabase = require("../config/db");

const messageHandlers = (io, socket) => {
  socket.on("send_message", async (message, group_id, token, groupData) => {
    try {
      const {
        data: { user },
        error: tokenError,
      } = await supabase.auth.getUser(token);
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("partecipanti_gruppo")
          .select("*,user_id:partecipante_id")
          .eq("group_id", group_id);
      const { data: messageData, error: messageError } = await supabase
        .from("messaggi")
        .insert([{ content: message, user_id: user.id, group_id }])
        .select("message_id")
        .single();
      const messageId = messageData.message_id;
      const rowStatus = participantsData
        .filter((p) => p.user_id !== user.id)
        .map((partecipante) => {
          return {
            message_id: messageId,
            user_id: partecipante.user_id,
          };
        });

      const notificationInsert = participantsData
        .filter((p) => p.user_id !== user.id)
        .map((partecipante) => {
          return {
            type: "new_message",
            sender_id: user.id,
            is_read: false,
            group_id,
            user_id: partecipante.user_id,
            message_id: messageId,
          };
        });
      // 1. Devi mettere AWAIT qui
      const { data: messageStatus, error: errorStatus } = await supabase
        .from("messaggi_status")
        .insert(rowStatus)
        .select();
      const { data: userInfo, error: userError } = await supabase
        .from("utenti")
        .select("*")
        .eq("user_id", user.id)
        .single();
      const sender = userInfo;

      participantsData.forEach((p) => {
        io.to(p.user_id).emit("receive_message", {
          message: message,
          message_id: messageId,
          group_id,
          sender_id: user.id,
          sender: sender,
        });
        if (p.user_id !== user.id) {
          io.to(user.user_id).emit("new_notification", {
            type: "new_message",
            sender: sender,
            receiver: p,
            group_id,
            messaggio: { content: message },
            gruppo: groupData,
            user_id: p.user_id,
            created_at: new Date(),
            is_read: false,
          });
        }
      });
      const { data: notificationData, error: errorNotification } =
        await supabase.from("notifiche").insert(notificationInsert);
    } catch (err) {
      console.log("c'è un errore", err);
    }
  });
  socket.on("message_sent", async (message_id, user_id, group_id) => {
    console.log("arrivato message_sent a server");
    try {
      const [
        { error: statusError },
        { data: partecipantiDB, error: participantsError },
      ] = await Promise.all([
        supabase
          .from("messaggi_status")
          .update({ status: "delivered" })
          .eq("user_id", user_id)
          .eq("message_id", message_id),
        supabase
          .from("partecipanti_gruppo")
          .select("user_id:partecipante_id")
          .eq("group_id", group_id),
      ]);
      if (statusError) throw statusError;
      if (participantsError) throw participantsError;
      const { count, error: countError } = await supabase
        .from("messaggi_status")
        .select("*", { count: "exact", head: true })
        .eq("message_id", message_id)
        .eq("status", "sent");
      if (countError) throw countError;

      console.log("conto è ", count);
      if (count == 0) {
        partecipantiDB.forEach((p) => {
          io.to(p.user_id).emit("message_arrived", {
            message_id,
            group_id,
          });
        });
      }
    } catch (err) {
      console.log("c'è un err", err);
    }
  });

  socket.on("message_read_bulk", async (message_ids, user_id, group_id) => {
    console.log("arrivato bulk backend", message_ids);
    try {
      const [
        { data: partecipantiDB, error: errorParticipants },
        { data: messageStatus, error: errorStatus },
        { data: notificationData, error: errorNotification },
      ] = await Promise.all([
        supabase
          .from("partecipanti_gruppo")
          .select("user_id:partecipante_id")
          .eq("group_id", group_id),
        supabase
          .from("messaggi_status")
          .update({ status: "read" })
          .eq("user_id", user_id)
          .in("message_id", message_ids),
        supabase
          .from("notifiche")
          .update({ is_read: "true" })
          .eq("user_id", user_id)
          .eq("group_id", group_id)
          .eq("is_read", false)
          .select("*"),
      ]);
      if (errorParticipants) throw errorParticipants;
      if (errorStatus) throw errorStatus;
      if (errorNotification) throw errorNotification;

      if (notificationData && notificationData.length > 0) {
        console.log(
          `Pulizia di ${notificationData.length} notifiche per l'utente`,
        );

        io.to(user_id).emit("clear_notifications_count", {
          group_id,
          user_id,
        });
      }
      const currentMemberIds = partecipantiDB.map((p) => p.user_id);
      const { count, error: countError } = await supabase
        .from("messaggi_status")
        .select("user_id, status, message_id", { count: "exact", head: true })
        .in("message_id", message_ids)
        .in("user_id", currentMemberIds)
        .neq("status", "read");

      if (countError) throw countError;
      if (count == 0) {
        console.log("il conto è zero mando read", group_id);
        partecipantiDB.forEach((p) => {
          io.to(p.user_id).emit("give_read_bulk", {
            message_ids,
            group_id: group_id,
          });
        });
      }
    } catch (err) {
      console.log("c'è err", err);
    }
  });
  socket.on(
    "send_event",
    async (eventId, group_id, eventDetails, messageDetails) => {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*")
        .eq("group_id", group_id);
      participants.forEach((p) => {
        io.to(p.partecipante_id).emit("sent_event", {
          event: { ...eventDetails, event_id: eventId },
          messageDetails,
          group_id,
        });
      });
    },
  );
};
module.exports = messageHandlers;
