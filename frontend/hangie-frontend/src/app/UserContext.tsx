import { createContext, useContext } from 'react';

export const UserContext = createContext({
	userId: null,
	setUserId: (arg) => arg,
	isAuthenticated: false,
	setIsAuthenticated: (arg) => arg,
	userData: [],
	token: null,
	setToken: (arg) => arg,
	setUserData: (arg) => arg,
});
export const useUser = () => {
	const context = useContext(UserContext);

	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
	if (context === undefined) {
		throw new Error("useChat deve essere usato all'interno di un ChatProvider");
	}

	return context;
};
