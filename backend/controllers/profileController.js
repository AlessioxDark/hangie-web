const Profile = require('../models/profileModel');

const getPfp = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1];

	const { data, error } = await Profile.getPfp(token);
	if (error) {
		return res.status(400).json({
			success: false,
			error: { message: 'Token non valido o scaduto.' },
		});
	}

	res.status(200).json({ success: true, message: 'pfp trovata', data: data });
};

module.exports = {
	getPfp,
};
