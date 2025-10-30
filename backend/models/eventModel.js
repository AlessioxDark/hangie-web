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
		.range(0, offset + 19)

		.limit(0)

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
const getSuspended = async (req) => {
	const { offset } = req.body;
	const token = req.headers.authorization.split(' ')[1];

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
		// .range(0, offset + 19)

		.eq('user_id', user.id)
		.eq('status', 'pending')
		.limit(0);
	return { data, error };
};
