import useMediaQuery from '@/hooks/IsDekstop';
import React from 'react';
import EventsSuspendedDesktop from './desktop/EventsSuspendedDesktop';

const EventsSuspended = () => {
	const isDesktop = useMediaQuery('(min-width: 1280px)');
	return isDesktop ? <EventsSuspendedDesktop /> : <div></div>;
};

export default EventsSuspended;
