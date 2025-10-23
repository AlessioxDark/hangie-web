const supabase = require('../config/db');
const getPfp = async (token) => {
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
		.eq('user_id', user.id);
	return { data, error };
};
module.exports = {
	getPfp,
};
