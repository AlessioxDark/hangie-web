const supabase = require("../config/db");

const groupHandlers = (io, socket) => {
  socket.on("join_room", (room_id) => {
    console.log("room_joinata");
    socket.join(room_id);
  });
  socket.on("add_participants", async (groupId, token) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      const { data: allParticipants, error: participantsError } = await supabase
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
      console.log("i dati del gruppo", groupInfo);
      let ultimoMessaggio = null;
      groupInfo?.gruppi.messaggi.forEach((messaggio) => {
        if (!ultimoMessaggio || messaggio.sent_at > ultimoMessaggio.sent_at) {
          ultimoMessaggio = messaggio;
        }
      });
      const { gruppi } = groupInfo;
      const formattedData = {
        ...gruppi,
        ultimoMessaggio,
      };

      allParticipants.forEach((p) => {
        io.to(p.user_id).emit("added_participants", {
          group_id: groupId,
          newParticipants: allParticipants,
          groupInfo: formattedData, // <--- FONDAMENTALE PER IL NUOVO UTENTE
        });
      });
    } catch (err) {
      console.log("c'è un err", err);
    }
  });
  socket.on("edit_field", async (groupId, field, fieldValue) => {
    console.log("ricevuto add participants server.js");
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
      console.log("c'è un err", err);
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
      console.log("c'è un err", err);
    }
  });
  socket.on("add_new_group", async (groupId, groupData, imgUrl, creatorId) => {
    try {
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
      console.log("c'è err", err);
    }
  });
  socket.on("leave_group", async (groupId, userId) => {
    console.log("ricevuto leave group server.js");
    // manca creatore gruppo in participants
    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*,user_id:partecipante_id")
        .eq("group_id", groupId);
      if (participantsError) throw participantsError;
      participants.forEach((p) => {
        io.to(p.user_id).emit("left_group", groupId, userId);
      });
      if (participants.some((p) => p.user_id !== userId)) {
        io.to(userId).emit("left_group", {
          groupId,
          userId,
        });
      }
    } catch (err) {
      console.log("c'è un err", err);
    }
  });
  socket.on("remove_participant", async (groupId, participant) => {
    console.log("ricevuto remove participant server.js");
    // manca creatore gruppo in participants

    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*,user_id:partecipante_id")
        .eq("group_id", groupId);
      participants.forEach((p) => {
        io.to(p.user_id).emit("removed_participant", {
          group_id: groupId,
          participant,
        });
      });
      if (participants.some((p) => p.user_id !== participant.user_id)) {
        io.to(participant.user_id).emit("removed_participant", {
          group_id: groupId,
          participant,
        });
      }
    } catch (err) {
      console.log("c'è un err", err);
    }
  });
};
module.exports = groupHandlers;
