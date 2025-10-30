import React, { useEffect, useState } from 'react';

const ProfilePic = ({ user_id }) => {
	const [pfpUrl, setPfpUrl] = useState('');
	const getPfp = async () => {
		const response = await fetch(
			'http://localhost:5000/api/profile/getuserpfp'
		);

		const data = await response.json();
		console.log(data);
		setPfpUrl(data);
	};
	return (
		<div>
			<img src={pfpUrl} alt="" />
		</div>
	);
};

export default ProfilePic;
