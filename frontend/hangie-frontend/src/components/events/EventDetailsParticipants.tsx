import { useModal } from '@/app/pages/ModalContext';
import ChevronLeft from '@/assets/other/ChevronLeft';
import { X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import PartecipanteCard from './PartecipanteCard';

const FILTER_TYPES = ['Confermati', 'In attesa', 'Rifiutati'];
const EventDetailsParticipants = ({
	risposte_eventi,
	titolo,
	setCurrentPage,
}) => {
	const { closeModal } = useModal();
	const [query, setQuery] = useState('');
	const [currentFilter, setCurrentFilter] = useState('');
	const [currentRisposte, setCurrentRisposte] = useState([]);

	const renderFilteredAnswers = useCallback(() => {
		if (currentFilter == '') {
			{
				setCurrentRisposte(risposte_eventi);
			}
		}
		if (query !== '') {
			const queryRegex = new RegExp(query, 'i');
			const nuoveRisposte = risposte_eventi.filter((risposta) => {
				return risposta.utenti.nome.match(queryRegex);
			});

			setCurrentRisposte(nuoveRisposte);
		}
		if (currentFilter == 'Confermati') {
			const nuoveRisposte = risposte_eventi.filter((risposta) => {
				return risposta.status == 'accepted';
			});
			setCurrentRisposte(nuoveRisposte);
		}
		if (currentFilter == 'In attesa') {
			const nuoveRisposte = risposte_eventi.filter((risposta) => {
				return risposta.status == 'pending';
			});
			setCurrentRisposte(nuoveRisposte);
		}
		if (currentFilter == 'Rifiutati') {
			const nuoveRisposte = risposte_eventi.filter((risposta) => {
				return risposta.status == 'rejected';
			});

			setCurrentRisposte(nuoveRisposte);
		}
	}, [currentFilter, query, risposte_eventi]);
	useEffect(() => {
		renderFilteredAnswers();
	}, [currentFilter, query]);
	return (
		<div className="flex flex-col gap-12">
			<div className="flex flex-col gap-4">
				<div className="w-full flex justify-between">
					<h1 className="text-text-1 font-body font-bold text-4xl">{titolo}</h1>
					<div className="  text-text-1 cursor-pointer" onClick={closeModal}>
						<X width={40} height={40} />
					</div>
				</div>
				<div>
					<button
						className="flex flex-row gap-1 items-center rounded-2xl cursor-pointer  justify-center"
						onClick={() => {
							setCurrentPage('');
						}}
					>
						<ChevronLeft />
						<span className="text-primary font-semibold font-body text-xl">
							Torna Indietro
						</span>
					</button>
					<div className="flex flex-col mt-6 gap-4">
						<h1 className="text-text-1 font-body font-semibold text-3xl ">
							Partecipanti
						</h1>
						<div className="flex flex-row w-full  gap-4 items-center">
							<div
								className="
          bg-gray-100 flex-1 
                            rounded-4xl 
                            focus-within:ring-2 
                            focus-within:ring-blue-500
                            p-2 shadow-inner transition-shadow
                            flex items-start
                            
          "
							>
								<input
									className={`
                min-h-10 max-h-32
                whitespace-pre-wrap
                w-full p-2  outline-none font-body text-lg text-text-1 items-start overflow-y-auto
             
                `}
									placeholder="Inserisci un Utente"
									onInput={(e) => {
										setQuery(e.target.value);
									}}
									data-placeholder="Scrivi un messaggio..."
								/>
							</div>
						</div>
						<div className="flex flex-row gap-4 items-center">
							<span className="font-bold font-body text-text-2 text-xl">
								Filtra:{' '}
							</span>
							<div className="flex w-full flex-row gap-4 items-center">
								{FILTER_TYPES.map((filter) => {
									return (
										<div
											onClick={() => {
												if (currentFilter === filter) {
													setCurrentFilter('');
												} else {
													setCurrentFilter(filter);
												}
											}}
											className={`px-5 py-2 ${
												currentFilter == filter
													? 'bg-primary text-bg-1 shadow-lg shadow-primary/50'
													: 'bg-bg-2 text-text-2 border border-text-2 hover:bg-bg-3 hover:shadow-md'
											} font-body   text-xl cursor-pointer
                
                
                px-4 py-2 
             
              font-semibold 
              rounded-full 
          
              transition-all duration-200 
              shadow-sm

             
              `}
										>
											{filter}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4 overflow-y-auto px-1">
				{currentRisposte.map((risposta) => {
					return <PartecipanteCard {...risposta} />;
				})}
			</div>
		</div>
	);
};

export default EventDetailsParticipants;
