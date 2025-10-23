const Event = require('../models/eventModel');

const getAllEvents = async (req, res) => {
	try {
		const { data, error } = await Event.getAll(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			throw Error(error);
		}
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getMyEvents = async (req, res) => {
	try {
		const { finalData, error } = await Event.getEvents();

		if (error) {
			console.error('Errore nel modello Event.getEvents():', error);
			// Se c'è un errore nel modello, rispondi con un errore 500
			return res.status(500).json({ error: error.message });
		}

		// Assicurati che finalData non sia undefined o null
		const responseData = finalData || [];
		console.log('Dati da inviare:', responseData);

		// Invia la risposta JSON con i dati, o un array vuoto se i dati non sono stati trovati
		res.json({ data: responseData });
	} catch (err) {
		// Gestisce qualsiasi altro errore inaspettato
		console.error('Errore inaspettato nel controller:', err.message);
		res.status(500).json({ error: 'Errore interno del server' });
	}
};
const getSpecificEvent = async (req, res) => {
	try {
		const { finalData, error } = await Event.getEvent(req); // Chiama il modello per ottenere gli eventi
		let newData = {
			...finalData,
			risposte: {
				partecipanti: [],
				rifiutatori: [],
				pending: [],
			},
		};
		const newParticipants = finalData.risposte_eventi.forEach((risposta) => {
			if (risposta.status == 'accepted') {
				newData.risposte.partecipanti.push(risposta);
			}
			if (risposta.status == 'rejected') {
				newData.risposte.rifiutatori.push(risposta);
			}
			if (risposta.status == 'pending') {
				newData.risposte.pending.push(risposta);
			}
		});
		if (error) throw error;
		console.log(finalData);
		console.log(newData);
		res.json(newData);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const modifyEvent = async (req, res) => {
	try {
		const { data, error } = await Event.modify(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const addNewEvent = async (req, res) => {
	try {
		const { data, error } = await Event.newEvent(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const modifyResponseEvent = async (req, res) => {
	try {
		const { data, error } = await Event.modifyResponse(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json({ success: true, data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = {
	getAllEvents,
	getMyEvents,
	getSpecificEvent,
	modifyEvent,
	addNewEvent,
	modifyResponseEvent,
};
