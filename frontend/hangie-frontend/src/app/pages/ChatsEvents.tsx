import ChevronRight from '@/assets/other/ChevronRight';
import EventCard from '@/components/events/EventCard';
import EventCardSuspended from '@/components/events/EventCardSuspended';
import GroupEventCard from '@/components/groups/GroupEventCard';
import { useChat } from '@/components/Layouts/desktop/chats/ChatContext';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
// import {supabase} '../../config/db.js'
const FILTER_TYPES = ['accepted', 'pending', 'archive'];
const ChatsEvents = ({}) => {
	const [groupEventsData, setGroupEventsData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentFilter, setCurrentFilter] = useState('');
	const { currentGroup } = useChat();

	const fetchGroupEvents = async () => {
		console.log('Fetch inziata');
		if (isLoading) return;
		try {
			const response = await fetch(
				`http://localhost:3000/api/groups/${currentGroup}/group-events`,
				{
					method: 'GET',
					// body: JSON.stringify({ offset: offset }),
					headers: {
						'Content-Type': 'application/json',
						// Authorization: `Bearer ${session.access_token}`,
					},
				}
			);
			// console.log(response);
			if (!response.ok) {
				console.log(response);
				setError(response.statusText || 'Errore nel caricamento degli eventi');
			}
			const data = await response.json();
			console.log(data);
			setGroupEventsData(data);
		} catch (err: any) {
			console.error('Errore fetch eventi:', err);
			setError(err.message || 'Errore nel caricamento degli eventi');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		console.log('fetching...');
		if (currentGroup !== null) fetchGroupEvents();
	}, [currentGroup]);
	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
				<Calendar className="w-8 h-8 text-gray-400" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-2">
				Nessun Evento per il momento
			</h3>
		</div>
	);
	const renderContent = useCallback(
		(type: string) => {
			if (error) {
				return (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
							<AlertCircle className="w-16 h-16 text-warning" />
						</div>
						<h3 className="text-lg font-medium text-text-1 mb-2">
							Ops! Qualcosa è andato storto
						</h3>
						<p className="text-gray-500 mb-6 text-center">{error}</p>
						<button
							onClick={() => fetchGroupEvents()}
							className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
						>
							Riprova
						</button>
					</div>
				);
			}
			if (isLoading) {
				return (
					<div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
						<div className=" rounded-full flex items-center justify-center mb-6">
							<Loader2 className="w-16 h-16 text-primary animate-spin" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Caricamento degli eventi...
						</h3>
						<p className="text-gray-500 text-center max-w-sm">
							Stiamo scoprendo le prossime esperienze per te.
						</p>
					</div>
				);
			}
			if (type == 'pending') {
				return (
					<div>
						{groupEventsData?.pending?.length > 0 ? (
							<div
								className=" 
   flex flex-col gap-4"
							>
								{groupEventsData &&
									groupEventsData.pending.map((event) => (
										<div className="w-full " key={event.event_id}>
											<GroupEventCard type={type} {...event} />
										</div>
									))}
							</div>
						) : (
							// <div className="flex xs:flex-col lg:flex-row gap-8 ">
							// 	{eventsData &&
							// 		eventsData.pending.slice(0, 3).map((event) => (
							// 			<div
							// 				className="w-full  xl:max-w-[37rem]"
							// 				key={event.event_id}
							// 			>
							// 				<EventCardSuspendedDesktop {...event} />
							// 			</div>
							// 		))}
							// </div>
							renderEmptyState()
						)}
					</div>
				);
			}
			if (type == 'accepted') {
				return (
					<div>
						{groupEventsData?.accepted?.length > 0 ? (
							<div
								className="
                flex flex-col gap-4
              "
							>
								{groupEventsData?.accepted?.map((event) => {
									// const evento = event.evento
									return (
										<div key={event.event_id}>
											<GroupEventCard type={type} {...event} />
										</div>
									);
								})}
							</div>
						) : (
							renderEmptyState()
						)}
					</div>
				);
			}
			if (type == 'archive') {
				return (
					<div>
						{groupEventsData?.rejected?.length > 0 ? (
							<div
								className="
                flex flex-col gap-4
              "
							>
								{groupEventsData?.rejected?.map((event) => {
									// const evento = event.evento
									return (
										<div key={event.event_id}>
											<GroupEventCard type={type} {...event} />
										</div>
									);
								})}
							</div>
						) : (
							renderEmptyState()
						)}
					</div>
				);
			}
			if (type == '') {
				return (
					<div>
						{groupEventsData?.all?.length > 0 ? (
							<div
								className="
                flex flex-col gap-4
              "
							>
								{groupEventsData?.all?.map((event) => {
									// const evento = event.evento
									return (
										<div key={event.event_id}>
											<GroupEventCard type={event.status} {...event} />
										</div>
									);
								})}
							</div>
						) : (
							renderEmptyState()
						)}
					</div>
				);
			}
			return null;
		},
		[fetchGroupEvents, groupEventsData, error, isLoading]
	);

	return (
		<div className="min-w-1/5 max-w-1/5 h-full">
			<div className="p-6 flex flex-col gap-8">
				<div className="flex flex-row justify-between items-center w-full">
					<h1 className="font-body font-bold text-2xl">Eventi Gruppo</h1>
					{/* <span className="text-text-2 text-sm font-body">
						{groupEventsData?.all.length || 0} eventi
					</span> */}
				</div>
				<div className="flex w-full flex-row gap-4 items-center">
					{FILTER_TYPES.map((filter) => {
						return (
							<div
								onClick={() => {
									if (currentFilter === filter) {
										setCurrentFilter('');
									} else {
										setCurrentFilter(filter);
									}
								}}
								className={`px-5 py-2 ${
									currentFilter == filter
										? 'bg-primary text-bg-1 shadow-lg shadow-primary/50'
										: 'bg-bg-2 text-text-2 border border-text-2 hover:bg-bg-3 hover:shadow-md'
								} font-body   text-xl cursor-pointer
                
                
                px-4 py-2 
             
              font-semibold 
              rounded-full 
          
              transition-all duration-200 
              shadow-sm

             
              `}
							>
								{filter}
							</div>
						);
					})}
				</div>
				<div className="flex flex-col gap-8">
					{renderContent(currentFilter)}
				</div>
			</div>
		</div>
	);
};

export default ChatsEvents;
