import { createContext, useContext, useState } from 'react';

export const ModalContext = createContext({
	isModalOpen: false,
	closeModal: (arg) => {},
	openModal: () => {},
	modalType: null,

	modalData: null,
});
export const useModal = () => {
	const context = useContext(ModalContext);

	// Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
	if (context === undefined) {
		throw new Error("useChat deve essere usato all'interno di un ChatProvider");
	}

	return context;
};

export const ModalProvider = ({ children }) => {
	const MODAL_TYPES = ['EVENT_MODAL', 'CREATE_EVENT_MODAL'];
	const [modalState, setModalState] = useState({ type: null, data: null });

	const { type: modalType, data: modalData } = modalState;
	const isModalOpen = modalType !== null;
	const openModal = ({ type, data }) => {
		if (!type) {
			throw new Error('devi Inserire un tipo');
		}
		if (!data) {
			throw new Error('devi Inserire dati');
		}
		setModalState({ type, data });
	};
	const closeModal = () => {
		setModalState({ type: null, data: null });
	};
	return (
		<ModalContext.Provider
			value={{ openModal, closeModal, modalType, modalData, isModalOpen }}
		>
			{children}
		</ModalContext.Provider>
	);
};
