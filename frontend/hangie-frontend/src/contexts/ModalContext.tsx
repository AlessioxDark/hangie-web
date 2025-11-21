import { createContext, useContext } from 'react';

export const ModalContext = createContext({
	isOpen: false,
	setIsOpen: (arg) => arg,
	closeModal: (arg) => {},
	openModal: () => {},
	modalData: null,
	setModalData: (arg) => arg,
});
export const useModal = () => {
	const context = useContext(ModalContext);

	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
	if (context === undefined) {
		throw new Error("useChat deve essere usato all'interno di un ChatProvider");
	}

	return context;
};
