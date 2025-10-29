import EventDialog from '@/components/EventDialog';
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Euro,
	Heart,
	MapPin,
	Users,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import defaultpfp from '../../assets/defaultpfp.jpg';

const EventCard = ({
	titolo,
	created_by,
	event_id,
	data,
	luoghi,
	costo,
	utenti,
	partecipanti_count = 0,
	event_imgs,
	eventi_categorie,
	descrizione,
	cover_img,
}: any) => {
	const [pfpUrl, setPfpUrl] = useState(defaultpfp);
	const [isLiked, setIsLiked] = useState(false);
	const carouselRef = useRef(null);
	const [imageError, setImageError] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const navigate = useNavigate();

	// Formatta la data in un formato più leggibile
	const formattedDate = new Date(data).toLocaleDateString('it-IT', {
		day: '2-digit',
		month: 'short',
		// year: 'numeric',
	});

	// Formatta l'orario
	const formattedTime = data
		? new Date(data).toLocaleTimeString('it-IT', {
				hour: '2-digit',
				minute: '2-digit',
		  })
		: '';

	useEffect(() => {
		if (utenti?.profile_pic && !imageError) {
			setPfpUrl(utenti.profile_pic);
		} else {
			setPfpUrl(defaultpfp);
		}
	}, [utenti?.profile_pic, imageError]);

	const handleImageError = () => {
		setImageError(true);
		setPfpUrl(defaultpfp);
	};

	const handleLikeToggle = (e) => {
		e.stopPropagation(); // Evita il trigger del click sulla card
		setIsLiked(!isLiked);
	};
	const handleImageNavigation = (direction) => {
		const totalImages = event_imgs.length;

		if (direction === 'next') {
			setCurrentImageIndex((prev) => (prev + 1) % totalImages);
		} else {
			setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
		}
	};

	const getCostDisplay = () => {
		if (costo === 0 || costo === null || costo === undefined) {
			return { text: 'Gratuito', color: 'text-green-400' };
		}
		return { text: `€${costo}`, color: 'text-accent' };
	};

	const costDisplay = getCostDisplay();

	return (
		// 		<div
		// 			className="bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 cursor-pointer hover:shadow-lg group
		// p-4 flex flex-row gap-5
		// 		  "
		// 		>
		// 			<div className="flex jusitfy-center items-center h-full">
		// 				<div className="flex-shrink-0 flex flex-col items-center justify-center p-2 h-20 w-20 bg-indigo-100 rounded-lg text-indigo-800 font-bold">
		// 					<span className="text-sm uppercase leading-none">
		// 						{new Date(data).toLocaleDateString('it-IT', { month: 'short' })}
		// 					</span>
		// 					<span className="text-3xl leading-none">
		// 						{new Date(data).toLocaleDateString('it-IT', { day: '2-digit' })}
		// 					</span>
		// 					<span className="text-sm uppercase leading-none">
		// 						{new Date(data).toLocaleDateString('it-IT', { year: 'numeric' })}
		// 					</span>
		// 				</div>
		// 			</div>
		// 			{/* Nuovo display per la Data */}

		// 			{/* <div className="h-full">
		// 				<img src={event_imgs[0]} className="w-full h-full" alt="" />
		// 			</div> */}
		// 			<div className="relative h-70 w-1/4 aspect-[4/3]">
		// 				<button
		// 					onClick={() => handleImageNavigation('prev')}
		// 					className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10  rounded-full flex items-center justify-center transition-all duration-200 bg-white hover:bg-white/80"
		// 				>
		// 					<ChevronLeft className="w-6 h-6 text-gray-700" />
		// 				</button>
		// 				<div className="overflow-hidden h-full rounded-xl">
		// 					<div
		// 						className="flex transition-transform duration-500 ease-out h-full w-full"
		// 						style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
		// 						ref={carouselRef}
		// 					>
		// 						{event_imgs.map((imgUrl, index) => {
		// 							return (
		// 								<div className="w-full h-full flex-shrink-0 relative">
		// 									<img
		// 										src={imgUrl}
		// 										key={index}
		// 										alt={`Immagine evento ${index + 1}`}
		// 										className="w-full h-full object-cover"
		// 									/>
		// 								</div>
		// 							);
		// 						})}
		// 					</div>
		// 				</div>

		// 				<button
		// 					onClick={() => handleImageNavigation('next')}
		// 					className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-10
		//           bg-white hover:bg-white/80 h-10   rounded-full shadow-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
		// 				>
		// 					<ChevronRight className="w-6 h-6 text-gray-700" />
		// 				</button>

		// 				{/* Indicatori */}
		// 				<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
		// 					{event_imgs.map((_, index) => (
		// 						<button
		// 							key={index}
		// 							onClick={() => setCurrentImageIndex(index)}
		// 							className={`w-2 h-2 rounded-full transition-all duration-200 ${
		// 								currentImageIndex === index
		// 									? 'bg-white scale-110 shadow-lg'
		// 									: 'bg-white/60 '
		// 							}`}
		// 						/>
		// 					))}
		// 				</div>

		// 				{/* Overlay con titolo */}
		// 			</div>

		// 			<div className="w-2/3 mt-3 flex flex-col gap-3 ">
		// 				<div className="w-2/3 flex flex-col gap-3 ">
		// 					<h1 className="text-5xl font-black font-test">{titolo}</h1>
		// 					<div className="flex flex-col gap-3">
		// 						{/* Data e Ora */}
		// 						{luoghi && (
		// 							<div className="flex items-center gap-3">
		// 								<MapPin className="w-6 h-6 text-primary flex-shrink-0" />
		// 								{/* <p className="text-xl text-[#6b7280] font-body ">{luoghi.nome}</p> */}
		// 								<span className="truncate font-body">
		// 									{luoghi.nome && `${luoghi.nome}, `}
		// 									{luoghi.indirizzo && `${luoghi.indirizzo} `}
		// 								</span>
		// 							</div>
		// 						)}

		// 						{/* Luogo */}

		// 						{/* Footer con prezzo e partecipanti */}
		// 					</div>
		// 					<div className="text-lg font-body leading-relaxed">{descrizione}</div>
		// 					<div className="flex flex-row gap-4">
		// 						{eventi_categorie.map((categoria) => {
		// 							return (
		// 								<div className="p-1.5 rounded-sm bg-red-500">
		// 									{categoria.categorie.nome}
		// 								</div>
		// 							);
		// 						})}
		// 					</div>
		// 				</div>
		// 			</div>
		// 			<div>
		// 				<button className="p-2 rounded-md text-white text-lg bg-primary hover:bg-primary/80">
		// 					Vedi Dettagli
		// 				</button>
		// 				<div className="flex jusitfy-center items-center h-full">
		// 					<div className="flex-shrink-0 flex flex-col items-center justify-center p-2 h-20 w-20 bg-indigo-100 rounded-lg text-indigo-800 font-bold">
		// 						{costo}
		// 					</div>
		// 				</div>
		// 			</div>
		// 		</div>

		<div className="flex flex-col ">
			<img src={cover_img} className="w-full  rounded-2xl" alt="" />
			<div className="p-3">
				<h1 className="font-title text-xl font-black">{titolo}</h1>
			</div>
		</div>
	);
};
export default EventCard;
