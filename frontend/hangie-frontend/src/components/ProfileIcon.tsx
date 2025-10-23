import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import defaultpfp from '../assets/defaultpfp.jpg';
import { supabase } from '../config/db.js';

const ProfileIcon = () => {
	const [userPfp, setUserPfp] = useState('');
	const [isLoggedIn, setisLoggedIn] = useState(false);
	const navigate = useNavigate();
	const findProfilePic = async () => {
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) {
				console.error('Errore getSession:', error);
				return;
			}
			if (session) {
				const response = await fetch(
					'http://localhost:3000/api/profile/getpfp',
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${session.access_token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				if (data.data[0].profile_pic == null) {
					setUserPfp(defaultpfp);
				} else {
					setUserPfp(data.data[0].profile_pic);
				}
				setisLoggedIn(true);
			} else {
				navigate('/login');
			}
		} catch (err) {
			setUserPfp(defaultpfp);
		}
	};
	useEffect(() => {
		findProfilePic();
	}, []);
	return (
		<div
			className="rounded-full w-16 h-16 cursor-pointer"
			onClick={() => {
				navigate(isLoggedIn ? '/profile' : '/login');
			}}
		>
			<img src={userPfp} className="w-full h-full" alt="profile pic" />
		</div>
	);
};

export default ProfileIcon;
