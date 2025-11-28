const supabase = require('../config/db');

const getCoords = async ({ indirizzo, citta, cap }) => {
	const queryCompleta = `${indirizzo}, ${cap} ${citta}, Italia`;
	const queryCodificata = encodeURIComponent(queryCompleta);
	const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${queryCodificata}&format=json&limit=1`;
	try {
		const response = await fetch(nominatimUrl);
		if (!response.ok) {
			console.error(
				`Errore nella richiesta API: Stato ${response.status} - ${response.statusText}`
			);
			return null;
		}

		// 5. Parsa il corpo della risposta come JSON
		const data = await response.json();

		// 6. Elabora il risultato
		if (data.length > 0) {
			// L'API restituisce un array, prendiamo il primo risultato
			const primoRisultato = data[0];

			// Le coordinate sono presenti come stringhe, le convertiamo in numeri
			const latitudine = parseFloat(primoRisultato.lat);
			const longitudine = parseFloat(primoRisultato.lon);

			console.log(`Geocoding Riuscito:`);
			console.log(` - Trovato: ${primoRisultato.display_name}`);
			console.log(` - Latitudine (lat): ${latitudine}`);
			console.log(` - Longitudine (lon): ${longitudine}`);

			return { latitudine, longitudine };
		}
	} catch (err) {
		return err;
	}
};

const getAll = async (req) => {
	// Estrae l'offset dal corpo della richiesta.
	const EVENTSINPAGE = 12;

	const { offset } = req.body;
	const token = req.headers.authorization.split(' ')[1];
	const {
		data: { user },
		error: tokenError,
	} = await supabase.auth.getUser(token);
	console.log(user);
	const { data, error } = await supabase
		.from('risposte_eventi')
		.select(
			'event_id,status,eventi(event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,data_scadenza,cover_img,event_imgs(*),gruppi(*,partecipanti_gruppo(*)))'
		)
		.range(offset, offset + EVENTSINPAGE - 1)

		.eq('user_id', user.id);
	// const { data, error } = await supabase
	// 	.from('eventi')
	// 	.select(
	// 		'event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,cover_img,event_imgs(*),gruppi(*,partecipanti_gruppo(*)) as partecipanti,risposte_eventi(status)'
	// 	)
	// 	.range(0, offset + 19);

	// Se la query ha fallito, restituisce immediatamente l'errore.
	if (error) {
		console.error('Errore nella query degli eventi:', error);
		return { data: null, error };
	}

	// const dataWithImages = await Promise.all(
	// 	// Mappa l'array 'data' e per ogni evento, recupera gli URL delle immagini in modo asincrono.
	// 	data.event_imgs.map(async (event_img) => {
	// 		let images = [];
	// 		const imagePromises = [];

	// 		// Per ogni evento, crea 3 promesse per recuperare gli URL delle immagini.
	// 		for (let i = 1; i <= 3; i++) {
	// 			// const path = `${evento.event_id}/${i}.jpg`;
	// 			const path = event_img;

	// 			const {
	// 				data: { publicUrl },
	// 				error: publicUrlError,
	// 			} = supabase.storage
	// 				.from('eventi') // Updated bucket name here
	// 				.getPublicUrl(path);
	// 			if (publicUrlError) {
	// 				console.error(
	// 					`Errore nel recuperare l'immagine ${i}.jpg:`,
	// 					publicUrlError
	// 				);
	// 				return null;
	// 			}
	// 			imagePromises.push(publicUrl);
	// 		}
	// 		console.log(imagePromises);
	// 		// Attende che tutte le promesse per le immagini dell'evento corrente siano risolte.
	// 		images = await Promise.all(imagePromises);

	// 		// Filtra gli eventuali valori null dall'array delle immagini in caso di errori.
	// 		const filteredImages = images.filter((url) => url !== null);

	// 		// Restituisce un nuovo oggetto evento che include anche l'array delle immagini.
	// 		return { ...evento, event_imgs: filteredImages };
	// 	})
	// );

	console.log('Dati con immagini recuperate:', data);

	// Restituisce i dati completi con gli URL delle immagini.
	return { data: data, error: null };
};

