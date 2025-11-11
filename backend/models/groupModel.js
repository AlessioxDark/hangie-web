const supabase = require('../config/db');
const getAll = async (req) => {
	const token = req.headers.authorization.split(' ')[1];
	const {
		data: { user },
		error: tokenError,
	} = await supabase.auth.getUser(token);

	const { data, error } = await supabase
		.from('partecipanti_gruppo')
		.select('gruppi(*,messaggi(*))')
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
		.from('eventi')
		.select('event_id,titolo,event_cover_img,costo')
		.eq('group_id', group_id);
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
