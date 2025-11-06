import React, { createContext, useContext } from 'react';

export const ChatContext = createContext({
	currentChat: null,
	currentChatData: null,
	setCurrentChat: (arg) => arg,
	setCurrentChatData: (arg) => arg,
});

export const useChat = () => {
	const context = useContext(ChatContext);

	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
	if (context === undefined) {
		throw new Error("useChat deve essere usato all'interno di un ChatProvider");
	}

	return context;
};