const getEvents = async () => {
	// const { user_id } = req.params;
	// const { data, error } = await supabase
	// 	.from('risposte_eventi')
	// 	.select(
	// 		'eventi(event_id,luogo,costo,data,titolo,created_by,event_cover_img)'
	// 	)
	// 	// .eq('risposte_eventi.user_id', user_id)
	// 	.eq('status', 'accepted');
	// return { data, error };
};
const getEvent = async (req) => {
	const { event_id } = req.params;

	const { data, error } = await supabase
		.from('eventi')
		.select(
			`
	     *,
	      utenti(creatore:nome,user_id ),
	 	    luoghi(nome, citta,indirizzo),
	 	     risposte_eventi(*,utenti(profile_pic,user_id,nome))
      
	  `
		)
		.eq('event_id', event_id)
		.single();

	let images = [];
	for (let i = 1; i <= 4; i++) {
		const path = `${event_id}/${i}.jpg`;
		const {
			data: { publicUrl },
			error: publicUrlError,
		} = supabase.storage
			.from('eventi') // Updated bucket name here
			.getPublicUrl(path);
		if (publicUrlError) {
			console.error(
				`Errore nel recuperare l'immagine ${i}.jpg:`,
				publicUrlError
			);
		}

		images.push(publicUrl);
	}
	// risolvere problemi della query per fare prima refact ffronted e poi backend
	// ,
	// 	      utenti(creatore:nome,user_id ),
	// 	      luoghi(nome, citta,indirizzo),
	// 	      partecipanti:risposte_eventi!inner(user_id, status,utenti(profile_pic))(
	// 	          user_id,
	// 	          status,
	// 	          utenti(profile_pic)
	// 	      ),
	// 	      rifiutatori:risposte_eventi!inner(user_id, status)(
	// 	          user_id,
	// 	          status
	// 	      ),
	const finalData = {
		...data,
		event_imgs: images,
	};

	return { finalData, error };
};

const modify = async (req) => {
	const { event_id } = req.params;
	const body = req.body;
	const { data, error } = await supabase
		.from('eventi')
		.update([{ ...body }])
		.eq('event_id', event_id);
	return { data, error };
};

