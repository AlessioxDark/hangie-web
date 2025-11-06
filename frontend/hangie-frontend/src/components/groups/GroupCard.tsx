import React, { useEffect } from 'react';
import { useChat } from '../Layouts/desktop/chats/ChatContext';

const GroupCard = ({
	nome,
	group_cover_img,
	ultimoMessaggio,
	index,
	group_id,
	created_at,
}) => {
	const { setCurrentChat, currentChat } = useChat();
	useEffect(() => {
		console.log('currentChat è', currentChat);
	}, [currentChat]);
	const formatTime = (dateString) => {
		const date = new Date(dateString);
		// Mostra l'ora se è oggi, altrimenti la data breve
		if (date.toDateString() === new Date().toDateString()) {
			return date.toLocaleTimeString('it-IT', {
				hour: '2-digit',
				minute: '2-digit',
			});
		}
		return date.toLocaleDateString('it-IT', {
			day: '2-digit',
			month: '2-digit',
		});
	};
	return (
		<div
			className="bg-bg-2 p-4 flex items-center w-full 
    cursor-pointer 
    hover:bg-gray-100/80 
    transition-colors
    border-b border-gray-200"
			onClick={() => {
				// console.log('cliccato gruppo');
				setCurrentChat(index);
			}}
		>
			<div className="flex flex-row items-center justify-between w-full h-full">
				<div className="flex flex-row gap-4 w-full items-center">
					<img src={group_cover_img} className="h-16 w-16" alt="" />
					<div className="flex flex-col">
						<h1 className="font-bold font-body text-xl">{nome}</h1>
						<p className="text-text-2 font-body text-lg">
							{ultimoMessaggio?.content}
						</p>
					</div>
				</div>
				<div className="flex flex-col items-end ml-4 ">
					{/* Data/Ora */}
					<p className=" text-text-2 font-body mb-1 text-base">
						{formatTime(ultimoMessaggio?.sent_at | created_at)}
					</p>

					{/* Badge non letti */}
					{3 > 0 && (
						<div className="bg-primary px-3.5 py-1.5 text-center font-bold text-white rounded-full text-lg font-body">
							{/* Ho aggiunto un prop 'unreadCount' per renderlo dinamico */}
							<span>{3}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GroupCard;
