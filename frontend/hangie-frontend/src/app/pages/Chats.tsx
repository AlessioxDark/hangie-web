import SendIcon from '@/assets/icons/SendIcon.js';
import { useChat } from '@/components/Layouts/desktop/chats/ChatContext';
import MessageCard from '@/components/Layouts/desktop/chats/messaggi/MessageCard';

import ChatInput from '@/features/chats/ChatInput.js';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase } from '../../config/db.js';
const Chats = ({ messaggi }) => {
	const { currentGroupData, setCurrentChatData, currentChatData } = useChat();
	const [chatInput, setChatInput] = useState<string>('');
	const messagesEndRef = useRef(null);
	const socketRef = useRef<any>(null);
	const chatInputRef = useRef<any>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
	});

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

	const sendMessage = async () => {
		console.log('messaggio inviato');
		const token = await getToken();
		const {
			data: { user },
			error: tokenError,
		} = await supabase.auth.getUser(token);
		if (token) {
			socketRef.current.emit(
				'send_message',
				chatInput,
				currentGroupData?.group_id,
				token
			);

			console.log('risposta avviata gestendo dato');
			console.log(user);
			setCurrentChatData((prevData) => {
				return prevData.map((dato) => {
					return dato.group_id === currentGroupData.group_id
						? {
								...dato,
								messaggi: [
									...dato.messaggi,
									{
										// mettere tutti i dati per questo da errore es nome, pfpf ecc.
										content: chatInput,
										group_id: currentGroupData.group_id,
										user_id: user.id,
										sent_at: Date.now(),
										isUser: true,
									},
								],
						  }
						: dato;
				});
			});
			setChatInput('');
			if (chatInputRef.current) {
				// Pulisce l'elemento DOM (l'input visibile)
				chatInputRef.current.textContent = '';
			}
		}
		//Puliamo input
		console.log(token);
	};

	const getToken = async () => {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			console.error('Errore getSession:', error);
			return;
		}
		if (session) {
			return session.access_token;
		}
	};

	useEffect(() => {
		if (currentGroupData) {
			socketRef.current.emit('join_room', currentChatData.group_id);

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
			<div className="flex-1 overflow-y-auto px-8">
				<div className="flex flex-col gap-4 mt-8">
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
			<ChatInput
				chatInputRef={chatInputRef}
				sendMessage={sendMessage}
				setChatInput={setChatInput}
			/>
		</div>
	);
};

export default Chats;
