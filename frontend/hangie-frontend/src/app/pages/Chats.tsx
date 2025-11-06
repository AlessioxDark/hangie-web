import MessageCard from '@/components/Layouts/desktop/chats/messaggi/MessageCard';
import React from 'react';

const Chats = ({ nome, messaggi }) => {
	return (
		<div>
			{messaggi.map((mess) => {
				return <MessageCard isUser={false} {...mess} />;
			})}
		</div>
	);
};

export default Chats;