const newEvent = async (req) => {
	const token = req.headers.authorization.split(' ')[1];
	const { images, ...realBody } = req.body.data;
	const {
		latitudine,
		longitudine,
		err: coordError,
	} = await getCoords({
		cap: realBody.cap,
		indirizzo: realBody.indirizzo,
		citta: realBody.citta,
	});
	console.log('dopo funzione');
	if (coordError) {
		console.error('errore nel ritrovamento della posizione:', coordError);
		return { data: null, error: coordError };
	}
	const { data: luogoEsistente } = await supabase
		.from('luoghi')
		.select('luogo_id')
		.eq('longitudine', longitudine)
		.eq('latitudine', latitudine)
		.single();

	let luogoId = luogoEsistente?.luogo_id;

	// 2. Se NON esiste, inseriscilo
	if (!luogoId) {
		const { data: luogoNuovo, error: insertError } = await supabase
			.from('luoghi')
			.insert([
				{
					cap: realBody.cap,
					indirizzo: realBody.indirizzo,
					citta: realBody.citta,
					nome: realBody.nome_luogo,
					latitudine,
					longitudine,
				},
			])
			.select('luogo_id')
			.single();

		if (insertError) {
			console.error('Errore creazione luogo:', insertError);
			return { data: null, error: insertError };
		}
		luogoId = luogoNuovo.luogo_id;
	}

	console.log(luogoId);

	const { data: userData, error: userError } = await supabase.auth.getUser(
		token
	);

	if (userError) {
		console.error('Utente non autenticato o errore di sessione:', userError);
		// Gestisci l'errore, magari reindirizzando al login
		return;
	}

	// L'ID utente (uid) si trova sotto session.user.id
	const user_id = userData.user.id;
	const { cap, indirizzo, nome_luogo, citta, ...eventBody } = realBody;
	const { data: eventData, error } = await supabase
		.from('eventi')
		.insert([{ ...eventBody, luogo_id: luogoId, created_by: user_id }])
		.select('*');
	if (error) {
		console.error("Errore nell'inserimento:", error);
		// È fondamentale uscire qui se l'inserimento fallisce
		return { data: null, error };
	}
	const eventId = eventData?.[0].event_id;
	console.log('ci sono qui');

	const { data: messageData, error: errorMessage } = await supabase
		.from('messaggi')
		.insert([
			{
				type: 'event',
				event_id: eventId,
				user_id,
				group_id: realBody.group_id,
			},
		])
		.select(
			'*,eventi(*, luoghi(nome, citta, indirizzo),utenti(creatore:nome, user_id),risposte_eventi(*, utenti(profile_pic, user_id, nome))) '
		);
	if (errorMessage) {
		console.error("Errore nell'inserimento:", errorMessage);
		// È fondamentale uscire qui se l'inserimento fallisce
		return { data: null, error: errorMessage };
	}
	const imagesPromises = (messageData || []).map(async (event) => {
		const imagePublicUrls = [];
		for (let i = 1; i <= 4; i++) {
			const path = `${event.eventi.event_id}/${i}.jpg`;
			// Non gestisco l'errore del getPublicUrl perché è implicito che alcune immagini potrebbero non esistere
			const {
				data: { publicUrl },
			} = supabase.storage.from('eventi').getPublicUrl(path);
			imagePublicUrls.push(publicUrl);
		}
		return { event_id: event.eventi.event_id, images: imagePublicUrls };
	});

	const imagesResults = await Promise.all(imagesPromises);
	const imageMap = imagesResults.reduce((acc, result) => {
		acc[result.event_id] = result.images;
		return acc;
	}, {});

	const { data: eventGroupData, error: eventGroupError } = await supabase
		.from('eventi_gruppo')
		.insert([
			{
				event_id: eventId,
				group_id: realBody.group_id,
			},
		]);
	if (eventGroupError) {
		console.error("Errore nell'inserimento:", eventGroupError);
		// È fondamentale uscire qui se l'inserimento fallisce
		return { data: null, error: eventGroupError };
	}

	const { data: participantsData, error: participantsError } = await supabase
		.from('partecipanti_gruppo')
		.select('partecipante_id')
		.eq('group_id', realBody.group_id);
	if (participantsError) {
		console.error("Errore nell'ottenimento: ", participantsError);
		// È fondamentale uscire qui se l'inserimento fallisce
		return { data: null, error: participantsError };
	}
	const participantsIds = participantsData.reduce((acc, participant) => {
		acc[participant.partecipante_id] = participant;
		return acc;
	});
	const answersToInsert = participantsData.map((participant) => {
		// Determina lo stato: 'accepted' per il creatore, 'pending' per gli altri
		const status =
			participant.partecipante_id === user_id ? 'accepted' : 'pending';
		return {
			event_id: eventId,
			user_id: participant.partecipante_id,
			status: status,
			is_creator: participant.user_id === user_id,
		};
	});
	const { data: asnwerInsert, error: answerError } = await supabase
		.from('risposte_eventi')
		.insert(answersToInsert);
	if (answerError) {
		console.error("Errore nell'ottenimento: ", answerError);
		// È fondamentale uscire qui se l'inserimento fallisce
		return { data: null, error: answerError };
	}
	return {
		data: {
			event_id: eventId,
			event_details: {
				...messageData[0].eventi,
				event_imgs: imageMap[eventId],
			},
		},
		error: null,
	};
};
const modifyResponse = async (req) => {
	const { status, event_id } = req.body;
	const token = req.headers.authorization.split(' ')[1];
	let user_id;
	const { user, error: userError } = await supabase.auth.getUser(token);
	if (user) {
		user_id = user.user_id;
	}
	if (userError) {
		return { data: null, userError };
	}
	const finalData = { event_id, user_id, status: status };
	const { data, error } = await supabase
		.from('risposte_eventi')
		.upsert(finalData, { onConflict: 'user_id, event_id' })
		.eq('event_id', event_id);
	return { data, error };
};
const getSuspended = async (req) => {
	const { offset } = req.body;
	const token = req.headers.authorization.split(' ')[1];
	const EVENTSINPAGE = 12;

	const {
		data: { user },
		error: tokenError,
	} = await supabase.auth.getUser(token);
	if (tokenError) {
		return { data: null, tokenError };
	}
	// const finalData = { event_id, user_id, status: status };
	const { data, error } = await supabase
		.from('risposte_eventi')
		.select(
			'event_id,status,eventi(event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),descrizione,cover_img,data_scadenza,event_imgs(*),gruppi(*,partecipanti_gruppo(*)))'
		)

		.eq('user_id', user.id)
		.eq('status', 'pending')
		.range(offset, offset + EVENTSINPAGE - 1);

	return { data, error };
};
module.exports = {
	getAll,
	getSuspended,
	getEvent,
	newEvent,
};
