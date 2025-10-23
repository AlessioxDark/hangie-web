const supabase = require('../config/db');
// const getAll = async (req) => {
// 	const { offset } = req.body;

// 	const { data, error } = await supabase
// 		.from('eventi')
// 		.select(
// 			'event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(nome, citta),categorie(nome)'
// 		)
// 		.range(0, offset + 20);
// 	data.map(async (evento) => {
// 		let images = [];
// 		for (let i = 1; i <= 3; i++) {
// 			const path = `${evento.event_id}/${i}.jpg`;
// 			const {
// 				data: { publicUrl },
// 				error: publicUrlError,
// 			} = supabase.storage
// 				.from('event_details_imgs') // Updated bucket name here
// 				.getPublicUrl(path);
// 			if (publicUrlError) {
// 				console.error(
// 					`Errore nel recuperare l'immagine ${i}.jpg:`,
// 					publicUrlError
// 				);
// 			}
// 			images.push(publicUrl);
// 		}
// 		return { ...evento, event_imgs: images };
// 	});

// 	console.log('ecco data', data);
// 	return { data, error };
// };

const getAll = async (req) => {
	// Estrae l'offset dal corpo della richiesta.
	const { offset } = req.body;

	// Esegue la query principale per recuperare i dati degli eventi, con un range per la paginazione.
	// Ho corretto il range in (offset, offset + 19) per recuperare esattamente 20 elementi,
	// che è il comportamento tipico della paginazione.
	const { data, error } = await supabase
		.from('eventi')
		.select(
			'event_id,costo,data,titolo,utenti(user_id,nome,profile_pic),luoghi(*),eventi_categorie(categorie(*)),descrizione'
		)
		.range(offset, offset + 19);

	// Se la query ha fallito, restituisce immediatamente l'errore.
	if (error) {
		console.error('Errore nella query degli eventi:', error);
		return { data: null, error };
	}

	// Utilizziamo Promise.all per gestire le operazioni asincrone in parallelo.
	// Questo è cruciale perché per ogni evento, facciamo 3 richieste asincrone a Supabase Storage.
	const dataWithImages = await Promise.all(
		// Mappa l'array 'data' e per ogni evento, recupera gli URL delle immagini in modo asincrono.
		data.map(async (evento) => {
			let images = [];
			const imagePromises = [];

			// Per ogni evento, crea 3 promesse per recuperare gli URL delle immagini.
			for (let i = 1; i <= 3; i++) {
				// const path = `${evento.event_id}/${i}.jpg`;
				const path = `test/${i}.jpg`;

				const {
					data: { publicUrl },
					error: publicUrlError,
				} = supabase.storage
					.from('event_details_imgs') // Updated bucket name here
					.getPublicUrl(path);
				if (publicUrlError) {
					console.error(
						`Errore nel recuperare l'immagine ${i}.jpg:`,
						publicUrlError
					);
					return null;
				}
				imagePromises.push(publicUrl);
			}
			console.log(imagePromises);
			// Attende che tutte le promesse per le immagini dell'evento corrente siano risolte.
			images = await Promise.all(imagePromises);

			// Filtra gli eventuali valori null dall'array delle immagini in caso di errori.
			const filteredImages = images.filter((url) => url !== null);

			// Restituisce un nuovo oggetto evento che include anche l'array delle immagini.
			return { ...evento, event_imgs: filteredImages };
		})
	);

	console.log('Dati con immagini recuperate:', dataWithImages);

	// Restituisce i dati completi con gli URL delle immagini.
	return { data: dataWithImages, error: null };
};

const getEvents = async () => {
	// const { user_id } = req.params;
	const { data, error } = await supabase
		.from('risposte_eventi')
		.select(
			'eventi(event_id,luogo,costo,data,titolo,created_by,event_cover_img)'
		)
		// .eq('risposte_eventi.user_id', user_id)
		.eq('status', 'accepted');

	return { data, error };
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
	 	     risposte_eventi(*,utenti(profile_pic))
      
	  `
		)
		.eq('event_id', event_id)
		.single();

	let images = [];
	for (let i = 1; i <= 3; i++) {
		const path = `${event_id}/${i}.jpg`;
		const {
			data: { publicUrl },
			error: publicUrlError,
		} = supabase.storage
			.from('event_details_imgs') // Updated bucket name here
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
	const body = req.body;
	const { data, error } = await supabase.from('eventi').insert([{ ...body }]);
	return { data, error };
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
module.exports = {
	getAll,
	getEvent,
	getEvents,
	modify,
	newEvent,
	modifyResponse,
};
