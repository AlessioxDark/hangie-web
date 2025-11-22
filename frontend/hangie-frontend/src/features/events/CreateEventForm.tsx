import { useModal } from '@/contexts/ModalContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import FormInput from '../CreateEvent/FormInput';
import FormTextarea from '../CreateEvent/FormTextarea';
// Componente Textarea

const CreateEventForm = () => {
	const { closeModal } = useModal();
	const [images, setImages] = useState([]);
	const fileInputRef = useRef(null);
	const schema = z.object({
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
		costo: z.number(),
		cap: z
			.string()
			.min(5, 'il cap deve essere composto da 5 cifre')
			.max(5, 'il cap deve essere composto da 5 numeri'),
		citta: z.string(),
	});
	type FormFields = z.infer<typeof schema>;
	const methods = useForm({
		resolver: zodResolver(schema),
		mode: 'onTouched',
	});

	const {
		register,
		handleSubmit,
		trigger,
		setValue,
		formState: { errors, isSubmitting },
		getValues,
		setError,
		clearErrors,
		watch,
	} = methods;

	const removeImg = (clickedImage) => {
		setImages((prevImages) => prevImages.filter((img) => img !== clickedImage));
	};
	const handleFileChange = (event) => {
		const files = event.target.files;
		if (files.length === 0) return;

		// Convertiamo i file selezionati in URL temporanei
		const newImages = Array.from(files).map((file, index) => ({
			url: URL.createObjectURL(file), // URL temporaneo per l'anteprima
			file,
			name: index + 1,
		}));

		// Aggiungiamo i nuovi URL all'array di immagini esistente
		setImages((prevImages) => [...prevImages, ...newImages]);

		event.target.value = null;
	};
	const handleButtonClick = useCallback(() => {
		// Clicca sull'elemento input file nascosto
		fileInputRef.current.click();
	}, []);
	const [imageError, setImageError] = useState(false); // Stato per l'errore

	const onSubmit = () => {};
	return (
		<div
			className={`w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-bg-1`}
		>
			<form
				className="flex flex-col"
				onSubmit={() => {
					handleSubmit(onSubmit);
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
						{imageError && (
							<p className="text-sm font-semibold text-red-600 -mt-2">
								Per favore, carica almeno un'immagine per l'evento.
							</p>
						)}

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
							error={errors.data_inizio}
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
							<FormInput
								id="indirizzo"
								label="Indirizzo / Luogo"
								placeholder="Via Roma, 12, 00100 Roma"
								type="text"
								register={register}
								error={errors.indirizzo}
							/>
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
									type="number"
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
						type="button" // Uso type="button" e chiamo la funzione che gestisce la validazione e l'invio
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
