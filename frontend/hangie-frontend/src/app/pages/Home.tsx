import ProfileIcon from '@/components/ProfileIcon';
import SearchBar from '@/components/SearchBar';
import EventCard from '@/features/EventsHomePage/EventCard';
import type { UUID } from 'crypto';
import { AlertCircle, Calendar, Loader2, MapPin } from 'lucide-react';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { ZodFloat32 } from 'zod';
type FilterType = {
	label: string;
	icon: React.ReactNode | null;
	description: string;
};
type FilterTypes = Record<string, FilterType>;
const FILTER_TYPES: FilterTypes = {
	all: {
		label: 'Tutti',
		icon: null,
		description: 'Tutti gli eventi disponibili',
	},
	today: {
		label: 'Oggi',
		icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
		description: 'Eventi di oggi',
	},
	weekend: {
		label: 'Weekend',
		icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
		description: 'Eventi del prossimo weekend',
	},
	free: {
		label: 'Gratuiti',
		icon: null,
		description: 'Eventi a ingresso gratuito',
	},
	nearby: {
		label: 'Vicino a me',
		icon: <MapPin className="w-4 h-4" aria-hidden="true" />,
		description: 'Eventi nella tua zona',
	},
};
type Categoria = {
	nome: string;
};

type Luogo = {
	nome: string;
	lat: number;
	lon: number;
};

type Utente = {
	user_id: UUID;
	nome: string;
	profile_pic: string | null;
};
type EventDataType = {
	event_id: UUID;
	utenti: Utente;
	luoghi: Luogo;
	data: Date;
	titolo: string;
	categorie: Categoria;
	costo: ZodFloat32 | 0;
};

const Home = () => {
	const sliderRef = useRef<HTMLDivElement>(null);
	const [eventsData, setEventsData] = useState<EventDataType[] | []>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [currentType, setCurrentType] = useState<
		'all' | 'weekend' | 'today' | 'nearby' | 'free'
	>('all');
	const [error, setError] = useState(null);
	const [offset, setOffset] = useState<number>(0);

	const fetchEvents = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			const response = await fetch(
				'http://localhost:3000/api/events/discover',
				{
					method: 'POST',
					body: JSON.stringify({ offset: offset }),
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				console.log(response);
				setError(response.statusText || 'Errore nel caricamento degli eventi');
			}

			const data = await response.json();
			console.log(data);
			setEventsData(data);
		} catch (err: any) {
			console.error('Errore fetch eventi:', err);
			setError(err.message || 'Errore nel caricamento degli eventi');
		} finally {
			setIsLoading(false);
		}
	}, [offset]);

	const filteredEvents = useMemo(() => {
		switch (currentType) {
			case 'today': {
				const today = new Date().toLocaleDateString('it-IT');
				return eventsData.filter(
					(event: EventDataType) =>
						new Date(event.data).toLocaleDateString('it-IT') === today
				);
			}

			case 'weekend': {
				const now = new Date();
				const oneDayInMs = 24 * 60 * 60 * 1000;

				return eventsData.filter((event: EventDataType) => {
					const eventDate = new Date(event.data);
					const dayName = eventDate.toLocaleDateString('en-EN', {
						weekday: 'long',
					});
					const diffInDays =
						Math.abs(eventDate.getTime() - now.getTime()) / oneDayInMs;

					return (
						(dayName === 'Saturday' || dayName === 'Sunday') && diffInDays < 8
					);
				});
			}

			case 'free':
				return eventsData.filter((event: EventDataType) => event.costo === 0);

			case 'nearby':
			case 'all':
			default:
				return eventsData;
		}
	}, [eventsData, currentType]);

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

	// Gestione cambio filtro
	const handleFilterChange = useCallback(
		(newType: 'all' | 'weekend' | 'today' | 'nearby' | 'free') => {
			setCurrentType(newType);
			setOffset(0);

			if (currentType === 'nearby') {
				// Gestione geolocalizzazione
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							const userLat = position.coords.latitude;
							const userLon = position.coords.longitude;

							console.log(userLat);
							console.log(userLon);
							try {
								fetch('http://localhost:3000/api/places/nearby', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({
										user_pos: { lat: userLat, lon: userLon },
									}),
								})
									.then((res) => res.json())
									.then((data) => console.log('nearby', data));
							} catch (err) {
								console.log(err);
							}
						},
						(error) => {
							setError(`Errore di geolocalizzazione: ${error.message}`);
							console.error(`Errore di geolocalizzazione: ${error.message}`);
						}
					);
				}
			}
		},
		[]
	);

	const renderEmptyState = (message: string) => (
		<div className="flex flex-col items-center justify-center py-20 px-4">
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
				<Calendar className="w-8 h-8 text-gray-400" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
			<p className="text-gray-500 text-center max-w-sm">
				{FILTER_TYPES[currentType]?.description ||
					'Controlla più tardi per nuovi eventi'}
			</p>
		</div>
	);

	const renderContent = () => {
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

		if (filteredEvents.length === 0 && !isLoading) {
			return renderEmptyState('Nessun evento trovato');
		}

		return (
			<>
				<div className="w-7/10 grid grid-cols-4 grid-rows-1  gap-6">
					{filteredEvents.map((event) => (
						<EventCard key={event.event_id} {...event} />
					))}
				</div>

				{isLoading && (
					<div className="flex flex-col items-center justify-center py-12">
						<Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
						<p className="text-gray-500">Caricamento eventi...</p>
					</div>
				)}
			</>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50 w-4/5 box-border">
			{/* Header con gradiente più sottile */}
			<header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md  box-border">
				<div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between gap-6">
						<div className="hidden sm:block">
							<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
								Scopri Eventi
							</h1>
							<p className="text-gray-600 text-sm mt-1">
								Trova l'esperienza perfetta per te
							</p>
						</div>

						<div className="flex-1 max-w-2xl">
							<SearchBar />
						</div>

						<ProfileIcon />
					</div>
				</div>
			</header>

			<main className=" px-4 sm:px-6 lg:px-8 py-8  ">
				{/* Filtri migliorati */}
				<div className="mb-8">
					<div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide h-15">
						{Object.entries(FILTER_TYPES).map(([type, config]) => {
							const isActive = currentType === type;

							return (
								<button
									key={type}
									onClick={() => handleFilterChange(type)}
									className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full font-medium whitespace-nowrap
                    transition-all duration-200 transform hover:scale-105
                    ${
											isActive
												? 'bg-primary text-white shadow-lg shadow-primary/25'
												: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
										}
                  `}
								>
									{config.icon}
									{config.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Contenuto scrollabile */}
				<div
					ref={sliderRef}
					className="overflow-y-auto max-h-[calc(100vh-16rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent justify-center flex "
				>
					{renderContent()}
				</div>
			</main>
		</div>
	);
};
export default Home;
