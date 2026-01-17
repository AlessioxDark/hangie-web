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
  });
};
module.exports = socketHandler;
