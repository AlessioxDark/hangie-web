const supabase = require('../config/db');
const getPfp = async (req, token) => {
	const { user_id } = req.params;
	const {
		data: { user },
		error: tokenError,
	} = await supabase.auth.getUser(token);
	if (tokenError) {
		return { data: null, error: tokenError };
	}

	const { data, error } = await supabase
		.from('utenti')
		.select('profile_pic')
		.eq('user_id', user_id);
	console.log('pfp', data, error);
	return { data, error };
};
module.exports = {
	getPfp,
};
