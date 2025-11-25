import { useChat } from '@/components/Layouts/desktop/chats/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import {
	closestCenter,
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	horizontalListSortingStrategy, // Utilità fondamentale per riordinare l'array
	SortableContext,
	useSortable,
} from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import FormInput from '../CreateEvent/FormInput';
import FormTextarea from '../CreateEvent/FormTextarea';
// Componente Textarea
import { supabase } from '../../config/db.js';
import ImageInput from '../CreateEventForm/ImageInput.js';
import SortableImg from '../CreateEventForm/SortableImg.js';
const CreateEventForm = () => {
	const IMAGE_LIMIT = 4;
	const { closeModal } = useModal();
	const { session } = useAuth();
	const [images, setImages] = useState([]);
	const schema = z
		.object({
			titolo: z.string().min(1, 'il titolo è obbligatorio'),
			descrizione: z
				.string()
				.min(1, 'la descrizione è obbligatoria')
				.min(30, 'la descrizione deve essere minimo 30 caratteri')
				.max(350, 'La descrizione può essere massimo 350 caratteri'),
			data: z
				.string()
				.min(1, 'La data di iscrizione è obbligatoria')
				.pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
				.refine((date) => date > new Date(), {
					message: 'La data di scadenza deve essere futura.',
				}),
			data_scadenza: z
				.string()
				.min(1, 'La data di iscrizione è obbligatoria')
				.pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
				.refine((date) => date > new Date(), {
					message: 'La data di scadenza deve essere futura.',
				}),
			indirizzo: z.string().min(1, "l'indirizzo è obbligatorio"),
			costo: z.number().min(0, 'il costo non può essere negativo'),
			cap: z
				.string()
				.min(5, 'il cap deve essere composto da 5 cifre')
				.max(5, 'il cap deve essere composto da 5 numeri'),
			citta: z.string().min(1, 'La città e obbligatoria'),
			nome_luogo: z.string().min(1, 'è obbligatorio dare un nome al luogo'),
		})
		// 3. REGOLA COMPOSITA: Confronta data evento e scadenza
		.refine((data) => data.data < data.data_scadenza, {
			message:
				"La data dell'evento deve essere successiva alla scadenza iscrizione.",
			// Indica a React Hook Form di associare l'errore al campo 'data'
			path: ['data'],
		});
	const methods = useForm({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = methods;
	const { currentGroup, currentGroupData } = useChat();

	const [imageError, setImageError] = useState(false); // Stato per l'errore

	const onSubmit = async (data) => {
		console.log('session', session);
		console.log(imageError);
		console.log(images.length);
		if (images.length > IMAGE_LIMIT) {
			console.log('troppe');
			setImageError({
				message: `Puoi inserire massimo ${IMAGE_LIMIT} immagini`,
			});
		}
		if (images.length === 0) {
			setImageError({
				message: `Inserire almeno un'immagine`,
			});
			return;
		}

		if (imageError) {
			return;
		}
		try {
			// FASE 1: Creiamo l'evento nel DB (solo dati testuali)
			// Nota: Non inviamo 'images' qui
			console.log('inviato');
			const response = await fetch(
				'http://localhost:3000/api/events/add/create-event',
				{
					method: 'POST',
					headers: {
						'Content-type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({
						data: { ...data, group_id: currentGroup }, // Niente images qui
					}),
				}
			);
			console.log('richiesta');
			const result = await response.json();

			if (!response.ok) {
				console.log('male');
				throw new Error(result.error || 'Errore creazione evento');
			}

			const newEventId = result.event_id; // Assumi che l'API restituisca l'ID
			console.log('ok');
			console.log('Evento creato, ID:', newEventId);

			// FASE 2: Upload Diretto delle Immagini su Supabase Storage
			const uploadPromises = images.map(async (img, index) => {
				const fileExt = img.file.name.split('.').pop();
				const fileName = `${newEventId}/${img.name}.${fileExt}`;
				const filePath = `${fileName}`;
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('eventi')
					.upload(filePath, img.file, {
						upsert: true,
						contentType: img.type,
						cacheControl: '3600',
					});

				if (uploadError) throw uploadError;
				const { data: urlData } = supabase.storage
					.from('eventi')
					.getPublicUrl(uploadData.path);
				return urlData.publicUrl;
			});

			const uploadedUrls = await Promise.all(uploadPromises);

			const cover_url = uploadedUrls[0];
			const { data: coverData, error: coverError } = await supabase
				.from('eventi')
				.update({ cover_img: cover_url })
				.eq('event_id', newEventId);
			if (coverError) throw coverError;
			console.log('Tutte le immagini caricate con successo!');
			closeModal(); // Chiudi solo se tutto è andato bene
		} catch (error) {
			console.error('Errore durante il processo:', error);
			// Qui puoi gestire l'errore (es. mostrare un toast notification)
		}
	};
	return (
		<div
			className={`w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-bg-1`}
		>
			<form
				className="flex flex-col"
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit(onSubmit)();
				}}
			>
				{/* Intestazione */}
				<div className={`px-8 pt-8 pb-4 border-b border-bg-3`}>
					<div className="flex justify-between items-center">
						<h1 className={`text-text-1 font-body font-bold text-4xl`}>
							Crea Evento
						</h1>
						<button
							type="button"
							className={`text-text-2 cursor-pointer transition-colors p-1 rounded-full hover:bg-bg-3`}
							onClick={closeModal}
							aria-label="Chiudi Modale"
						>
							<X width={30} height={30} />
						</button>
					</div>
				</div>

				{/* Contenuto del Form (Step 1) */}
				<div className="p-8 flex flex-col gap-3">
					<ImageInput
						imageError={imageError}
						setImageError={setImageError}
						images={images}
						setImages={setImages}
					/>

					{/* Titolo e Descrizione */}
					<div className="flex flex-col gap-3">
						<FormInput
							id="titolo"
							label="Titolo Evento"
							placeholder="Es: Mostra d'Arte Contemporanea"
							type="text"
							register={register}
							error={errors.titolo}
						/>
						<FormTextarea
							id="descrizione"
							label="Descrizione"
							placeholder="Descrivi l'evento: cosa, chi, quando e perché."
							register={register}
							error={errors.descrizione}
						/>
					</div>

					{/* Date e Costo */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<FormInput
							id="data"
							label="Data Evento (Data e Ora)"
							type="datetime-local"
							register={register}
							error={errors.data}
						/>
						<FormInput
							id="data_scadenza"
							label="Scadenza Iscrizione"
							type="datetime-local"
							register={register}
							error={errors.data_scadenza}
						/>
						<FormInput
							id="costo"
							label="Costo (€)"
							placeholder="0.00"
							type="number" // Lasciamo text per regex e input corretto
							register={register}
							error={errors.costo}
						/>
					</div>
					<div className="flex flex-col gap-4">
						<h1 className="font-body text-text-1 text-xl font-medium">
							Dettagli sul Luogo
						</h1>
						<div className="flex flex-col gap-6">
							<div className="flex flex-row gap-4">
								<FormInput
									id="nome_luogo"
									label="Nome Luogo"
									placeholder="Casa di Marco"
									type="text"
									register={register}
									error={errors.nome_luogo}
								/>
								<FormInput
									id="indirizzo"
									label="Indirizzo / Luogo"
									placeholder="Via Roma, 12, 00100 Roma"
									type="text"
									register={register}
									error={errors.indirizzo}
								/>
							</div>
							<div className="flex flex-row gap-4">
								<FormInput
									id="citta"
									label="Citta / Provincia"
									placeholder="Roma"
									type="text"
									register={register}
									error={errors.citta}
								/>
								<FormInput
									id="cap"
									label="CAP"
									placeholder="00100"
									type="text"
									register={register}
									error={errors.cap}
								/>
							</div>
						</div>
					</div>
					{/* Indirizzo */}
				</div>

				{/* Footer e Pulsante Crea */}
				<div className={`flex justify-center p-4 bg-bg-2 border-t border-bg-3`}>
					<button
						type="submit" // Uso type="button" e chiamo la funzione che gestisce la validazione e l'invio
						className={`px-9 py-4 bg-primary text-white font-bold rounded-xl 
                        hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg cursor-pointer`}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creazione...' : 'Crea e Pubblica Evento'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateEventForm;
