require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http'); // Importiamo il modulo HTTP di Node

const { Server } = require('socket.io');
const cors = require('cors');
require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const placesRoutes = require('./routes/placesRoutes');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000', // Sostituisci con l'URL del tuo frontend React
		methods: ['GET', 'POST'],
	},
});

// --------------------------------------
// --- GESTIONE CONNESSIONI WEBSOCKET ---
// --------------------------------------
io.on('connection', (socket) => {
	console.log(`Un utente si è connesso: ${socket.id}`);

	// --- 1. JOIN CHAT/GROUP ---
	socket.on('join_group', (groupId) => {
		// Mette il socket nella "stanza" (room) specifica del gruppo
		socket.join(groupId);
		console.log(`Utente ${socket.id} è entrato nel gruppo: ${groupId}`);
	});

	// --- 2. RICEZIONE NUOVO MESSAGGIO ---
	socket.on('send_message', (messageData) => {
		// Assicurati che messageData contenga: { groupId, senderId, text, timestamp, ... }

		// A. Salva il messaggio nel database (NON IN QUESTO ESEMPIO, ma è fondamentale!)
		// saveMessageToDB(messageData);

		// B. Invia il messaggio a TUTTI gli altri membri della stanza (tranne il mittente)
		socket.to(messageData.groupId).emit('receive_message', messageData);

		// C. (Opzionale) Invia conferma al mittente
		// socket.emit('message_sent_success', { messageId: messageData.id });

		console.log(
			`Messaggio inviato nel gruppo ${messageData.groupId} da ${messageData.senderId}`
		);
	});

	// --- 3. DISCONNESSIONE ---
	socket.on('disconnect', () => {
		console.log(`Un utente si è disconnesso: ${socket.id}`);
	});
});

app.use(
	cors({
		origin: '*', // Permette richieste da qualsiasi origine (per lo sviluppo).
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permette tutti i metodi che usi. 'OPTIONS' è fondamentale.
		allowedHeaders: ['Content-Type', 'Authorization', 'body'], // Specifica gli header che sono permessi.
	})
);
app.use(express.json());
app.use('/api/events', eventRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/groups', groupRoutes); // Assuming groupRoutes is defined similarly
app.get('/', (req, res) => {
	res.send('<h1>tutto funziona</h1>');
});
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
// app.listen(port, () => {
// 	console.log(`Server is running on port ${port}`);
// });
server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
