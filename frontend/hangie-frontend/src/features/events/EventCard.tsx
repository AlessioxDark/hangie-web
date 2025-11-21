import DollarIcon from '@/assets/icons/DollarIcon';
import MapIcon from '@/assets/icons/MapIcon';
import ParticipantsIcon from '@/assets/icons/ParticipantsIcon';
import ProfileIcon from '@/components/ProfileIcon';
import { useModal } from '@/contexts/ModalContext';

/*
todo
Non toccare niente altro, cerca di risolvere al meglio rpoblema altezze diverse, 
magari potresti centrare tutta la parte ceh non riguarda pfp in tutto lo spazio rimanente */
const EventCard = ({
	titolo,
	created_by,
	event_id,
	data,
	luogo,
	costo,
	utente,
	partecipanti_count = 0,
	event_imgs,

	descrizione,
	cover_img,
	gruppo,
}) => {
	const formattedTime = data
		? new Date(data).toLocaleTimeString('it-IT', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit',
		  })
		: '';

	const { openModal, setModalData } = useModal();
	return (
		<article
			className="flex flex-col  border border-[#E2E8F0] rounded-xl cursor-pointer group
		     hover:-translate-y-2 relative
		  shadow-sm hover:shadow-2xl
		     transition-all duration-300
	 "
			onClick={() => {
				openModal();
				setModalData({ event_id });
			}}
		>
			<img
				src={cover_img}
				className="w-full rounded-t-xl h-56 object-cover flex-shrink-0"
				alt="Immagine cover evento"
				loading="lazy"
			/>

			{gruppo && (
				<div className="absolute top-3 left-3 max-w-[70%]">
					<div className="px-3 py-2 bg-text-1/80 backdrop-blur-md rounded-xl shadow-lg">
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

			<div className="p-6 flex flex-col gap-4  justify-between flex-1">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col">
						<time className="text-primary font-body text-sm font-bold uppercase tracking-wider">
							{formattedTime}
						</time>
						<h3 className="text-xl font-bold font-body text-text-1 line-clamp-1 leading-tight">
							{titolo}
						</h3>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2.5">
						<div className="flex flex-row gap-2.5 items-center">
							<div className="w-6 h-6  flex-shrink-0 mt-0.5">
								<MapIcon color={'#64748b'} />
							</div>
							<span className="text-text-2 font-body text-base truncate">
								{luogo.nome}, {luogo.cap}, {luogo.citta}, {luogo.paese}
							</span>
						</div>

						<div className="flex flex-row gap-2.5 items-center  ">
							<div className="w-6 h-6">
								<DollarIcon color={'#64748b'} />
							</div>
							<span className="text-text-2 font-body font-semibold text-base truncate">
								{costo}€
							</span>
						</div>
						<div className="flex flex-row gap-2.5 items-center  ">
							<div className="w-6 h-6">
								<ParticipantsIcon color={'#64748b'} />
							</div>
							{/* <span className="text-text-2 font-body text-base font-medium truncate">
							{gruppi.partecipanti_gruppo.length} partecipanti
						</span> */}
							{/* ✅ AVATAR STACK - Stile professionale */}
							<div className="flex items-center gap-2">
								{gruppo.partecipanti_gruppo.length > 0 ? (
									<>
										<div className="flex -space-x-2">
											{gruppo.partecipanti_gruppo.map((partecipante, index) => (
												<div className="w-7 h-7" key={partecipante.user_id}>
													<ProfileIcon />
												</div>
											))}

											{/* Counter per rimanenti */}
											{gruppo.partecipanti_gruppo.length > 3 && (
												<div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
													<span className="text-xs font-bold text-gray-700">
														+{gruppo.partecipanti_gruppo.length - 3}
													</span>
												</div>
											)}
										</div>

										<span className="text-text-2 font-body font-medium text-base truncate">
											{gruppo.partecipanti_gruppo.length} partecipant
											{gruppo.partecipanti_gruppo.length !== 1 ? 'i' : 'e'}
										</span>
									</>
								) : (
									<span className="text-sm text-gray-500">
										Nessun partecipante
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="w-full h-[0.3px] bg-text-3"></div>
						<div className="flex flex-row items-center gap-3">
							<div className="w-15 h-15">
								<ProfileIcon />
							</div>
							<span className="font-body text-text-2 font-semibold text-base truncate">
								{utente.nome}
							</span>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
};
export default EventCard;
