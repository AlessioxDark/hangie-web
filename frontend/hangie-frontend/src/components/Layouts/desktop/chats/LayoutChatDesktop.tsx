import Chats from '@/app/pages/Chats.js';
import ChatsSidebar from '@/app/pages/ChatsSidebar';
import Sidebar from '@/app/pages/desktop/Sidebar';
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../../../../config/db.js';
import { ChatContext } from './ChatContext.js';
const LayoutChatDesktop = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<null | string>('');
	const [currentChat, setCurrentChat] = useState(null);
	const [currentChatData, setCurrentChatData] = useState(null);

	const fetchChat = async () => {
		if (isLoading) return;
		try {
			setError(null);
			setIsLoading(true);
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (session) {
				const response = await fetch(
					`http://localhost:3000/api/groups/${currentChat}`,
					{
						method: 'GET',
						// body: JSON.stringify({ offset: offset }),
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${session.access_token}`,
						},
					}
				);
				if (!response.ok) {
					console.log(response);
					setError(
						response.statusText || 'Errore nel caricamento degli eventi'
					);
				}

				const data = await response.json();
				console.log(data);

				setCurrentChatData((prevData) => {
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
		fetchChat();
	}, [currentChat]);

	return (
		<ChatContext.Provider
			value={{
				currentChat: currentChat,
				currentChatData: currentChatData,
				setCurrentChat: setCurrentChat,
				setCurrentChatData: setCurrentChatData,
			}}
		>
			<div className="h-screen w-full flex flex-row">
				<Sidebar />
				<ChatsSidebar />
				<div className="flex flex-col w-full h-screen  bg-bg-2">
					<main className="flex-grow h-screen overflow-y-auto px-20 py-12">
						{/* {children} */}
						{currentChatData?.map((chat, chatIndex) => {
							if (currentChat == chatIndex) {
								return <Chats {...chat} />;
							}
						})}
					</main>
				</div>
				{/* {children} */}
			</div>
		</ChatContext.Provider>
	);
};

export default LayoutChatDesktop;
