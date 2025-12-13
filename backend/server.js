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

  socket.on("send_message", async (message, room, token) => {
    console.log(
      `Utente ${socket.id} ha inviato un messaggio: ${message} con room ${room}`
    );

    const {
      data: { user },
      error: tokenError,
    } = await supabase.auth.getUser(token);
    console.log(user);
    const { data, error } = await supabase
      .from("messaggi")
      .insert([{ content: message, user_id: user.id, group_id: room }]);

    socket.to(room).emit("receive_message", message);
  });
  socket.on("send_event", async (eventId, room, token) => {
    console.log(
      `Utente ${socket.id} ha inviato un messaggio: ${eventId} con room ${room}`
    );

    // const {
    // 	data: { user },
    // 	error: tokenError,
    // } = await supabase.auth.getUser(token);
    // console.log(user);

    // const { data: messageData, error: errorMessage } = await supabase
    // 	.from('messaggi')
    // 	.insert([
    // 		{
    // 			type: 'event',
    // 			event_id: eventId,
    // 			user_id: user.id,
    // 			group_id: room,
    // 		},
    // 	])
    // 	.select('*,eventi(*)');

    // if (errorMessage) {
    // 	console.error("Errore nell'inserimento:", errorMessage);
    // }
    // socket.to(room).emit('receive_event', messageData);
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
