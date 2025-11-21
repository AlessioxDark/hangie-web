import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import EventDetails from '../events/EventDetails';
import EventDetailsParticipants from '../events/EventDetailsParticipants';
const MountElement = document.getElementById('overlays');

const EventDetailsModal = () => {
	const { isModalOpen, modalData, closeModal } = useModal();
	const { session } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
	const [eventData, setEventData] = useState([]);
	const [currentPage, setCurrentPage] = useState('');
	const fetchEvent = async () => {
		if (isLoading) return;
		try {
			setIsLoading(true);
			const response = await fetch(
				`http://localhost:3000/api/events/${modalData?.event_id}`,
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
			setEventData(data);
		} catch (err: any) {
			console.error('Errore fetch eventi:', err);
			setError(err.message || 'Errore nel caricamento degli eventi');
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		if (modalData?.event_id) {
			fetchEvent();
		}
	}, [modalData?.event_id]);

	const getEventStatus = () => {
		console.log('eventStatus');
		if (eventData?.created_by === session.user.id) {
			console.log('creator');
			return 'creator'; // L'utente è il creatore, vede i pulsanti di modifica
		}
		const userResponse = eventData?.risposte_eventi?.find(
			(risposta) => risposta.utenti.user_id === session.user.id
		);

		if (userResponse) {
			console.log(userResponse.status);
			return userResponse.status;
		}
	};
	const renderContent = () => {
		if (error) {
			return (
				<>
					<div className="p-3 w-full flex justify-end">
						<div className="  text-text-1 cursor-pointer" onClick={closeModal}>
							<X width={40} height={40} />
						</div>
					</div>
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
							<AlertCircle className="w-16 h-16 text-warning" />
						</div>
						<h3 className="text-lg font-medium text-text-1 mb-2">
							Ops! Qualcosa è andato storto
						</h3>
						<p className="text-gray-500 mb-6 text-center">{error}</p>
						<button
							onClick={() => fetchEvent()}
							className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
						>
							Riprova
						</button>
					</div>
				</>
			);
		}
		if (isLoading) {
			return (
				<div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
					<div className=" rounded-full flex items-center justify-center mb-6">
						<Loader2 className="w-16 h-16 text-primary animate-spin" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Caricamento dell'evento
					</h3>
					<p className="text-gray-500 text-center max-w-sm">
						Stiamo scoprendo il tuo evento in questo momento
					</p>
				</div>
			);
		}
		if (currentPage == '') {
			return (
				<EventDetails
					{...eventData}
					setCurrentPage={setCurrentPage}
					event_status={getEventStatus()}
				/>
			);
		}
		if (currentPage == 'participants') {
			return (
				<EventDetailsParticipants
					setCurrentPage={setCurrentPage}
					{...eventData}
				/>
			);
		}
	};

	useEffect(() => {}, [currentPage]);
	return createPortal(
		<>
			{isModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 
             bg-black/40
             transition-opacity duration-300"
					// Chiude il modal cliccando sull'overlay
					aria-modal="true"
					role="dialog"
					aria-labelledby="modal-title"
				>
					<div className=" bg-bg-1  rounded-2xl p-8 w-70/100  overflow-y-auto">
						{renderContent()}
					</div>
					{/* <EventDetails {...eventData} /> */}
				</div>
			)}
		</>,
		MountElement
	);
};

export default EventDetailsModal;
