import { useModal } from '@/app/pages/ModalContext';
import DollarIcon from '@/assets/eventCardIcons/DollarIcon';
import MapIcon from '@/assets/eventCardIcons/MapIcon';
import ParticipantsIcon from '@/assets/eventCardIcons/ParticipantsIcon';
import CalendarIcon from '@/assets/eventPageIcons/CalendarIcon';
import ChevronLeft from '@/assets/other/ChevronLeft';
import ChevronRight from '@/assets/other/ChevronRight';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ProfileIcon from '../ProfileIcon';
const EventDetails = ({
	event_imgs,
	descrizione,
	titolo,
	costo,
	data,
	luoghi,
	setCurrentPage,
	utenti,
	risposte_eventi,
	event_status,
}) => {
	const { closeModal, isOpen, modalData } = useModal();

	const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

	const carouselRef = useRef(null);
	const imageRef = useRef(null);
	const [scrollWidth, setScrollWidth] = useState(0);
	const [descLimit, setDescLimit] = useState(350);

	// LOGICA CORRETTA PER IL CALCOLO DELLA LARGHEZZA DI SCORRIMENTO
	const calculateScrollWidth = () => {
		if (imageRef.current) {
			// Misura la larghezza effettiva della prima immagine
			const itemWidth = imageRef.current.offsetWidth;
			// La distanza di scorrimento è la larghezza dell'item + il gap (16px)
			const scrollDistance = itemWidth + 16;
			setScrollWidth(scrollDistance);

			// Assicura che l'indice corrente non sia fuori dai limiti
			const maxIndex = Math.max(0, (event_imgs?.length || 0) - 3);
			if (currentCarouselIndex > maxIndex) {
				setCurrentCarouselIndex(maxIndex);
			}
		}
	};
	useEffect(() => {
		// Aggiungo un piccolo ritardo per assicurarmi che il DOM abbia finito di renderizzare
		// prima di misurare l'elemento, cosa cruciale per le dimensioni reattive.
		const timeoutId = setTimeout(() => {
			calculateScrollWidth();
		}, 100);

		window.addEventListener('resize', calculateScrollWidth);

		// Cleanup
		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('resize', calculateScrollWidth);
		};
	}, [event_imgs?.length | 0]);

	const maxIndex = Math.max(0, (event_imgs?.length || 0) - 3);

	const handleNext = () => {
		setCurrentCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
	};

	const handlePrev = () => {
		setCurrentCarouselIndex((prev) => Math.max(prev - 1, 0));
	};

	useEffect(() => {
		if (isOpen && event_imgs?.length > 0) {
			const timeoutId = setTimeout(() => {
				calculateScrollWidth();
			}, 100); // Ritardo per consentire il rendering

			window.addEventListener('resize', calculateScrollWidth);

			return () => {
				clearTimeout(timeoutId);
				window.removeEventListener('resize', calculateScrollWidth);
			};
		}
	}, [isOpen, event_imgs?.length]); // Esegui su apertura e cambio dati
	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('it-IT', {
			month: '2-digit',
			day: '2-digit',
		});
	};
	const formatTime = (date) => {
		return new Date(date).toLocaleTimeString('it-IT', {
			minute: '2-digit',
			hour: '2-digit',
		});
	};

	const partecipanti = risposte_eventi
		?.slice(0, 3)
		.filter((risposta) => {
			return risposta.status == 'accepted';
		})
		.map((risposta) => {
			return risposta.utenti.nome;
		});
	console.log(partecipanti);
	return (
		<div className="">
			{/* <h1>Evento</h1> */}
			<div className="flex flex-col gap-6">
				<div className="w-full flex justify-between">
					<h1 className="text-text-1 font.body font-bold text-4xl">{titolo}</h1>
					<div className="  text-text-1 cursor-pointer" onClick={closeModal}>
						<X width={40} height={40} />
					</div>
				</div>
				{/* Carosello */}
				<div className="w-full relative overflow-hidden rounded-xl ">
					{/* Freccia Sinistra (Previous) */}
					<button
						className={`absolute top-1/2 -translate-y-1/2 left-4 p-2 rounded-full z-20 
                        bg-white/70 hover:bg-white transition-opacity duration-300 shadow-md 
                        ${
													currentCarouselIndex === 0
														? 'opacity-30 cursor-not-allowed'
														: 'opacity-100 cursor-pointer'
												}`}
						onClick={handlePrev}
						disabled={currentCarouselIndex === 0}
						aria-label="Immagine precedente"
					>
						<ChevronLeft />
					</button>

					{/* Contenitore Immagini (si muove con la trasformazione) */}
					<div
						className={`flex flex-row gap-4 transition-transform duration-500 ease-in-out`}
						ref={carouselRef}
						style={{
							// Logica di scorrimento fondamentale: Spostamento = Indice * Larghezza_Blocco_Misurata
							transform: `translateX(-${currentCarouselIndex * scrollWidth}px)`,
						}}
					>
						{(event_imgs || []).map((img_url, index) => {
							return (
								<img
									key={index}
									ref={index === 0 ? imageRef : null}
									className="aspect-[4/3] w-1/3 flex-shrink-0 object-cover rounded-lg"
									src={img_url}
									alt={`Immagine evento ${index + 1}`}
									loading="lazy"
								/>
							);
						})}
					</div>

					{/* Indicatori di Paginazione */}
					<div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
						{(
							Array.from({
								length: Math.ceil(event_imgs?.length / 3),
							}) || []
						).map((_, index) => (
							<div
								key={index}
								className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors duration-300 
                                    ${
																			index === currentCarouselIndex
																				? 'bg-primary'
																				: 'bg-bg-1'
																		}`}
								onClick={() => setCurrentCarouselIndex(index)}
								aria-label={`Vai all'immagine ${index + 1}`}
							/>
						))}
					</div>

					{/* Freccia Destra (Next) */}
					<button
						className={`absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full z-20 
                        bg-white/70 hover:bg-white transition-opacity duration-300 shadow-md 
                        ${
													currentCarouselIndex === (event_imgs?.length || 0)
														? 'opacity-30 cursor-not-allowed'
														: 'opacity-100 cursor-pointer'
												}`}
						onClick={handleNext}
						disabled={currentCarouselIndex === (event_imgs?.length || 0) - 1}
						aria-label="Immagine successiva"
					>
						<ChevronRight />
					</button>
				</div>

				{/* Copiare il layout di claude ai su questa pagina soprattuto su questi riquadri, fare ritocchi a uqesti rquadri a tutte le cose nuove e passare lla pagina partecipanti, aggiungere chips, searchbar */}

				<div className="grid grid-cols-2 gap-4">
					{/* Data & Ora - INFO PRIMARIA */}
					<div className="col-span-2 flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
						<div className="w-12 h-12 text-white">
							<CalendarIcon color={'#2463eb'} />
						</div>
						<div className="flex-1">
							<p className="text-lg font-bold text-primary uppercase tracking-wide mb-1 font-body">
								Quando
							</p>
							<div>
								<span className="font-body text-base text-text-1">
									{formatDate(data)}
								</span>{' '}
								<span className="font-body  text-primary font-bold text-lg">
									alle {formatTime(data)}
								</span>
							</div>
						</div>
					</div>

					{/* Luogo */}
					<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
						<div className="w-12 h-12 text-white">
							<MapIcon color={'#008236'} />
						</div>
						<div>
							<p className="font-body text-lg font-bold text-green-700 uppercase tracking-wide mb-1">
								Dove
							</p>
							<div>
								<p className="font-body font-bold text-xl text-text-1">
									La casa di Marco
								</p>
								<p className="font-body  text-text-2">
									{luoghi?.indirizzo}, {luoghi?.citta}
								</p>
							</div>
						</div>
					</div>

					{/* Costo */}
					<div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
						<div className="w-12 h-12 text-white">
							<DollarIcon color={'#8200db'} />
						</div>
						<div>
							<p className="font-body text-lg font-semibold text-purple-700 uppercase tracking-wide mb-1">
								Costo
							</p>
							<p className="text-3xl font-bold text-text-1">
								€{costo?.toFixed(2)}
							</p>
							<p className="text-base text-text-2">a persona</p>
						</div>
					</div>
				</div>
				<div className="font-body text-text-1 flex flex-col gap-3 ">
					<h1 className="text-2xl text-text-1 font-body font-bold">
						Descrizione
					</h1>

					<div className="text-lg">
						<div className="">
							<span className="font-body text-text-1">
								{descrizione?.slice(0, descLimit)}
							</span>
							{descrizione?.length > 350 &&
								(descLimit == 350 ? (
									<span
										className=" ml-2 font-body font-bold text-primary  cursor-pointer"
										onClick={() => {
											setDescLimit(descrizione?.length);
										}}
									>
										Leggi tutto
									</span>
								) : (
									<span
										onClick={() => {
											setDescLimit(350);
										}}
										className=" ml-2 font-body font-bold text-primary cursor-pointer"
									>
										Leggi meno
									</span>
								))}
						</div>
					</div>
				</div>

				{/* Organizzatore */}
				<div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl ring ring-gray-300">
					<div className="w-16 h-16">
						<ProfileIcon user_id={utenti?.user_id} />
					</div>
					<div>
						<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
							Organizzatore
						</p>
						<p className="text-lg font-bold text-gray-900">
							{utenti?.creatore}
						</p>
					</div>
				</div>

				<div className="col-span-2 flex items-center  p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 justify-between">
					<div className="flex flex-row gap-4">
						<div className="w-12 h-12 text-white">
							<ParticipantsIcon color={'#2463eb'} />
						</div>
						<div className="flex-1">
							<p className="text-lg font-bold text-primary uppercase tracking-wide mb-1 font-body">
								PARTECIPANTI
							</p>
							<div>
								<span className="font-body text-base text-text-1">
									All'evento Partecipano anche
								</span>{' '}
								<span className="font-body  text-primary font-bold ">
									{partecipanti?.join(', ')}
								</span>
							</div>
						</div>
					</div>
					<div
						className="w-14 h-14 cursor-pointer "
						onClick={() => {
							setCurrentPage('participants');
						}}
					>
						<ChevronRight />
					</div>
				</div>
				{event_status == 'pending' && (
					<div className="w-full flex justify-between flex-row gap-12">
						<button
							className="w-full bg-primary text-bg-1 font-bold rounded-2xl text-2xl 
            

		            px-4 py-4
		            hover:bg-primary/80
		            transition-colors
		            duration-300

		             
		             cursor-pointer
		          
            "
						>
							Accetta
						</button>
						<button
							className="w-full  font-bold rounded-2xl text-2xl 
            

		            px-4 py-4
		           
		            transition-colors
		            duration-300

		              bg-bg-1 text-text-2
		            border-2 border-text-3/60
		           
		            hover:bg-bg-2/80
		            hover:border-text-2/80
		             cursor-pointer
		          "
						>
							Rifiuta
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default EventDetails;
