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
	const { group_id } = req.params;
	const { data, error } = await supabase
		.from('partecipanti_gruppo')
		.select(
			`gruppi(*,messaggi(*,utenti(*))),utenti(*)
	  `
		)
		.eq('group_id', group_id)
		.eq('partecipante_id', user.identities[0].user_id);

	return { data, error };
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
