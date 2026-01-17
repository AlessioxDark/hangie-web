const supabase = require("../config/db");

const groupHandlers = (io, socket) => {
  socket.on("join_room", (room_id) => {
    console.log("room_joinata");
    socket.join(room_id);
  });
  socket.on(
    "add_participants",
    async (groupId, newParticipants, allParticipants) => {
      console.log("ricevuto add participants server.js");
      // manca creatore gruppo in participants

      const addedParticipants = newParticipants.filter((p) => {
        return !allParticipants.some(
          (original) => original.user_id == p.user_id
        );
      });
      const newAddedParticipants = addedParticipants.map((np) => {
        return {
          ...np,
          utenti: {
            nome: np.nome,
            handle: np.handle,
            user_id: np.user_id,
          },
        };
      });
      console.log(newParticipants, allParticipants, addedParticipants);

      console.log("nuovi aggiunti con utenti", newAddedParticipants);
      allParticipants.forEach((p) => {
        io.to(p.partecipante_id).emit("added_participants", {
          group_id: groupId,
          addedParticipants: newAddedParticipants,
        });
      });
    }
  );
  socket.on("edit_field", async (groupId, field, fieldValue, participants) => {
    console.log("ricevuto add participants server.js");
    // manca creatore gruppo in participants

    participants.forEach((p) => {
      io.to(p.partecipante_id).emit("edited_field", {
        group_id: groupId,
        field,
        fieldValue,
      });
    });
  });
  socket.on("admin_participant", async (groupId, participant, participants) => {
    console.log("ricevuto admin participant server.js");
    // manca creatore gruppo in participants
    console.log(participant, participants);
    participants.forEach((p) => {
      io.to(p.user_id || p.partecipante_id).emit("admined_participant", {
        group_id: groupId,
        participant,
        participants,
      });
    });
  });
  socket.on(
    "add_new_group",
    async (groupId, groupData, participants, imgUrl, creatorId) => {
      console.log("ricevuto add new group server.js");
      // manca creatore gruppo in participants
      const { data: sender, error: userError } = await supabase
        .from("utenti")
        .select("*")
        .eq("user_id", creatorId);
      const insertNotification = participants.map((p) => {
        return {
          type: "new_group",
          group_id: groupId,
          is_read: false,
          sender_id: creatorId,
          user_id: p.user_id,
        };
      });
      const { data: notificationData, error: notificationError } =
        await supabase.from("notifiche").insert(insertNotification);
      const newParticipants = [
        ...participants,
        {
          user_id: creatorId,
          handle: sender[0].handle,
          nome: sender[0].nome,
        },
      ];
      const participantsWithRoles = newParticipants.map((p) => {
        return p.user_id == creatorId
          ? { ...p, role: "admin" }
          : { ...p, role: "member" };
      });
      newParticipants.forEach((p) => {
        console.log("invio added new group a", p.user_id);
        io.to(p.user_id).emit(
          "added_new_group",
          groupId,
          groupData,
          participantsWithRoles,
          imgUrl,
          sender[0]
        );
      });

      participants.forEach((p) => {
        io.to(p.user_id).emit("new_notification", {
          type: "new_group",
          sender: sender[0],
          receiver: p,
          group_id: groupId,
          // messaggio: { content: message },
          gruppo: groupData.groupData,
          user_id: p.user_id, // Il client filtrerà se è per lui
          created_at: new Date(),
          is_read: false,
        });
      });
    }
  );
  socket.on("leave_group", async (groupId, userId, participants) => {
    console.log("ricevuto leave group server.js");
    // manca creatore gruppo in participants

    io.to(userId).emit("left_group", groupId, userId);
    console.log("imviando left group a", participants);
    participants.forEach((p) => {
      io.to(p.user_id).emit("left_group", groupId, userId);
    });
  });
  socket.on(
    "remove_participant",
    async (groupId, participant, allParticipants) => {
      console.log("ricevuto remove participant server.js");
      // manca creatore gruppo in participants
      allParticipants.forEach((p) => {
        io.to(p.partecipante_id || p.user_id).emit("removed_participant", {
          group_id: groupId,
          participant,
        });
      });
    }
  );
};
module.exports = groupHandlers;
