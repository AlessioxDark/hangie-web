import ChevronRight from '@/assets/other/ChevronRight.js';
import ProfileIcon from '@/components/ProfileIcon';
import SearchBar from '@/components/SearchBar';
import EventCardDesktop from '@/components/events/EventCardDesktop';
import EventCardSuspendedDesktop from '@/features/EventsHomePage/EventCardSuspendedDesktop.js';
import type { UUID } from 'crypto';
import {
	AlertCircle,
	Calendar,
	CircleChevronRight,
	Loader2,
	MapPin,
} from 'lucide-react';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Link } from 'react-router';
import { supabase } from '../../../config/db.js';

const HomeDesktop = () => {
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

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 px-4 w-full justify-center">
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
				<Calendar className="w-8 h-8 text-gray-400" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-2">
				Nessun Evento per il momento
			</h3>
			<p className="text-gray-500 text-center max-w-sm">
				{/* {eventsData.description ||
					'Controlla più tardi per nuovi eventi'} */}
			</p>
		</div>
	);

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

		return null;
	};

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
							{eventsData.pending.length > 0 ? (
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
							) : (
								renderEmptyState()
							)}
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

							{eventsData.accepted.length > 0 ? (
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
									{eventsData.accepted.map((event) => (
										// const evento = event.evento
										<EventCardDesktop key={event.event_id} {...event} />
									))}
								</div>
							) : (
								renderEmptyState()
							)}
						</section>
					</div>
				</main>
			</div>
		</div>
	);
};

export default HomeDesktop;
