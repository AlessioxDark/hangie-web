import React, { createContext, useContext, useEffect, useState } from 'react';

export const ChatContext = createContext({
	currentChatData: null, // dati chat corrente
	setCurrentChatData: (arg) => arg, // impostare dati chat
	currentGroup: null, // id chat corrente
	setCurrentGroup: (arg) => arg, // impostare id chat
	currentGroupData: null,
	setCurrentGroupData: (arg) => arg,
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

	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider

	return (
		<ChatContext.Provider
			value={{
				currentChatData,
				setCurrentChatData,
				currentGroup, // id chat corrente
				setCurrentGroup, // impostare id chat
				currentGroupData,
				setCurrentGroupData,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};
