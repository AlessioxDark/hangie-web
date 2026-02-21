const groupHandlers = require("../../handlers/GroupHandlers");
const messageHandlers = require("../../handlers/MessageHandlers");
const supabase = require("../db"); // Assicurati che il percorso sia corretto
const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("nuovo utente collegato al server", socket.id);
    socket.on("identify_user", (userId) => {
      socket.join(userId);
      console.log(`Utente ${userId} connesso alla sua stanza privata`);
    });
    messageHandlers(io, socket);
    groupHandlers(io, socket);

    socket.on("send_request", (data) => {
      io.to(data.receiver_id).emit("sent_request", data);
    });
    socket.on("delete_friend", (data) => {
      io.to(data.user_id).emit("deleted_friend", data.friend_id);
    });
  });
};
module.exports = socketHandler;
