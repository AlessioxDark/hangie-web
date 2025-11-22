import { useModal } from '@/contexts/ModalContext';
import React, { useEffect } from 'react';
import EventDetails from '../events/EventDetails';
import CreateEventModal from './CreateEventModal';
import EventDetailsModal from './EventDetailsModal';

const ModalHandler = () => {
	console.log('ok');
	const { modalType } = useModal();
	useEffect(() => {
		console.log(modalType);
	}, []);
	if (modalType == null) return <></>;
	if (modalType == 'EVENT_MODAL') return <EventDetailsModal />;
	if (modalType == 'CREATE_EVENT_MODAL') return <CreateEventModal />;
};

export default ModalHandler;
