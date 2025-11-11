const Group = require('../models/groupModel');

const getAllGroups = async (req, res) => {
	try {
		const { data, error } = await Group.getAll(req); // Chiama il modello per ottenere gli eventi
		if (error) {
			console.log(error);
		}
		const formattedData = data.map((row) => {
			let ultimoMessaggio = null;
			row.gruppi.messaggi.forEach((messaggio) => {
				console.log(messaggio);
				if (!ultimoMessaggio || messaggio.sent_at > ultimoMessaggio.sent_at) {
					ultimoMessaggio = messaggio;
				}
			});

			const { gruppi, ...groupData } = row;
			return {
				...groupData,
				...gruppi,
				ultimoMessaggio: ultimoMessaggio,
			};
		});
		console.log(formattedData);
		res.json(formattedData); // Restituisce i dati come risposta
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getSpecificGroup = async (req, res) => {
	try {
		const { data, error } = await Group.getGroup(req);
		if (error) {
			console.log(error);
		}
		console.log('data', data);
		const formattedData = data.map((row) => {
			const { gruppi, utenti, ...groupData } = row;
			return {
				...groupData,
				...gruppi,
				partecipanti: utenti,
			};
		});
		console.log(formattedData);
		res.json(formattedData);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getGroupEvents = async (req, res) => {
	try {
		const { data, error } = await Group.getEvents(req);
		if (error) {
			console.log(error);
		}
		console.log(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getSpecificGroupEvent = async (req, res) => {
	try {
		const { data, error } = await Group.getEvent(req);
		if (error) {
			console.log(error);
		}
		console.log(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const addNewGroup = async (req, res) => {
	try {
		const { data, error } = await Group.addNew(req);
		if (error) {
			console.log(error);
		}
		console.log(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const modifyGroup = async (req, res) => {
	try {
		const { data, error } = await Group.modify(req); // Chiama il modello per ottenere gli eventi
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
module.exports = {
	getAllGroups,
	getSpecificGroup,
	getGroupEvents,
	getSpecificGroupEvent,
	addNewGroup,
	modifyGroup,
};
