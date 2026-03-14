const supabase = require("../config/db");
const eventHandlers = (io, socket) => {
  socket.on("delete_event", async (eventId, groupId) => {
    try {
      const { data: participants, error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .select("*")
        .eq("group_id", groupId);
      if (participantsError) throw participantsError;
      if (!participants) throw { message: "Partecipanti non trovati" };

      participants.forEach((p) => {
        io.to(p.partecipante_id).emit("deleted_event", {
          event_id: eventId,
          group_id: groupId,
        });
      });
    } catch (err) {
      socket.emit("operation_failed", {
        type: "delete_event",
        message: "Qualcosa è andato storto, riprova tra poco.",
      });
    }
  });

  socket.on(
    "vote_event",
    async (eventId, groupId, status, userId, prevStatus) => {
      try {
        const { data: pfpData, error: pfpError } = await supabase
          .from("utenti")
          .select("profile_pic")
          .eq("user_id", userId)
          .single();
        if (pfpError) throw pfpError;

        const { data: participants, error: participantsError } = await supabase
          .from("partecipanti_gruppo")
          .select("*")
          .eq("group_id", groupId);
        if (participantsError) throw participantsError;
        if (!participants) throw { message: "Partecipanti non trovati" };

        participants.forEach((p) => {
          io.to(p.partecipante_id).emit("voted_event", {
            event_id: eventId,
            group_id: groupId,
            status,
            sender_id: userId,
            prevStatus,
            profile_pic: pfpData?.profile_pic || null,
          });
        });
      } catch (err) {
        socket.emit("operation_failed", {
          type: "vote_event",
          message: "Qualcosa è andato storto, riprova tra poco.",
        });
      }
    },
  );
};
module.exports = eventHandlers;
