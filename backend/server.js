require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http"); // Importiamo il modulo HTTP di Node

const { Server } = require("socket.io");
const cors = require("cors");
const supabase = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const placesRoutes = require("./routes/placesRoutes");
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permette richieste da qualsiasi origine (per lo sviluppo).
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Permette tutti i metodi che usi. 'OPTIONS' è fondamentale.
    allowedHeaders: ["Content-Type", "Authorization", "body"], // Specifica gli header che sono permessi.
  },
});

io.on("connection", (socket) => {
  console.log("nuovo utente collegato al server", socket.id);

  socket.on(
    "send_message",
    async (message, room, partecipanti, token, callback) => {
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
      const rowStatus = partecipanti.map((partecipante) => {
        return { message_id: messageId, user_id: partecipante.partecipante_id };
      });
      console.log("questi sono gli status delle row", rowStatus);
      // 1. Devi mettere AWAIT qui
      const { data: messageStatus, error: errorStatus } = await supabase
        .from("messaggi_status")
        .insert(rowStatus)
        .select(); // Il select serve a popolare messageStatus dopo l'inserimento

      if (callback) {
        callback({ message_id: messageId });
      }

      const { data: userInfo, error: userError } = await supabase
        .from("utenti")
        .select("*")
        .eq("user_id", user.id);
      const sender = userInfo[0];
      console.log("sender", sender);
      socket.to(room).emit("receive_message", {
        message: message,
        message_id: messageId,
        group_id: room, // AGGIUNGI QUESTO: fondamentale per il Context
        sender_id: user.id, // AGGIUNGI QUESTO: utile per la UI
        sender: sender,
      });
    }
  );
  socket.on("message_arrived", async (message_id, user_id, room) => {
    // console.log(
    //   `Utente ${socket.id} ha inviato un messaggio: ${message} con room ${room}`
    // );
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
      io.to(room).emit("message_arrived", { message_id });
    }
  });
  socket.on("message_read", async (message_id, user_id, room) => {
    // console.log(
    //   `Utente ${socket.id} ha inviato un messaggio: ${message} con room ${room}`
    // );
    console.log("avviato message arrived");
    const { data: messageStatus, error: errorStatus } = await supabase
      .from("messaggi_status")
      .update({ status: "read" })
      .eq("user_id", user_id)
      .eq("message_id", message_id);

    const { count, error: countError } = await supabase
      .from("messaggi_status")
      .select("*", { count: "exact", head: true })
      .eq("message_id", message_id)
      .eq("status", "delivered");

    console.log(count, countError);

    if (count == 0) {
      io.to(room).emit("message_read", { message_id });
    }
  });
  socket.on("send_event", async (eventId, room, token) => {
    console.log(
      `Utente ${socket.id} ha inviato un messaggio: ${eventId} con room ${room}`
    );
  });

  socket.on("join_room", (room_id) => {
    console.log("room_joinata");
    socket.join(room_id);
  });
});

app.use(
  cors({
    origin: "*", // Permette richieste da qualsiasi origine (per lo sviluppo).
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Permette tutti i metodi che usi. 'OPTIONS' è fondamentale.
    allowedHeaders: ["Content-Type", "Authorization", "body"], // Specifica gli header che sono permessi.
  })
);
app.use(express.json());
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/groups", groupRoutes); // Assuming groupRoutes is defined similarly
app.get("/", (req, res) => {
  res.send("<h1>tutto funziona</h1>");
});
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);
// app.listen(port, () => {
// 	console.log(`Server is running on port ${port}`);
// });
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
