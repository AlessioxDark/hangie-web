const supabase = require('../config/db');

const getNearby = async (req) => {
	// const { user_id } = req.params;

	if (!req.body || !req.body.user_pos) {
		return { data: null, error: "Posizione utente non fornita" };
	}
	const { user_pos } = req.body;
	const lat_var = 0.135;
	const lon_var = 0.182;
	const { data, error } = await supabase
		.from('eventi')
		.select('*, luoghi(*)')
		.gte('luoghi.latitudine', user_pos.lat - lat_var)
		.lte('luoghi.latitudine', user_pos.lat + lat_var)
		.gte('luoghi.longitudine', user_pos.lon - lon_var)
		.lte('luoghi.longitudine', user_pos.lon + lon_var)
		.limit(20);

	return { data, error };
};
module.exports = {
	getNearby,
};
