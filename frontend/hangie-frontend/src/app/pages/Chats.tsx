import SendIcon from '@/assets/other/SendIcon';
import { useChat } from '@/components/Layouts/desktop/chats/ChatContext';
import MessageCard from '@/components/Layouts/desktop/chats/messaggi/MessageCard';
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase } from '../../config/db.js';
const Chats = ({ nome, messaggi }) => {
	const { currentGroupData, setCurrentChatData, currentChatData } = useChat();
	const [chatInput, setChatInput] = useState(null);
	const messagesEndRef = useRef(null);
	const socketRef = useRef(null);
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
	});
	console.log(currentGroupData);
	console.log(currentGroupData.group_id);
	useEffect(() => {
		console.log(chatInput);
	}, [chatInput]);
	useEffect(() => {
		const SERVER_URL = 'http://localhost:3000';

		// Stabilisce la connessione con il server
		const socket = io(SERVER_URL);
		socketRef.current = socket;
		socket.on('connect', () => {
			console.log('Socket.IO Connesso! ID:', socket.id);
		});

		return () => {
			socket.disconnect();
		};
	}, []);
	const sendMessage = () => {
		socketRef.current.emit(
			'send_message',
			chatInput,
			currentGroupData.group_id
		);
	};
	useEffect(() => {
		if (currentGroupData) {
			socketRef.current.on('receive_message', (data) => {
				console.log('messaggio ricevuto: ', data);
			});
		}
	}, []);
	return (
		<div className="w-full h-full flex flex-col">
			<div className="bg-bg-1 p-4 flex flex-row items-center gap-6">
				<img
					src={currentGroupData?.group_cover_img}
					className="w-16 h-16"
					alt=""
				/>{' '}
				<div>
					<span className="text-text-1 font-bold font-body text-3xl">
						{currentGroupData?.nome}
					</span>
					<div>
						{
							// <span key={currentGroupData?.utenti.user_id}>
							// 	{currentGroupData?.partecipante.nome}
							// </span>
						}
						{/* {currentGroupData?.utenti.map((utente) => {
							return <span key={utente.user_id}>{utente.nome}</span>;
						})} */}
					</div>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto px-20">
				<div className="flex flex-col gap-8 mt-8">
					{messaggi.map((mess) => {
						return (
							<div className={`w-full flex ${mess.isUser && 'justify-end'}`}>
								<MessageCard {...mess} />
							</div>
						);
					})}
					<div ref={messagesEndRef}></div>
				</div>
			</div>
			<div
				className="
            bg-white border-t border-gray-200
                    flex items-center justify-center 
                    p-4 shadow-2xl 
        "
				style={{ borderWidth: '0.1px', borderLeft: '0px' }}
			>
				{/* Contenitore Input Interno */}
				<div className="flex flex-row w-full max-w-4xl gap-4 items-center">
					<div
						className="
          bg-gray-100 flex-1 
                            rounded-4xl 
                            focus-within:ring-2 
                            focus-within:ring-blue-500
                            p-2 shadow-inner transition-shadow
                            flex items-start
                            
          "
					>
						<div
							contentEditable={true}
							className="
                min-h-10 max-h-32
                whitespace-pre-wrap
                focus:placeholder-transparent
                w-full p-2  outline-none font-body text-lg text-text-1 placeholder-text-2 items-start overflow-y-auto"
							onInput={(e) => {
								setChatInput(e.target.textContent);
							}}
						></div>
					</div>
					<div onClick={sendMessage}>
						<SendIcon />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Chats;
