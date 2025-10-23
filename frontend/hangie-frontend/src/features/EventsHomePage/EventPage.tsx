import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit3,
	Euro,
	Heart,
	Hourglass,
	Loader2,
	MapPin,
	Share2,
	User,
	Users,
	XCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../../config/db.js';
const EventPage = () => {
	const navigate = useNavigate();
	const { event_id } = useParams();
	const [eventData, setEventData] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [userStatus, setUserStatus] = useState('none');
	const [isCreator, setIsCreator] = useState(false);
	const carouselRef = useRef(null);

	useEffect(() => {
		const fetchEventData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				fetch(`http://localhost:3000/api/events/${event_id}`, {
					method: 'GET',
				})
					.then((res) => res.json())
					.then(async (data) => {
						setEventData(data);
						try {
							const {
								data: { session: sessionData },
								error,
							} = await supabase.auth.getSession();

							if (sessionData.user.id === eventData?.utenti.user_id) {
								setIsCreator(true);
							}
							setIsLoading(false);
						} catch (error) {
							console.error('Errore durante il recupero dei dati:', error);
							setError(error.message);
						}
					});
				setIsLoading(false);
			} catch (err) {
				console.error('Errore durante il recupero dei dati:', err);
				setError(err.message);
			}
		};

		// Controlla che event_id sia presente prima di fare la fetch
		if (event_id) {
			fetchEventData();
		}
	}, [event_id]);
	const getEventStatus = () => {
		if (!eventData?.data)
			return {
				status: 'unknown',
				label: 'Data da definire',
				color: 'text-gray-500',
			};

		const now = new Date();
		const eventDate = new Date(eventData.data);
		const registrationDeadline = new Date(eventData.scadenza_iscrizioni);

		if (eventDate < now) {
			return {
				status: 'ended',
				label: 'Evento terminato',
				color: 'text-gray-500',
				bgColor: 'bg-gray-100',
				icon: <Clock className="w-4 h-4" />,
			};
		}

		if (registrationDeadline < now) {
			return {
				status: 'registration_closed',
				label: 'Iscrizioni chiuse',
				color: 'text-red-600',
				bgColor: 'bg-red-50',
				icon: <XCircle className="w-4 h-4" />,
			};
		}

		const timeDiff = eventDate - now;
		const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

		if (daysDiff <= 7) {
			return {
				status: 'soon',
				label: `Tra ${daysDiff} giorni`,
				color: 'text-orange-600',
				bgColor: 'bg-orange-50',
				icon: <AlertCircle className="w-4 h-4" />,
			};
		}

		return {
			status: 'active',
			label: 'Iscrizioni aperte',
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			icon: <CheckCircle className="w-4 h-4" />,
		};
	};

	const formatItalianDate = () => {
		if (!eventData?.data) return 'Data da definire';

		const data = new Date(eventData.data);
		const formatter1 = new Intl.DateTimeFormat('it-IT', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
		const formatter2 = new Intl.DateTimeFormat('it-IT', {
			hour: 'numeric',
			minute: 'numeric',
		});

		return `${formatter1.format(data)} alle ${formatter2.format(data)}`;
	};

	const formatRegistrationDeadline = () => {
		if (!eventData?.scadenza_iscrizioni) return 'Da definire';

		const deadline = new Date(eventData.scadenza_iscrizioni);
		const formatter = new Intl.DateTimeFormat('it-IT', {
			day: 'numeric',
			month: 'long',
			hour: 'numeric',
			minute: 'numeric',
		});

		return formatter.format(deadline);
	};

	const handleImageNavigation = (direction) => {
		const totalImages = eventData?.event_imgs?.length;

		if (direction === 'next') {
			setCurrentImageIndex((prev) => (prev + 1) % totalImages);
		} else {
			setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
		}
	};

	const handleStatusChange = async (newStatus) => {
		try {
			const eventStatus = getEventStatus();
			if (
				eventStatus.status === 'ended' ||
				eventStatus.status === 'registration_closed'
			) {
				return; // Non permettere cambiamenti se l'evento è terminato o le iscrizioni sono chiuse
			}
			const {
				data: { session: sessionData },
				error: errorSession,
			} = await supabase.auth.getSession();
			if (errorSession) throw Error;
			if (sessionData) {
				fetch(`http://localhost:3000/api/event/request/${event_id}`, {
					method: 'POST',
					body: JSON.stringify({ status: newStatus, event_id: event_id }),
					Authorization: `Bearer ${sessionData.access_token}`,
				}).then((res) => {
					console.log(newStatus);
					setUserStatus(newStatus);
				});
			} else {
				navigate('/login');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const renderParticipantAvatars = (
		participants,
		label,
		iconColor = 'text-green-500'
	) => {
		console.log(participants);
		if (!participants || participants.length === 0) return null;

		const displayParticipants = participants.slice(0, 4);
		const remainingCount = participants.length - 4;

		return (
			<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ">
				<div className="flex items-center gap-3 mb-4">
					{label === 'Partecipano' ? (
						<CheckCircle className={`w-5 h-5 ${iconColor}`} />
					) : (
						<XCircle className="w-5 h-5 text-red-500" />
					)}
					<h3 className="font-semibold text-black text-lg">{label}</h3>
					<span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full font-medium">
						{participants.length}
					</span>
				</div>

				<div className="flex items-center gap-3">
					{displayParticipants.map((utente, index) => (
						<div key={index} className="relative group">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
								{utente.nome?.charAt(0) || 'U'}
							</div>
							<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
								{utente.nome || 'Utente'}
							</div>
						</div>
					))}

					{remainingCount > 0 && (
						<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium border-2 border-dashed border-gray-300">
							+{remainingCount}
						</div>
					)}
				</div>
			</div>
		);
	};

	if (isLoading || !eventData) {
		return (
			<div className="min-h-screen w-4/5 bg-[#fbfbfe] flex flex-col items-center justify-center">
				<Loader2 className="w-12 h-12 text-[#2563eb] animate-spin mb-4" />
				<p className="text-gray-600 text-lg">Caricamento evento...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen  w-4/5 bg-[#fbfbfe] flex flex-col items-center justify-center">
				<div className="text-center">
					<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-black mb-2">
						Evento non trovato
					</h2>
					<p className="text-gray-600 mb-6">
						{error || "L'evento richiesto non esiste"}
					</p>
					<button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
						Torna alla Home
					</button>
				</div>
			</div>
		);
	}

	const eventStatus = getEventStatus();

	return (
		<div className="min-h-screen w-4/5 overflow-scroll bg-[#fbfbfe]">
			{/* Header con breadcrumb */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-30 backdrop-blur-md ">
				<div className="w-full  px-4 sm:px-6 lg:px-8 py-4">
					<div className=" items-center flex justify-between">
						<button
							className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-200 font-medium"
							onClick={() => {
								navigate('/');
							}}
						>
							<ArrowLeft className="w-4 h-4" />
							Torna indietro
						</button>

						<div
							className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${eventStatus.bgColor} ${eventStatus.color}`}
						>
							{eventStatus.icon}
							{eventStatus.label}
						</div>
					</div>
				</div>
			</div>

			{/* Galleria a larghezza piena */}
			<div className="relative">
				<div className="h-[50vh] lg:h-[60vh] overflow-hidden">
					<div
						className="flex transition-transform duration-500 ease-out h-full"
						style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
						ref={carouselRef}
					>
						{eventData?.event_imgs?.map((imgUrl, index) => {
							return (
								<div key={index} className="w-full flex-shrink-0 relative">
									<img
										src={imgUrl}
										alt={`Immagine evento ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</div>
							);
						})}
					</div>
				</div>

				{/* Controlli galleria */}
				<button
					onClick={() => handleImageNavigation('prev')}
					className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
				>
					<ChevronLeft className="w-6 h-6 text-gray-700" />
				</button>

				<button
					onClick={() => handleImageNavigation('next')}
					className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
				>
					<ChevronRight className="w-6 h-6 text-gray-700" />
				</button>

				{/* Indicatori */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
					{eventData?.event_imgs?.map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentImageIndex(index)}
							className={`w-3 h-3 rounded-full transition-all duration-200 ${
								currentImageIndex === index
									? 'bg-white scale-110 shadow-lg'
									: 'bg-white/60 '
							}`}
						/>
					))}
				</div>

				{/* Overlay con titolo */}
				<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
					<div className=" mx-auto">
						<h1 className="text-3xl lg:text-5xl font-bold text-white mb-2 leading-tight">
							{eventData.titolo || 'Evento senza titolo'}
						</h1>
						<p className="text-white/90 text-lg lg:text-xl font-medium">
							{formatItalianDate()}
						</p>
					</div>
				</div>
			</div>

			<div className=" mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Colonna principale */}
					<div className="lg:col-span-2 space-y-8">
						{/* Informazioni evento */}
						<div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
								<div className="flex-1 space-y-4">
									<div className="flex items-center gap-3 text-gray-600">
										<Calendar className="w-5 h-5 text-primary flex-shrink-0" />
										<span className="font-medium">{formatItalianDate()}</span>
									</div>

									<div className="flex items-start gap-3 text-gray-600">
										<MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
										<span className="font-medium">
											{eventData?.luoghi?.nome && `${eventData.luoghi.nome}, `}
											{eventData?.luoghi?.indirizzo &&
												`${eventData.luoghi.indirizzo} `}
										</span>
									</div>

									<div className="flex items-center gap-3">
										<Euro className="w-5 h-5 text-primary" />
										<span
											className={`font-bold text-lg ${
												eventData?.costo === 0 ? 'text-[#10b981]' : 'text-black'
											}`}
										>
											{eventData?.costo === 0
												? 'Gratuito'
												: `€${eventData?.costo} a persona`}
										</span>
									</div>

									<div className="flex items-center gap-3 text-gray-600">
										<User className="w-5 h-5 text-primary" />
										<span className="font-medium">
											Creato da{' '}
											<span className="font-bold text-black">
												{eventData?.utenti?.creatore}
											</span>
										</span>
									</div>

									<div className="flex items-center gap-3 text-gray-600">
										<Clock className="w-5 h-5 text-primary" />
										<span className="font-medium">
											Scadenza iscrizioni: {formatRegistrationDeadline()}
										</span>
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-row sm:flex-col gap-3">
									<button
										onClick={() => setIsLiked(!isLiked)}
										className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 ${
											isLiked
												? 'bg-red-50 text-red-500 scale-105'
												: 'bg-gray-50 hover:bg-gray-100 text-gray-600'
										}`}
									>
										<Heart
											className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
										/>
									</button>

									<button className="flex items-center justify-center w-14 h-14 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-gray-600 hover:text-[#2563eb]">
										<Share2 className="w-5 h-5" />
									</button>

									{isCreator && (
										<button className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl w-14 h-14">
											<Edit3 className="w-5 h-5" />
										</button>
									)}
								</div>
							</div>
						</div>

						{/* Descrizione evento */}
						{eventData?.descrizione && (
							<div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
								<h2 className="text-2xl font-bold text-black mb-2">
									Descrizione
								</h2>
								<p className="text-gray-600 leading-relaxed text-lg">
									{eventData.descrizione}
								</p>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Widget partecipazione */}
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
							<h2 className="text-xl font-bold text-black mb-6">
								La tua partecipazione
							</h2>

							<div className="space-y-3 mb-8">
								<button
									onClick={() => {
										if (userStatus == 'accepted') {
											handleStatusChange('pending');
										} else if (
											userStatus === 'rejected' ||
											userStatus === 'pending' ||
											userStatus == 'noneF'
										)
											handleStatusChange('accepted');
									}}
									disabled={
										eventStatus.status === 'ended' ||
										eventStatus.status === 'registration_closed'
									}
									className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-semibold transition-all duration-200 ${
										userStatus === 'accepted'
											? 'bg-[#10b981] text-white shadow-lg '
											: eventStatus.status === 'ended' ||
											  eventStatus.status === 'registration_closed'
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: 'bg-green-50 text-green-600 hover:bg-[#10b981] hover:text-white'
									}`}
								>
									<CheckCircle className="w-5 h-5" />
									Parteciperò
								</button>

								<button
									onClick={() => {
										if (userStatus == 'rejected') {
											handleStatusChange('pending');
										} else if (
											userStatus === 'accepted' ||
											userStatus === 'pending' ||
											userStatus == 'none'
										)
											handleStatusChange('rejected');
									}}
									disabled={
										eventStatus.status === 'ended' ||
										eventStatus.status === 'registration_closed'
									}
									className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-semibold transition-all duration-200 ${
										userStatus === 'rejected'
											? 'bg-red-500 text-white shadow-lg '
											: eventStatus.status === 'ended' ||
											  eventStatus.status === 'registration_closed'
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white '
									}`}
								>
									<XCircle className="w-5 h-5" />
									Non posso partecipare
								</button>
							</div>

							{/* Statistiche */}
							<div className="pt-6 border-t border-gray-200">
								<div className="flex items-center gap-2 text-gray-600 mb-3">
									<Users className="w-4 h-4" />
									<span className="text-sm font-medium">
										{(eventData?.risposte?.partecipanti.length || 0) +
											(eventData?.riosposte?.rifiutatori.length || 0)}{' '}
										risposte totali
									</span>
								</div>

								<div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
									<div
										className="bg-gradient-to-r from-[#10b981] to-[#059669] h-3 rounded-full transition-all duration-500 ease-out"
										style={{
											width: `${
												eventData?.risposte?.partecipanti?.length
													? (eventData.risposte?.partecipanti.length /
															(eventData.risposte?.partecipanti.length +
																(eventData?.risposte?.rifiutatori?.length ||
																	0))) *
													  100
													: 0
											}%`,
										}}
									></div>
								</div>

								<div className="text-center text-sm font-medium text-gray-600">
									{eventData?.risposte?.partecipanti.length || 0} partecipanti
									confermati
								</div>
							</div>
						</div>

						{/* Lista partecipanti */}
						<div className="space-y-6">
							{renderParticipantAvatars(
								eventData?.risposte?.partecipanti,
								'Partecipano',
								'text-[#10b981]'
							)}
							{renderParticipantAvatars(
								eventData?.risposte?.rifiutatori,
								'Non partecipano'
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventPage;
