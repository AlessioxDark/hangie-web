import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'; // Necessario per le trasformazioni
import { X } from 'lucide-react';
import React from 'react';

const SortableImg = ({ image, index, removeImg }) => {
	// **********************************************
	// * COMPONENTE: SortableImage (da inserire sopra CreateEventForm)
	// **********************************************
	// 1. Usa l'hook useSortable per rendere l'elemento trascinabile
	const {
		attributes,
		listeners,
		setNodeRef, // Riferimento al DOM
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: image.url, // L'ID deve corrispondere all'ID nell'array items di SortableContext
	});

	// 2. Applica le trasformazioni CSS per il trascinamento e l'animazione
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		// Alza l'elemento trascinato in cima (Z-Index alto)
		zIndex: isDragging ? 99 : 1,
		// Opacità per mostrare che è in trascinamento (opzionale)
		opacity: isDragging ? 0.6 : 1,
	};

	return (
		<fieldset
			key={index}
			// Collega il ref, lo stile, gli attributi e i listeners forniti da dnd-kit
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners} // Questi attivano il trascinamento al click e movimento
			// Applica le tue classi di stile e la logica della cover
			className={`w-40 h-40 relative group border-2 rounded-xl p-0 overflow-hidden flex-shrink-0 cursor-move 
                ${
									image.name === 'cover'
										? 'border-primary shadow-xl'
										: 'border-gray-300'
								}`}
		>
			{/* 1. Legend: Solo testo 'cover' */}
			{image.name === 'cover' && (
				<legend
					className={`text-sm font-bold text-primary px-2 ml-2 bg-bg-1 -mt-3.5 z-10 relative`}
				>
					Cover
				</legend>
			)}

			{/* Bottone di rimozione (Deve usare z-index alto per essere cliccabile) */}
			<div
				className="absolute top-2 right-2 p-1.5 rounded-full bg-text-2 hover:bg-text-2/80 transition-colors cursor-pointer text-white z-20 shadow-lg"
				onClick={(e) => {
					e.stopPropagation(); // Importante per non attivare il D&D sul click del bottone
					removeImg(image);
				}}
				aria-label={`Rimuovi immagine ${index + 1}`}
			>
				<X size={18} color={'#FFFFFF'} />
			</div>

			{/* Immagine */}
			<img
				src={image.url}
				alt={`Anteprima immagine ${index + 1}`}
				className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
			/>
		</fieldset>
	);
};
// **********************************************

export default SortableImg;
