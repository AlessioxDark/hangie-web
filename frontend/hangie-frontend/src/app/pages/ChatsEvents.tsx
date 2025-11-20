import ChevronRight from '@/assets/other/ChevronRight';
import EventCard from '@/components/events/EventCard';
import EventCardSuspended from '@/components/events/EventCardSuspended';
import GroupEventCard from '@/components/groups/GroupEventCard';
import { useChat } from '@/components/Layouts/desktop/chats/ChatContext';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FILTER_TYPES = ['accepted', 'pending', 'archive'];
const ChatsEvents = ({}) => {
	const [groupEventsData, setGroupEventsData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentFilter, setCurrentFilter] = useState('');
	const { currentGroup } = useChat();
	const [query, setQuery] = useState('');
	const { session } = useAuth();
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
	const getEventStatus = (event) => {
		console.log('eventStatus');
		if (event?.created_by === session.user.id) {
			console.log('creator');
			return 'creator'; // L'utente è il creatore, vede i pulsanti di modifica
		}
		console.log(session.user.id);
		console.log(event.risposte_eventi);
		const userResponse = event.risposte_eventi.find(
			(risposta) => risposta.user_id === session.user.id
		);

		if (userResponse) {
			return userResponse.status;
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

	const filteredEvents = useMemo(() => {
		const allEvents = groupEventsData || [];

		// Funzione helper per determinare lo status di partecipazione dell'utente corrente (userId)
		const getUserEventStatus = (event) => {
			// 1. Controlla se l'utente è il creatore
			if (event.created_by === session.user.id) {
				return 'creator'; // Status speciale per il creatore
			}

			// 2. Cerca la risposta dell'utente corrente nell'array risposte_eventi
			const userResponse = (event.risposte_eventi || []).find(
				// Assumo che l'oggetto risposta abbia un campo 'user_id'
				(risposta) => risposta.user_id === session.user.id
				// Se 'risposte_eventi' contiene oggetti annidati con { utenti: { user_id: '...' } }
				// usa: (risposta) => risposta.utenti?.user_id === userId
			);

			// 3. Restituisce lo status trovato o 'pending' se l'utente non ha risposto
			if (userResponse) {
				// Lo status è il campo 'status' all'interno dell'oggetto risposta
				return userResponse.status;
			}

			// 4. Se non è creatore e non ha una risposta registrata, è 'pending' (non ha risposto)
			return 'pending';
		};

		// Lista di eventi filtrata in base allo status
		let statusFilteredList = [];

		if (currentFilter === '') {
			// Se il filtro è vuoto, include tutti gli eventi
			statusFilteredList = allEvents;
		} else {
			// Altrimenti, filtra in base allo status
			statusFilteredList = allEvents.filter((event) => {
				const status = getUserEventStatus(event);

				// Filtra per lo status selezionato
				if (currentFilter === 'pending') {
					// 'Pending' deve includere sia gli eventi con status 'pending' sia quelli
					// dove l'utente è il creatore e non ha 'risposto' a sé stesso
					return status === 'pending' || status === 'creator';
				}

				// Per 'accepted' e 'rejected', cerca lo status esatto
				return status === currentFilter;
			});
		}

		// 2. Filtro per la query di ricerca (si applica sempre alla lista filtrata per status)
		if (query.trim() !== '') {
			const regex = new RegExp(query, 'i');
			return statusFilteredList.filter(
				(evento) => evento.titolo && evento.titolo.match(regex)
			);
		}

		// Restituisce la lista filtrata per status (o la lista completa se currentFilter è '')
		return statusFilteredList;

		// Aggiungi userId come dipendenza per assicurarti che il filtro venga rieseguito
		// se l'utente cambia.
	}, [groupEventsData, currentFilter, query, session.user.id]);

	return (
		<div className="min-w-1/5 max-w-1/5 h-full">
			<div className="p-6 flex flex-col gap-8">
				<div className="flex flex-row justify-between items-center w-full">
					<h1 className="font-body font-bold text-2xl">Eventi Gruppo</h1>
					{/* <span className="text-text-2 text-sm font-body">
						{groupEventsData?.all.length || 0} eventi
					</span> */}
				</div>
				<div className="w-full flex flex-col gap-4">
					<div className="flex flex-row w-full  gap-4 items-center">
						<div
							className="
          bg-gray-100 flex-1 
                            rounded-4xl 
                            focus-within:ring-2 
                            focus-within:ring-blue-500
                            p-2 shadow-inner transition-shadow
                            flex items-start
                            
          "
						>
							<input
								className={`
                min-h-10 max-h-32
                whitespace-pre-wrap
                w-full p-2  outline-none font-body text-lg text-text-1 items-start overflow-y-auto
             
                `}
								placeholder="Scrivi un evento"
								onInput={(e) => {
									setQuery(e.target.value);
								}}
							/>
						</div>
					</div>
					<div className="flex w-full flex-row gap-3 items-center">
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
				</div>
				<div className="flex flex-col gap-8">
					<div>
						{filteredEvents?.length > 0 ? (
							<div
								className="
                flex flex-col gap-4
              "
							>
								{filteredEvents?.map((event) => {
									// const evento = event.evento
									const status = getEventStatus(event);
									return (
										<div key={event.event_id}>
											<GroupEventCard type={status} {...event} />
										</div>
									);
								})}
							</div>
						) : (
							renderEmptyState()
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatsEvents;
