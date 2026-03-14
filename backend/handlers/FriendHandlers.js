const supabase = require("../config/db");
const friendHandlers = (io, socket) => {
  socket.on("send_request", (data) => {
    io.to(data.receiver_id).emit("sent_request", data);
  });
  socket.on("delete_friend", (data) => {
    io.to([data.user_id, data.friend_id]).emit(
      "deleted_friend",
      data.friend_id,
    );
  });
  socket.on("accept_request", (data) => {
    io.to([data.receiver_id]).emit("accepted_request", data.sender_id);
  });
  socket.on("reject_request", (data) => {
    io.to([data.receiver_id]).emit("rejected_request", data.sender_id);
  });
};
module.exports = friendHandlers;
