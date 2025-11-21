import { useModal } from '@/contexts/ModalContext';
import React from 'react';
import EventDetails from '../events/EventDetails';
import EventDetailsModal from './EventDetailsModal';

const ModalHandler = () => {
	const { modalType } = useModal();
	if (modalType == 'EVENT_MODAL') return <EventDetailsModal />;
	if (modalType == 'CREATE_EVENT_MODAL') return <EventDetailsModal />;
};

export default ModalHandler;
