import GroupCard from '@/components/groups/groupCard.js';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/db.js';
const ChatsSidebar = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<null | string>('');
	const [groupsData, setGroupsData] = useState([]);
	const fetchGroups = async () => {
		if (isLoading) return;
		try {
			setError(null);
			setIsLoading(true);
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (session) {
				const response = await fetch('http://localhost:3000/api/groups/', {
					method: 'GET',
					// body: JSON.stringify({ offset: offset }),
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
				});
				if (!response.ok) {
					console.log(response);
					setError(
						response.statusText || 'Errore nel caricamento degli eventi'
					);
				}

				const data = await response.json();
				console.log(data);

				setGroupsData((prevData) => {
					return data;
				});
			}
		} catch (err: any) {
			console.error('Errore fetch eventi:', err);
			setError(err.message || 'Errore nel caricamento degli eventi');
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		fetchGroups();
	}, []);
	return (
		<div className="h-screen bg-bg-1 w-1/4">
			<div className="flex flex-col gap-12">
				<div className="flex flex-row gap-28 items-center  p-14">
					<h1 className="font-body font-semibold text-text-1 text-5xl">
						Messaggi
					</h1>
					<div className="bg-text-2 rounded-full px-5 py-2 flex items-center justify-center">
						<span className="text-bg-1 text-5xl font-body">+</span>
					</div>
				</div>
				<div>
					{groupsData.length > 0 ? (
						groupsData.map((group) => {
							// console.log(group);
							return <GroupCard {...group} />;
						})
					) : (
						<div>
							<h1>ancora nessun gruppo</h1>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChatsSidebar;
