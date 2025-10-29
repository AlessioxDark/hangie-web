// import ParticipantsIcon from '@/assets/eventCardIcons/ParticipantsIcon';
// import ProfileIcon from '@/components/ProfileIcon';
// import React from 'react';

// const EventCardSuspendedDesktop = ({
// 	titolo,
// 	created_by,
// 	event_id,
// 	data,
// 	luogo,
// 	costo,
// 	utente,
// 	partecipanti_count = 0,
// 	event_imgs,

// 	descrizione,
// 	cover_img,
// 	gruppo,
// }) => {
// 	const formattedTime = data
// 		? new Date(data).toLocaleTimeString('it-IT', {
// 				day: 'numeric',
// 				month: 'short',
// 				hour: '2-digit',
// 				minute: '2-digit',
// 		  })
// 		: '';

// 	return (
// 		<article
// 			className="flex flex-col shadow-md shadow-black/20 border border-[#E2E8F0] rounded-xl cursor-pointer group w-[30rem]
// 		     relative hover:shadow-black/30 hover:shadow-

// 		     transition-all duration-300
// 	 "
// 		>
// 			{gruppo && (
// 				<div className="absolute top-4 right-4 max-w-[70%]">
// 					<div className="px-3 py-2 bg-primary backdrop-blur-sm rounded-xl shadow-lg">
// 						<div className="flex items-center gap-2">
// 							<div className="w-7 h-7">
// 								<ProfileIcon />
// 							</div>

// 							<span className="text-sm font-bold text-bg-1 truncate">
// 								{gruppo.nome}
// 							</span>
// 						</div>
// 					</div>
// 				</div>
// 			)}

// 			<div className="p-6 flex flex-col gap-4  justify-between flex-1">
// 				<div className="flex flex-col gap-4">
// 					<div className="flex flex-col">
// 						<time className="text-primary font-body text-sm font-bold uppercase tracking-wider">
// 							{formattedTime}
// 						</time>
// 						<h3 className="text-xl font-bold font-body text-text-1 line-clamp-2 leading-tight">
// 							{titolo}
// 						</h3>
// 					</div>
// 				</div>
// 				<div className="flex flex-col gap-4">
// 					<div className="flex flex-col gap-2.5">
// 						<div className="flex flex-row gap-2.5 items-center  ">
// 							<div className="w-6 h-6">
// 								<ParticipantsIcon />
// 							</div>
// 							{/* <span className="text-text-2 font-body text-base font-medium truncate">
// 							{gruppi.partecipanti_gruppo.length} partecipanti
// 						</span> */}
// 							{/* ✅ AVATAR STACK - Stile professionale */}
// 							<div className="flex items-center gap-2">
// 								{gruppo.partecipanti_gruppo.length > 0 ? (
// 									<>
// 										<div className="flex -space-x-2">
// 											{gruppo.partecipanti_gruppo.map((partecipante, index) => (
// 												<div
// 													key={index}
// 													className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden"
// 													title={partecipante.nome}
// 												>
// 													<p>sd</p>
// 													{partecipante.profile_pic ? (
// 														<img
// 															src={partecipante.profile_pic}
// 															alt={partecipante.nome}
// 															className="w-full h-full object-cover"
// 														/>
// 													) : (
// 														<div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
// 															ciao
// 														</div>
// 													)}
// 												</div>
// 											))}

// 											{/* Counter per rimanenti */}
// 											{gruppo.partecipanti_gruppo.length > 3 && (
// 												<div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
// 													<span className="text-xs font-bold text-gray-700">
// 														+{gruppo.partecipanti_gruppo.length - 3}
// 													</span>
// 												</div>
// 											)}
// 										</div>

// 										<span className="text-text-2 font-body text-base truncate">
// 											{1} partecipant
// 											{gruppo.partecipanti_gruppo.length !== 1 ? 'i' : 'e'}
// 										</span>
// 									</>
// 								) : (
// 									<span className="text-sm text-gray-500">
// 										Nessun partecipante
// 									</span>
// 								)}
// 							</div>
// 						</div>
// 					</div>

// 					<div className="flex flex-col gap-4">
// 						<div className="w-full h-[0.3px] bg-text-3"></div>
// 						<div className="flex flex-row items-center gap-3">
// 							<div className="w-12 h-12">
// 								<ProfileIcon />
// 							</div>
// 							<span className="font-body text-text-2 font-semibold text-base truncate">
// 								{utente.nome}
// 							</span>
// 						</div>
// 					</div>
// 					<div className="w-full flex flex-row justify-between gap-6">
// 						<button className="bg-primary text-bg-1 font-bold font-body py-3 px-6 w-full rounded-lg cursor-pointer text-lg hover:bg-primary/80">
// 							Accetta
// 						</button>
// 						<button className="bg-bg-2 text-text-2 border border-text-3 font-bold font-body py-3 px-6 w-full rounded-lg cursor-pointer text-lg hover:bg-bg-3/90">
// 							Rifiuta
// 						</button>
// 					</div>
// 				</div>
// 			</div>
// 		</article>
// 	);
// };

// export default EventCardSuspendedDesktop;
import ParticipantsIcon from '@/assets/eventCardIcons/ParticipantsIcon';
import ProfileIcon from '@/components/ProfileIcon';
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
	scadenza_risposta?: string; // ✅ NUOVO: data scadenza
	giorni_rimasti?: number; // ✅ NUOVO: giorni rimanenti
}

const EventCardSuspendedDesktop: React.FC<EventCardSuspendedProps> = ({
	titolo,
	data,
	utente,
	gruppo,
	scadenza_risposta,
	giorni_rimasti = 3, // Default 3 giorni
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
		if (giorni_rimasti === 0) return 'Scade oggi!';
		if (giorni_rimasti === 1) return 'Scade domani';
		return `Scade tra ${giorni_rimasti} giorni`;
	};

	return (
		<article
			className="
        group
        flex flex-col
        bg-white
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
        max-w-[33rem]
       
      "
		>
			{/* ═══════════════════════════════════════════════════
          HEADER - Gruppo + Scadenza
      ════════════════════════════════════════════════════ */}
			<div
				className="
        flex items-center justify-between gap-3
        px-6 pt-6
        from-blue-50 to-purple-50
      
      "
			>
				{/* ✅ BADGE GRUPPO - Sinistra */}
				{gruppo && (
					<div className=" max-w-[90%]">
						<div className="px-4 py-2 bg-primary backdrop-blur-sm rounded-xl shadow-lg">
							<div className="flex items-center gap-2">
								<div className="w-7 h-7">
									<ProfileIcon />
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
					<span className="text-xs font-bold text-white whitespace-nowrap">
						{getUrgencyText()}
					</span>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════════
          CONTENT - Info Evento
      ════════════════════════════════════════════════════ */}
			<div className="p-6 flex flex-col justify-between h-full ">
				{/* Data + Titolo */}
				<div className="flex flex-col gap-3">
					<div className="flex flex-col ">
						<time className="block text-blue-600 text-sm font-bold uppercase tracking-wider">
							{formattedTime}
						</time>
						<h3 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-1">
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
											// <div
											// 	key={index}
											// 	className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500"
											// 	title={partecipante.nome}
											// >
											// 	{partecipante.profile_pic ? (
											// 		<img
											// 			src={partecipante.profile_pic}
											// 			alt={partecipante.nome}
											// 			className="w-full h-full object-cover"
											// 		/>
											// 	) : (
											// 		<div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
											// 			m
											// 		</div>
											// 	)}
											// </div>
											<div className="w-7 h-7">
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

export default EventCardSuspendedDesktop;
