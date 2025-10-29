import ProfileIcon from '@/components/ProfileIcon';
import SearchBar from '@/components/SearchBar';
import EventCardDesktop from '@/components/events/EventCardDesktop';
import EventCardSuspendedDesktop from '@/features/EventsHomePage/EventCardSuspendedDesktop.js';
import type { UUID } from 'crypto';
import { AlertCircle, Calendar, Loader2, MapPin } from 'lucide-react';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { supabase } from '../../../config/db.js';

const Home = () => {
	const sliderRef = useRef<HTMLDivElement>(null);
	const [eventsData, setEventsData] = useState({
		pending: [],
		accepted: [],
		refused: [],
	});
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [error, setError] = useState(null);
	const [offset, setOffset] = useState<number>(0);

	const fetchEvents = useCallback(async (): Promise<void> => {
		try {
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
				setEventsData((prevData) => ({
					pending: [...prevData.pending, ...data.pending],
					accepted: [...prevData.accepted, ...data.accepted],
					refused: [...prevData.refused, ...data.refused],
				}));
			}
		} catch (err: any) {
			console.error('Errore fetch eventi:', err);
			setError(err.message || 'Errore nel caricamento degli eventi');
		} finally {
			setIsLoading(false);
		}
	}, [offset]);

	useEffect(() => {
		const slider = sliderRef.current;
		if (!slider) return;

		const onScroll = () => {
			const { scrollHeight, scrollTop, clientHeight } = slider;
			const distanzaDalBasso = scrollHeight - scrollTop - clientHeight;

			if (distanzaDalBasso < 540 && !isLoading) {
				setOffset((prevOffset) => (prevOffset += 16));
			}
		};
		slider.addEventListener('scroll', onScroll);
		return () => slider.removeEventListener('scroll', onScroll);
	}, [isLoading]);

	useEffect(() => {
		fetchEvents();
	}, [offset, fetchEvents]);
	useEffect(() => {
		if (eventsData) {
		}
	}, []);
	// Gestione cambio filtro

	const renderEmptyState = (message: string) => (
		<div className="flex flex-col items-center justify-center py-20 px-4">
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
				<Calendar className="w-8 h-8 text-gray-400" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
			<p className="text-gray-500 text-center max-w-sm">
				{/* {eventsData.description ||
					'Controlla più tardi per nuovi eventi'} */}
			</p>
		</div>
	);

	// 	const renderContent = (type) => {
	// 		if (error) {
	// 			return (
	// 				<div className="flex flex-col items-center justify-center py-20">
	// 					<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
	// 						<AlertCircle className="w-8 h-8 text-red-500" />
	// 					</div>
	// 					<h3 className="text-lg font-medium text-gray-900 mb-2">
	// 						Ops! Qualcosa è andato storto
	// 					</h3>
	// 					<p className="text-gray-500 mb-6 text-center">{error}</p>
	// 					<button
	// 						onClick={() => fetchEvents()}
	// 						className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
	// 					>
	// 						Riprova
	// 					</button>
	// 				</div>
	// 			);
	// 		}

	// 		// if (filteredEvents.length === 0 && !isLoading) {
	// 		// 	return renderEmptyState('Nessun evento trovato');
	// 		// }
	// 		if (type == 'accepted') {
	// 			return (
	// 				<>
	// 					<div className="w-full grid grid-cols-5 gap-6">
	// 						{eventsData.map((event) => (
	// 							<EventCardDesktop key={event.event_id} {...event} />
	// 						))}
	// 					</div>

	// 					{isLoading && (
	// 						<div className="flex flex-col items-center justify-center py-12">
	// 							<Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
	// 							<p className="text-gray-500">Caricamento eventi...</p>
	// 						</div>
	// 					)}
	// 				</>
	// 			);
	// 		}
	// 		if (type == 'suspended') {
	// 			return (
	// 				<div className="flex flex-col items-center justify-center py-20">
	// 					<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
	// 						<AlertCircle className="w-8 h-8 text-red-500" />
	// 					</div>
	// 					<h3 className="text-lg font-medium text-gray-900 mb-2">
	// 						Ops! Qualcosa è andato storto
	// 					</h3>
	// 					<p className="text-gray-500 mb-6 text-center">{error}</p>
	// 					<button
	// 						onClick={() => fetchEvents()}
	// 						className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
	// 					>
	// 						Riprova
	// 					</button>
	// 				</div>
	// 			);
	// 		}
	// 	};
	// 	return (
	// 		<div className="min-h-screen bg-gray-50 w-full box-border">
	// 			{/* Header con gradiente più sottile */}
	// 			<header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md  box-border">
	// 				<div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
	// 					<div className="flex items-center justify-between gap-6">
	// 						<div className="hidden sm:block">
	// 							<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
	// 								Scopri Eventi
	// 							</h1>
	// 							<p className="text-gray-600 text-sm mt-1">
	// 								Trova l'esperienza perfetta per te
	// 							</p>
	// 						</div>

	// 						<ProfileIcon />
	// 					</div>
	// 				</div>
	// 			</header>
	// 			<div className="p-16">
	// 				<section className="flex flex-col gap-5">
	// 					<h1 className="font-body text-text-1 font-bold text-3xl">
	// 						Eventi in Sospeso
	// 					</h1>
	// 					{renderContent('suspended')}
	// 				</section>
	// 				<section className="flex flex-col gap-6">
	// 					<h1 className="font-body text-text-1 font-bold text-3xl">
	// 						Eventi futuri
	// 					</h1>
	// 					{renderContent('accepted')}
	// 				</section>
	// 			</div>
	// 			<main className=" px-4 sm:px-6 lg:px-8 py-8  ">
	// 				{/* Filtri migliorati */}

	// 				{/* Contenuto scrollabile */}
	// 				{/* <div
	// 					ref={sliderRef}
	// 					className="overflow-y-auto max-h-[calc(100vh-16rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent justify-center flex "
	// 				></div> */}
	// 			</main>
	// 		</div>
	// 	);
	// };
	// export default Home;
	const renderContent = (type: string) => {
		if (error) {
			return (
				<div className="flex flex-col items-center justify-center py-20">
					<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Ops! Qualcosa è andato storto
					</h3>
					<p className="text-gray-500 mb-6 text-center">{error}</p>
					<button
						onClick={() => fetchEvents()}
						className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
					>
						Riprova
					</button>
				</div>
			);
		}

		// if (type === 'accepted') {
		// 	return (
		// 		<>
		// 			{/* ✅ GRID con auto-rows per altezza consistente */}
		// 			<div
		// 				className="
		//         grid
		//         grid-cols-1
		//         md:grid-cols-2
		//         lg:grid-cols-3
		//         xl:grid-cols-4
		//         2xl:grid-cols-4
		//         gap-8
		//         auto-rows-fr
		//         "
		// 			>
		// 				{eventsData.map((event) => (
		// 					// const evento = event.evento
		// 					<EventCardDesktop key={event.event_id} {...event} />
		// 				))}
		// 			</div>

		// 			{isLoading && (
		// 				<div className="flex flex-col items-center justify-center py-12">
		// 					<Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
		// 					<p className="text-gray-500">Caricamento eventi...</p>
		// 				</div>
		// 			)}
		// 		</>
		// 	);
		// }

		// if (type === 'suspended') {
		// 	return (
		// 		<div></div>
		// 		// <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
		// 		// 	{/* Eventi in sospeso - Card più grandi */}
		// 		// 	{eventsData.map((event) => (
		// 		// 		<EventCardSuspended key={event.event_id} {...event} />
		// 		// 	))}
		// 		// </div>
		// 	);
		// }

		return null;
	};

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Sidebar qui se ce l'hai */}

			<div className="flex-1">
				{/* ✅ HEADER Sticky */}
				<header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md">
					<div className="mx-auto px-8 py-6">
						<div className="flex items-center justify-between gap-6">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									Scopri Eventi
								</h1>
								<p className="text-gray-600 text-sm mt-1">
									Trova l'esperienza perfetta per te
								</p>
							</div>
							{/* <ProfileIcon /> */}
						</div>
					</div>
				</header>

				{/* ✅ MAIN CONTENT - Scrollabile */}
				<main
					ref={sliderRef}
					className="overflow-y-auto h-[calc(100vh-120px)] px-20 py-12"
				>
					<div className=" flex flex-col gap-16">
						{/* EVENTI IN SOSPESO */}
						<section>
							<div className="flex justify-between items-center mb-8">
								<div>
									<h2 className="text-4xl font-bold text-gray-900 mb-2">
										Eventi in Sospeso
									</h2>
									<p className="text-lg text-gray-600">
										Hai{' '}
										<span className="font-semibold text-blue-600">
											2 inviti
										</span>{' '}
										in attesa
									</p>
								</div>
							</div>

							<div className="flex flex-row gap-8 ">
								{eventsData &&
									eventsData.pending.slice(0, 3).map((event) => (
										// const evento = event.evento
										<EventCardSuspendedDesktop
											key={event.event_id}
											{...event}
										/>
									))}
							</div>
						</section>

						{/* EVENTI FUTURI */}
						<section>
							<div className="flex justify-between items-center mb-8">
								<div>
									<h2 className="text-4xl font-bold text-gray-900 mb-2">
										I tuoi Prossimi Eventi
									</h2>
									<p className="text-lg text-gray-600">
										<span className="font-semibold text-gray-900">
											{eventsData.accepted.length} eventi
										</span>{' '}
										nelle prossime settimane
									</p>
								</div>
							</div>
							<div
								className="
            grid 
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-4
            gap-8
            
            "
							>
								{eventsData &&
									eventsData.accepted.map((event) => (
										// const evento = event.evento
										<EventCardDesktop key={event.event_id} {...event} />
									))}
							</div>
							{eventsData &&
								eventsData.accepted.map((event) => (
									// const evento = event.evento
									<EventCardDesktop key={event.event_id} {...event} />
								))}
							{/* {renderContent(eventsData.accepted)} */}
						</section>
					</div>
				</main>
			</div>
		</div>
	);
};

export default Home;
