const supabase = require('../config/db');
const getAll = async (req) => {
	const token = req.headers.authorization.split(' ')[1];
	const {
		data: { user },
		error: tokenError,
	} = await supabase.auth.getUser(token);

	const { data, error } = await supabase
		.from('partecipanti_gruppo')
		.select('gruppi(*,messaggi(*),partecipanti_gruppo(*,utenti(*)))')
		.eq('partecipante_id', user.identities[0].user_id);
	if (error) {
		console.log(error);
	}
	console.log(data);

	return { data, error };
};
const getGroup = async (req) => {
	const token = req.headers.authorization.split(' ')[1];
	const {
		data: { user },
		error: tokenError,
	} = await supabase.auth.getUser(token);
	if (tokenError || !user) {
		return {
			data: null,
			error: tokenError || { message: 'Utente non autenticato.' },
		};
	}
	const { group_id } = req.params;
	const user_id = user.id;

	// FASE 1: Verifica l'accesso e recupera i dati del gruppo (senza messaggi)
	// Seleziona la riga del partecipante per verificare l'accesso.
	const { data: participantRow, error: accessError } = await supabase
		.from('partecipanti_gruppo')
		.select(`gruppi:group_id(*), utenti:partecipante_id(*)`) // Seleziona il gruppo e i dati del partecipante che accede
		.eq('group_id', group_id)
		.eq('partecipante_id', user_id)
		.single();

	if (accessError || !participantRow) {
		return {
			data: null,
			error: accessError || { message: 'Gruppo non trovato o accesso negato.' },
		};
	}

	// Estraiamo i dati del gruppo principale
	const groupDetails = participantRow.gruppi;

	// FASE 2: Query separata per i messaggi (CORREZIONE APPLICATA)
	const { data: messagesData, error: messagesError } = await supabase
		.from('messaggi')
		.select('*,utenti(*)')
		.eq('group_id', group_id)
		.order('sent_at', { ascending: true }); // Ordina cronologicamente

	if (messagesError) {
		console.error('Errore nel recupero dei messaggi:', messagesError);
		// Continua con messaggi vuoti in caso di errore
	}
	const messages = messagesData || [];

	// 3. IDENTIFICARE GLI EVENTI NEI MESSAGGI
	const eventMessages = messages.filter(
		(m) => m.type === 'event' && m.event_id
	);
	const eventIds = eventMessages.map((m) => m.event_id);

	// Fetch dei dettagli di tutti gli eventi in una sola query
	const { data: eventsDetails, error: eventsError } = await supabase
		.from('eventi')
		.select(
			`*,
            utenti(creatore:nome, user_id),
            luoghi(nome, citta, indirizzo),
            risposte_eventi(*, utenti(profile_pic, user_id, nome))`
		)
		.in('event_id', eventIds);

	if (eventsError) {
		console.error('Errore nel recupero dei dettagli eventi:', eventsError);
		// Continuiamo, ma l'errore è loggato
	}

	// Mappa degli eventi per ID
	const eventMap = (eventsDetails || []).reduce((acc, event) => {
		acc[event.event_id] = event;
		return acc;
	}, {});

	// Fetch Asincrono delle Immagini (in parallelo)
	const imagesPromises = (eventsDetails || []).map(async (event) => {
		const imagePublicUrls = [];
		for (let i = 1; i <= 4; i++) {
			const path = `${event.event_id}/${i}.jpg`;
			// Non gestisco l'errore del getPublicUrl perché è implicito che alcune immagini potrebbero non esistere
			const {
				data: { publicUrl },
			} = supabase.storage.from('eventi').getPublicUrl(path);
			imagePublicUrls.push(publicUrl);
		}
		return { event_id: event.event_id, images: imagePublicUrls };
	});

	const imagesResults = await Promise.all(imagesPromises);
	const imageMap = imagesResults.reduce((acc, result) => {
		acc[result.event_id] = result.images;
		return acc;
	}, {});

	// 6. UNIFICAZIONE DEI DATI E RITORNO
	// Arricchiamo i messaggi con i dettagli degli eventi e le immagini
	const finalMessages = messages.map((message) => {
		if (message.type === 'event' && message.event_id) {
			const eventDetails = eventMap[message.event_id];

			return {
				...message,
				event_details: {
					...eventDetails,
					event_imgs: imageMap[message.event_id] || [],
				},
			};
		}
		return message;
	});

	// CORREZIONE: Restituiamo un SINGOLO oggetto contenente tutti i dati del gruppo
	console.log('i dati finali sono', {
		data: {
			// Estraiamo i dati effettivi del gruppo dall'oggetto participantData
			...groupDetails,
			messaggi: finalMessages,
			partecipanti_gruppo: participantRow.utenti, // Assumo che 'utenti' qui sia l'elenco dei partecipanti
		},
		error: null,
	});
	return {
		data: {
			// Estraiamo i dati effettivi del gruppo dall'oggetto participantData
			...groupDetails,
			messaggi: finalMessages,
			partecipanti_gruppo: participantRow.utenti, // Assumo che 'utenti' qui sia l'elenco dei partecipanti
		},
		error: null,
	};
};
const getEvents = async (req) => {
	const { group_id } = req.params;

	const { data, error } = await supabase
		.from('eventi_gruppo')
		// .select(
		// 	'*,risposte_eventi(event_id,status,eventi(event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,data_scadenza,cover_img,gruppi(*,partecipanti_gruppo(*)))'
		// )
		.select(
			'*, eventi(event_id,costo,data,titolo,utenti (user_id, nome, profile_pic),luoghi(*),risposte_eventi(*),descrizione, data_scadenza,cover_img,event_imgs(*),gruppi(*, partecipanti_gruppo(*)))'
		)
		// .select(
		// 	'*,eventi(*,event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,data_scadenza,cover_img,gruppi(*,partecipanti_gruppo(*))'
		// )
		.eq('group_id', group_id);

	console.log('trovando eventi_gruppo');
	console.log(data);
	return { data, error };
};
const getEvent = async (req) => {
	const { event_id } = req.params;

	const { data, error } = await supabase
		.from('eventi')
		.select('*')
		.eq('event_id', event_id);
	console.log(data);
	return { data, error };
};
const newGroup = async (req) => {
	const body = req.body;
	const { data, error } = await supabase.from('gruppi').insert([{ ...body }]);
	return { data, error };
};
const modify = async (req) => {
	const { group_id } = req.params;
	const body = req.body;
	const { data, error } = await supabase
		.from('gruppi')
		.update([{ ...body }])
		.eq('group_id', group_id);
	return { data, error };
};
module.exports = { getAll, getGroup, getEvent, newGroup, modify, getEvents };
