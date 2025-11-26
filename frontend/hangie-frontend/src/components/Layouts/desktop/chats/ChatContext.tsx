import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { io } from 'socket.io-client';

export const ChatContext = createContext({
	currentChatData: null, // dati chat corrente
	setCurrentChatData: (arg) => arg, // impostare dati chat
	currentGroup: null, // id chat corrente
	setCurrentGroup: (arg) => arg, // impostare id chat
	currentGroupData: null,
	setCurrentGroupData: (arg) => arg,
	socketRef: null,
});

export const useChat = () => {
	const context = useContext(ChatContext);

	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
	if (context === undefined) {
		throw new Error("useChat deve essere usato all'interno di un ChatProvider");
	}

	return context;
};
export const ChatProvider = ({ children }) => {
	const [currentChatData, setCurrentChatData] = useState(null);
	const [currentGroup, setCurrentGroup] = useState(null);
	const [currentGroupData, setCurrentGroupData] = useState(null);
	const socketRef = useRef(null);
	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
	// const sendEvent = async () => {
	// 	console.log('messaggio inviato');
	// 	const trimmedInput = chatInput.trim();
	// 	socketRef.current.emit(
	// 		'send_event',
	// 		trimmedInput,
	// 		currentGroupData?.group_id,
	// 		session.access_token
	// 	);

	// 	console.log('risposta avviata gestendo dato');

	// 	setCurrentChatData((prevData) => {
	// 		return prevData.map((dato) => {
	// 			return dato.group_id === currentGroupData.group_id
	// 				? {
	// 						...dato,
	// 						messaggi: [
	// 							...dato.messaggi,
	// 							{
	// 								// mettere tutti i dati per questo da errore es nome, pfpf ecc.
	// 								content: trimmedInput,
	// 								group_id: currentGroupData.group_id,
	// 								user_id: session.user.id,
	// 								sent_at: Date.now(),
	// 								isUser: true,
	// 							},
	// 						],
	// 				  }
	// 				: dato;
	// 		});
	// 	});
	// };
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
	return (
		<ChatContext.Provider
			value={{
				currentChatData,
				setCurrentChatData,
				currentGroup, // id chat corrente
				setCurrentGroup, // impostare id chat
				currentGroupData,
				setCurrentGroupData,
				socketRef,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};
