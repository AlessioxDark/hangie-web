const eventHandlers = require("../../handlers/EventHandlers");
const friendHandlers = require("../../handlers/FriendHandlers");
const groupHandlers = require("../../handlers/GroupHandlers");
const messageHandlers = require("../../handlers/MessageHandlers");
const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("identify_user", (userId) => {
      socket.join(userId);
    });
    messageHandlers(io, socket);
    groupHandlers(io, socket);
    friendHandlers(io, socket);
    eventHandlers(io, socket);
  });
};
module.exports = socketHandler;
