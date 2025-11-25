import {
	closestCenter,
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
} from '@dnd-kit/sortable';
import React, { useCallback, useRef } from 'react';
import SortableImg from './SortableImg';

const ACCEPTED_EXTENSIONS = ['jpg', 'png', 'jpeg', 'webm', 'svg'];
const ImageInput = ({
	imageError,

	images,
	setImageError,
	setImages,
}) => {
	const fileInputRef = useRef(null);
	const removeImg = (clickedImage) => {
		setImages((prevImages) => prevImages.filter((img) => img !== clickedImage));
		setImages((prevImages) => {
			return prevImages.map((img, index) => {
				return { ...img, name: index == 0 ? 'cover' : index + 1 };
			});
		});
	};
	const handleFileChange = (event) => {
		const files = event.target.files;

		if (files.length === 0) {
			setImageError({
				message: `Inserire almeno un'immagine`,
			});
			return;
		}
		for (let i = 0; i < files.length; i++) {
			const ext = files[i].name.split('.')[1];
			console.log(ext);
			if (!ACCEPTED_EXTENSIONS.includes(ext)) {
				setImageError({
					message: `Accettiamo solo ${ACCEPTED_EXTENSIONS.join(', ')}`,
				});
				event.target.value = null;
				return;
			}
		}
		// Convertiamo i file selezionati in URL temporanei
		const newImages = Array.from(files).map((file, index) => ({
			url: URL.createObjectURL(file), // URL temporaneo per l'anteprima
			file,
			type: file.type,
			ext: file.name.split('.')[1],
			name:
				images.length > 0
					? images.length == 0
						? 'cover'
						: images.length
					: index == 0
					? 'cover'
					: index,
		}));
		console.log(newImages);
		// Aggiungiamo i nuovi URL all'array di immagini esistente
		setImages((prevImages) => [...prevImages, ...newImages]);

		event.target.value = null;
	};
	const handleButtonClick = useCallback(() => {
		// Clicca sull'elemento input file nascosto
		fileInputRef.current.click();
	}, []);
	const handleDragEnd = (event) => {
		const { active, over } = event;

		// Se l'elemento è stato spostato
		if (active.id !== over.id) {
			// Usa il setImages basato sulla funzione di aggiornamento
			setImages((currentImages) => {
				// Trova gli indici degli elementi trascinati in base all'ID (l'URL)
				const oldIndex = currentImages.findIndex(
					(img) => img.url === active.id
				);
				const newIndex = currentImages.findIndex((img) => img.url === over.id);

				// 1. Esegui il riordino effettivo dell'array
				const reordered = arrayMove(currentImages, oldIndex, newIndex);

				// 2. Riassegna il 'name' (Cover/Indice) dopo il riordino
				return reordered.map((img, index) => ({
					...img,
					// Il primo elemento (index 0) è sempre la cover
					name: index === 0 ? 'cover' : index,
				}));
			});
		}
	};
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }) // Consente un leggero movimento prima di attivare il D&D
	);
	return (
		<div className="flex flex-col gap-3">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				style={{ display: 'none' }}
				accept="image/*"
				multiple
			/>
			<h1
				className={`font-body text-text-1 text-xl font-semibold flex items-center gap-2`}
			>
				Carosello immagini <span className="text-red-500 text-sm">*</span>
			</h1>

			<div className="flex flex-row  gap-4 overflow-x-auto pb-4 items-end">
				{/* Bottone Aggiungi Immagine */}
				<div
					className={`bg-bg-2 rounded-xl border-2 ${
						imageError
							? 'border-red-500 ring-4 ring-red-100'
							: `border-text-2 border-dashed`
					} 
                                    aspect-square min-w-[150px] w-40 flex items-center justify-center cursor-pointer 
                                    hover:bg-bg-3 transition-all duration-200 shadow-inner`}
					onClick={handleButtonClick}
					aria-label="Aggiungi Immagine"
				>
					<span className={`font-body font-bold text-text-2 text-6xl`}>+</span>
				</div>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter} // Strategia di collisione
					onDragEnd={handleDragEnd} // Funzione di callback
				>
					{/* Il SortableContext contiene gli elementi da trascinare */}
					<SortableContext
						items={images.map((img) => img.url)} // Array di ID (URL) degli elementi trascinabili
						strategy={horizontalListSortingStrategy}
					>
						<div className="flex flex-row gap-4">
							{images.map((image, index) => (
								<SortableImg
									key={image.url}
									image={image}
									index={index}
									removeImg={removeImg}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
				{/* Anteprime Immagini */}
			</div>
			{imageError && (
				<p className="text-sm  text-red-600 -mt-2">{imageError.message}</p>
			)}
		</div>
	);
};

export default ImageInput;
