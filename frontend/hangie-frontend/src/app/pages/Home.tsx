import ChevronRight from '@/assets/icons/ChevronRight.js';

import EventCard from '@/features/events/EventCard.js';
import EventCardSuspended from '@/features/events/EventCardSuspended.js';

import RenderEmptyState from '@/components/renderEmptyState.js';
import EventDetailsModal from '@/features/modal/EventDetailsModal.js';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../config/db.js';
type Utente = {
	nome: string;
	user_id: string;
	profile_pic: null | string;
};

type EventDataTypes = {
	titolo: string;
	data: Date;
	scadenza: Date;
	descrizione: string;
	costo: number;
	status: 'accepted' | 'pending' | 'refused';
	cover_img: string;
	event_imgs: string[];
	gruppo: any[];
	utente: Utente[];
	luogo: any[];
};

type EventDataTypesArray = {
	pending: EventDataTypes[];
	accepted: EventDataTypes[];
	refused: EventDataTypes[];
};
const EVENTSINPAGE = 12;
const Home = () => {
	const sliderRef = useRef<HTMLDivElement>(null);
	const [eventsData, setEventsData] = useState<EventDataTypesArray>({
		pending: [],
		accepted: [],
		refused: [],
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [error, setError] = useState<string | null>(null);
	const [offset, setOffset] = useState<number>(0);
	const fetchEvents = useCallback(async (): Promise<void> => {
		if (isLoading) return;
		try {
			setError(null);
			setIsLoading(true);
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (session) {
				const response = await fetch(
					'http://localhost:3000/api/events/discover',
					{
						method: 'POST',
						body: JSON.stringify({ offset: offset }),
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${session.access_token}`,
						},
					}
				);
				if (!response.ok) {
					console.log(response);
					setError(
						response.statusText || 'Errore nel caricamento degli eventi'
					);
				}

				const data = await response.json();
				console.log(data);

				setEventsData((prevData) => {
					const mergeAccepted = [...prevData.accepted, ...data.accepted];

					const dedupAccepted = Array.from(
						new Map(mergeAccepted.map((item) => [item.event_id, item])).values()
					);

					const mergePending = [...prevData.pending, ...data.pending];
					const dedupPending = Array.from(
						new Map(mergePending.map((item) => [item.event_id, item])).values()
					);
					const mergeRefused = [...prevData.refused, ...data.refused];
					const dedupRefused = Array.from(
						new Map(mergeRefused.map((item) => [item.event_id, item])).values()
					);

					return {
						pending: dedupPending,
						accepted: dedupAccepted,
						refused: dedupRefused, // fai uguale se ti serve
					};
				});
			}
		} catch (err: any) {
			console.error('Errore fetch eventi:', err);
			setError(err.message || 'Errore nel caricamento degli eventi');
		} finally {
			setIsLoading(false);
		}
	}, [offset, isLoading]);
	useEffect(() => {
		fetchEvents();
	}, [offset]);
	useEffect(() => {
		const slider = sliderRef.current;
		if (!slider) return;

		const onScroll = () => {
			if (isLoading) return; // <--- QUESTA RIGA QUI
			const { scrollHeight, scrollTop, clientHeight } = slider;
			const distanzaDalBasso = scrollHeight - scrollTop - clientHeight;

			if (distanzaDalBasso < 540) {
				setOffset((prevOffset) => prevOffset + EVENTSINPAGE);
			}
		};
		slider.addEventListener('scroll', onScroll);
		return () => slider.removeEventListener('scroll', onScroll);
	}, [isLoading]);

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
							onClick={() => fetchEvents()}
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
						{eventsData.pending.length > 0 ? (
							<div
								className="grid 
   xs:grid-cols-1          
    lg:grid-cols-2 
    xl:grid-cols-3  
    grid-rows-1      
    gap-8"
							>
								{eventsData &&
									eventsData.pending.slice(0, 3).map((event) => (
										<div
											className="w-full xl:min-width-[30rem] xl:max-w-[37rem]"
											key={event.event_id}
										>
											<EventCardSuspended {...event} />
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
							<RenderEmptyState />
						)}
					</div>
				);
			}
			if (type == 'accepted') {
				return (
					<div>
						{eventsData.accepted.length > 0 ? (
							<div
								className="
              grid 
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              2xl:grid-cols-4
         
              gap-8
              "
							>
								{eventsData.accepted.map((event) => {
									// const evento = event.evento
									return (
										<div key={event.event_id}>
											<EventCard {...event} />
										</div>
									);
								})}
							</div>
						) : (
							<RenderEmptyState />
						)}
					</div>
				);
			}
			return null;
		},
		[fetchEvents, eventsData, error, isLoading]
	);

	return (
		<div className="min-h-screen  flex">
			{/* Sidebar qui se ce l'hai */}

			<div className="flex-1">
				{/* ✅ HEADER Sticky */}

				{/* ✅ MAIN CONTENT - Scrollabile */}
				<main ref={sliderRef} className=" ">
					<div className=" flex flex-col gap-16">
						{/* EVENTI IN SOSPESO */}
						<section>
							<div className="flex justify-between items-center mb-8">
								<div className="w-full">
									<div className="w-full justify-between flex flex-row ">
										<h2 className="text-4xl font-bold font-body text-gray-900 mb-2">
											Eventi in Sospeso
										</h2>

										<Link
											to={'/events/suspended/all'}
											className="flex flex-row gap-1 items-center cursor-pointer"
										>
											<span className="text-primary font-semibold text-2xl font-body  ">
												Vedi Tutti
											</span>

											<ChevronRight />
										</Link>
									</div>
									<p className="text-lg font-body text-gray-600">
										Hai{' '}
										<span className="font-semibold text-blue-600 font-body">
											2 inviti
										</span>{' '}
										in attesa
									</p>
								</div>
							</div>
							<div className="w-fit">{renderContent('pending')}</div>
						</section>

						{/* EVENTI FUTURI */}
						<section>
							<div className="flex justify-between items-center mb-8">
								<div>
									<h2 className="text-4xl font-bold text-gray-900 mb-2 font-body">
										I tuoi Prossimi Eventi
									</h2>
									<p className="text-lg text-gray-600 font-body">
										<span className="font-semibold text-gray-900 font-body">
											{eventsData.accepted.length} eventi
										</span>{' '}
										nelle prossime settimane
									</p>
								</div>
							</div>
							<div className=" xs:mb-24 xl:mb-0">
								{renderContent('accepted')}
							</div>
						</section>
					</div>
				</main>
			</div>
		</div>
	);
};

export default Home;
