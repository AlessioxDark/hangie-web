import ParticipantsIcon from '@/assets/icons/ParticipantsIcon';
import ProfileIcon from '@/components/ProfileIcon';
import { useModal } from '@/contexts/ModalContext';
import { Clock1 } from 'lucide-react'; // Aggiungi questa icona
import React from 'react';

interface Gruppo {
	nome: string;
	avatar?: string;
	partecipanti_gruppo: Array<{
		nome: string;
		profile_pic?: string;
	}>;
}

interface Utente {
	nome: string;
	profile_pic?: string;
}

interface EventCardSuspendedProps {
	titolo: string;
	created_by: string;
	event_id: string;
	data: string;
	luogo?: {
		nome: string;
		cap: string;
		citta: string;
		paese: string;
	};
	costo?: number;
	utente: Utente;
	partecipanti_count?: number;
	event_imgs?: string[];
	descrizione?: string;
	cover_img?: string;
	gruppo?: Gruppo;
	scadenza?: string; // ✅ NUOVO: data scadenza
	giorni_rimasti?: number; // ✅ NUOVO: giorni rimanenti
	maxW: string;
	line_clamp: string;
}

const EventCardSuspended: React.FC<EventCardSuspendedProps> = ({
	titolo,
	data,
	utente,
	gruppo,
	scadenza,
	giorni_rimasti = 3,

	line_clamp = 'line-clamp-1',
}) => {
	const formattedTime = data
		? new Date(data).toLocaleTimeString('it-IT', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit',
		  })
		: '';

	const partecipantiArray = gruppo?.partecipanti_gruppo || [];
	const avatarsToDisplay = partecipantiArray.slice(0, 3);
	const remainingCount = Math.max(0, partecipantiArray.length - 3);

	// ✅ Calcola urgenza

	const getUrgencyText = () => {
		// 1. Calcola la differenza in millisecondi (la base di tutto)
		const scadenza_timestamp = new Date(scadenza).getTime();
		const distanza_ms = scadenza_timestamp - Date.now();

		// Se la scadenza è passata
		if (distanza_ms <= 0) {
			return 'Scaduto/a';
		}

		let tempo_residuo = distanza_ms;
		console.log(scadenza_timestamp, distanza_ms);
		// 2. Calcoli basati su millisecondi medi per anno/mese (ATTENZIONE: impreciso)

		// Anni: 365.25 giorni * 24h * 60m * 60s * 1000ms
		const ms_in_anno = 31557600000;
		const anni = Math.floor(tempo_residuo / ms_in_anno);
		tempo_residuo %= ms_in_anno; // Rimuovi gli anni

		// Mesi: 30.44 giorni medi
		const ms_in_mese = 2629800000;
		const mesi = Math.floor(tempo_residuo / ms_in_mese);
		tempo_residuo %= ms_in_mese; // Rimuovi i mesi

		// Giorni: 24h * 60m * 60s * 1000ms
		const ms_in_giorno = 86400000;
		const giorni = Math.floor(tempo_residuo / ms_in_giorno);
		tempo_residuo %= ms_in_giorno; // Rimuovi i giorni

		// Ore e Minuti (calcolo preciso)
		const ore = Math.floor(tempo_residuo / (1000 * 60 * 60));
		tempo_residuo %= 1000 * 60 * 60;

		const minuti = Math.floor(tempo_residuo / (1000 * 60));

		// 3. Costruzione della stringa di output (mostra solo l'unità più grande)
		const parti = [];
		if (anni > 0) parti.push(`${anni}a`);
		if (mesi > 0) parti.push(`${mesi}M`);
		if (giorni > 0) parti.push(`${giorni}g`);
		if (ore > 0 && anni === 0 && mesi === 0) parti.push(`${ore}h`); // Mostra ore solo se non ci sono mesi/anni

		if (parti.length === 0) {
			return `Scade tra ${minuti}m`;
		}

		return `Scade tra ${parti.slice(0, 2).join(' e ')}`; // Mostra solo le due unità più grandi
	};
	const { openModal } = useModal();
	return (
		<article
			className={`
        group
        flex flex-col
        bg-bg-1
        border border-gray-200
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:shadow-2xl
        hover:-translate-y-2
        hover:border-gray-300
        transition-all duration-300
        cursor-pointer
        w-full
     
       
      `}
			onClick={() => {
				openModal({ data: { event_id: event_id }, type: 'EVENT_MODAL' });
			}}
		>
			{/* ═══════════════════════════════════════════════════
          HEADER - Gruppo + Scadenza
      ════════════════════════════════════════════════════ */}
			<div
				className="
        flex items-center justify-between gap-4
        px-6 pt-6
        from-blue-50 to-purple-50
      
      "
			>
				{/* ✅ BADGE GRUPPO - Sinistra */}
				{gruppo && (
					<div className=" max-w-[90%]">
						<div className="px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl shadow-lg">
							<div className="flex items-center gap-2">
								<div className="w-7 h-7">
									<img src={gruppo.group_cover_img} alt="" />
								</div>

								<span className="text-sm font-bold text-bg-1 truncate">
									{gruppo.nome}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* ✅ BADGE SCADENZA - Destra */}
				<div
					className={`
          flex items-center gap-2
          px-3 py-2
          bg-primary
          rounded-xl
          flex-shrink-0
          
        `}
				>
					<svg
						className="w-4 h-4 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span className="text-sm font-body font-bold text-white whitespace-nowrap ">
						{getUrgencyText()}
					</span>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════════
          CONTENT - Info Evento
      ════════════════════════════════════════════════════ */}
			<div className="p-6 flex flex-col justify-between h-full ">
				{/* Data + Titolo */}
				<div className="flex flex-col gap-4">
					<div className="flex flex-col ">
						<time className="block text-blue-600 text-base font-bold uppercase tracking-wider">
							{formattedTime}
						</time>
						<h3
							className={`text-2xl font-bold text-gray-900 leading-tight ${line_clamp}`}
						>
							{titolo}
						</h3>
					</div>

					{/* Partecipanti */}
					<div className="ml-2">
						<div className="flex items-center gap-4 ">
							<div className="w-5 h-5 flex-shrink-0 text-gray-400">
								<ParticipantsIcon />
							</div>

							{partecipantiArray.length > 0 ? (
								<div className="flex items-center gap-2.5 flex-1 min-w-0">
									<div className="flex -space-x-2 flex-shrink-0">
										{avatarsToDisplay.map((partecipante, index) => (
											<div className="w-7 h-7" key={partecipante.user_id}>
												<ProfileIcon />
											</div>
										))}

										{remainingCount > 0 && (
											<div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
												<span className="text-xs font-semibold text-gray-700">
													+{remainingCount}
												</span>
											</div>
										)}
									</div>

									<span className="text-base text-text-2 font-medium truncate">
										{partecipantiArray.length} partecipant
										{partecipantiArray.length !== 1 ? 'i' : 'e'}
									</span>
								</div>
							) : (
								<span className="text-base text-gray-500">
									Nessun partecipante ancora
								</span>
							)}
						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════════════════
            ORGANIZZATORE
        ════════════════════════════════════════════════════ */}
				<div>
					<div className=" pb-2 pt-4  ">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 flex-shrink-0">
								<ProfileIcon />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-base font-semibold text-text-2 truncate">
									{utente.nome}
								</p>
							</div>
						</div>
					</div>

					<div className="pt-5  border-t border-gray-100 ">
						<div className="flex gap-3">
							<button
								className="
                flex-1
                px-6 py-3
                bg-primary text-bg-1
                rounded-xl
                font-bold 
                hover:bg-primary/80             
                transition-colors
                duration-300 

                 text-lg  
                 cursor-pointer 
              "
							>
								Accetta Invito
							</button>
							<button
								className="
                flex-1
                px-6 py-3
                bg-bg-1 text-text-2
                border-2 border-text-3/60
                rounded-xl
                font-bold 
                hover:bg-bg-2/80
                hover:border-text-2/80
                transition-colors 
                duration-300 
                text-lg  
                cursor-pointer       
              "
							>
								Rifiuta
							</button>
						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════════════════
            AZIONI - Accetta/Rifiuta
        ════════════════════════════════════════════════════ */}
			</div>
		</article>
	);
};

export default EventCardSuspended;
