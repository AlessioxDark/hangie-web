import { useChat } from '@/components/Layouts/desktop/chats/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import FormInput from '../CreateEvent/FormInput';
import FormTextarea from '../CreateEvent/FormTextarea';
// Componente Textarea
import { supabase } from '../../config/db.js';
const CreateEventForm = () => {
	const { closeModal } = useModal();
	const { session } = useAuth();
	const [images, setImages] = useState([]);
	const fileInputRef = useRef(null);
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
	const ACCEPTED_EXTENSIONS = ['jpg', 'png', 'jpeg', 'webm', 'svg'];
	const { currentGroup, currentGroupData } = useChat();
	const removeImg = (clickedImage) => {
		setImages((prevImages) => prevImages.filter((img) => img !== clickedImage));
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
			name: index == 0 ? 'cover' : index,
		}));
		console.log(newImages[0].file.size);
		// Aggiungiamo i nuovi URL all'array di immagini esistente
		setImages((prevImages) => [...prevImages, ...newImages]);

		event.target.value = null;
	};
	const handleButtonClick = useCallback(() => {
		// Clicca sull'elemento input file nascosto
		fileInputRef.current.click();
	}, []);
	const [imageError, setImageError] = useState(false); // Stato per l'errore

	const onSubmit = async (data) => {
		console.log('session', session);
		console.log(imageError);

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
					{/* Sezione Immagini */}
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

						<div className="flex flex-row flex-wrap gap-4 overflow-x-auto pb-4">
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
								<span className={`font-body font-bold text-text-2 text-6xl`}>
									+
								</span>
							</div>

							{/* Anteprime Immagini */}
							{images.map((image, index) => (
								<div key={index} className="w-40 h-40 relative group">
									<div
										className="absolute top-2 right-2 p-1.5 rounded-full bg-text-2 hover:bg-text-2/80 transition-colors cursor-pointer text-white  z-10 shadow-lg"
										onClick={() => removeImg(image)}
										aria-label={`Rimuovi immagine ${index + 1}`}
									>
										<X size={18} fill={'#000000'} />
									</div>
									<img
										src={image.url}
										alt={`Anteprima immagine ${index + 1}`}
										className="rounded-xl w-full h-full object-cover shadow-md  transition-transform group-hover:scale-[1.02]"
									/>
								</div>
							))}
						</div>
						{imageError && (
							<p className="text-sm font-semibold text-red-600 -mt-2">
								{imageError.message}
							</p>
						)}
					</div>

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
