const { io } = require('socket.io-client');

// L'URL del tuo server Socket.IO
const SOCKET_SERVER_URL = 'http://localhost:3000';
// L'ID del gruppo che useremo per il test
const TEST_GROUP_ID = 'chat-room-test';
// L'ID utente che useremo per simulare l'invio
const TEST_SENDER_ID = 'tester-node-client';

console.log(`Connessione al server: ${SOCKET_SERVER_URL}...`);

// 1. Inizializza la connessione
const socket = io(SOCKET_SERVER_URL, {
	// Configurazione opzionale se la tua app ne avesse bisogno
});

// Listener per la connessione riuscita
socket.on('connect', () => {
	console.log(`[CLIENT] Connesso con ID socket: ${socket.id}`);

	// --- AZIONE CHIAVE: join_group ---
	console.log(`[CLIENT] Eseguo 'join_group' per il gruppo: ${TEST_GROUP_ID}`);
	socket.emit('join_group', TEST_GROUP_ID);

	// 2. Simulazione invio messaggio dopo 3 secondi
	setTimeout(() => {
		const messagePayload = {
			groupId: TEST_GROUP_ID,
			senderId: TEST_SENDER_ID,
			text: 'Questo è un messaggio di prova inviato da un client Node.js!',
			timestamp: new Date().toISOString(),
			id: 'mock-msg-' + Date.now(),
		};

		console.log(
			`[CLIENT] Eseguo 'send_message' nel gruppo ${TEST_GROUP_ID}...`
		);
		socket.emit('send_message', messagePayload);

		// Chiudi il client dopo l'invio per terminare lo script
		setTimeout(() => {
			socket.disconnect();
			console.log('[CLIENT] Disconnesso.');
		}, 1000);
	}, 3000);
});

// Listener per la ricezione di messaggi (se c'è un altro client che risponde)
socket.on('receive_message', (message) => {
	// Nota: Questo client non riceverà il proprio messaggio perché nel tuo server index.js
	// usi socket.to().emit, che esclude il mittente.
	console.log(`[CLIENT] MESSAGGIO RICEVUTO in tempo reale: ${message.text}`);
});

socket.on('disconnect', () => {
	console.log('[CLIENT] Disconnessione dal server completata.');
});

socket.on('connect_error', (err) => {
	console.error(`[CLIENT] Errore di connessione a Socket.IO: ${err.message}`);
});
