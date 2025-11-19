import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
const hobbies = [
	{ id: 1, label: 'Giardinaggio' },
	{ id: 2, label: 'Scrittura Creativa' },
	{ id: 3, label: 'Birdwatching' },
	{ id: 4, label: 'Pittura' },
	{ id: 5, label: 'Suonare uno strumento' },
	{ id: 6, label: 'Escursionismo' },
	{ id: 7, label: 'Cucina' },
	{ id: 8, label: 'Sartoria' },
	{ id: 9, label: 'Falegnameria' },
	{ id: 10, label: 'Yoga' },
	{ id: 11, label: 'Fotografia' },
	{ id: 12, label: 'Videogiochi' },
	{ id: 13, label: 'Lettura' },
	{ id: 14, label: 'Scacchi' },
	{ id: 15, label: 'Collezionismo' },
	{ id: 16, label: 'Danza' },
	{ id: 17, label: 'Coro' },
	{ id: 18, label: 'Lavorazione della ceramica' },
	{ id: 19, label: 'Volontariato' },
	{ id: 20, label: 'Calcio' },
	{ id: 21, label: 'Ciclismo' },
	{ id: 22, label: 'Arrampicata sportiva' },
	{ id: 23, label: 'Programmazione' },
	{ id: 24, label: 'Giardinaggio urbano' },
	{ id: 25, label: 'Padel' },
];
const RegisterStep3 = ({}: any) => {
	const {
		setValue,
		formState: { errors },

		watch,
	} = useFormContext();

	const preferenzeSelezionate = watch('preferenze');
	const handleChipClick = (hobby) => {
		const isAlreadySelected = preferenzeSelezionate.includes(hobby.label);
		if (isAlreadySelected) {
			const nuovePreferenze = preferenzeSelezionate.filter(
				(preferenza) => preferenza !== hobby.label
			);
			setValue('preferenze', nuovePreferenze, { shouldValidate: true });
		} else {
			const nuovePreferenze = [...preferenzeSelezionate, hobby.label];
			setValue('preferenze', nuovePreferenze, { shouldValidate: true });
		}
	};
	useEffect(() => {
		console.log(errors);
		if (errors.root) {
			console.log(errors.root);
		}
	}, [errors]);
	return (
		<div className="flex flex-col gap-6 w-full">
			<h2 className="text-2xl font-semibold text-center font-title">
				Scegli le tue preferenze
			</h2>
			<div className="flex flex-wrap gap-3 justify-center">
				{hobbies.map((hobby) => {
					const isSelected = preferenzeSelezionate.includes(hobby.label);
					return (
						<button
							key={hobby.id}
							type="button"
							onClick={() => handleChipClick(hobby)}
							className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 font-body ${
								isSelected
									? `bg-primary text-bg-1 `
									: 'bg-[#e5e7eb] text-[#6b7280] hover:bg-[#d1d5db]'
							}`}
						>
							{hobby.label}
						</button>
					);
				})}
			</div>
			{errors.preferenze && (
				<span className="px-1.5 text-sm font-semibold font-body text-error ">
					{errors.preferenze.message}
				</span>
			)}
			{errors.root && (
				<span className="px-1.5 text-sm font-semibold font-body text-error ">
					{errors.root.message}
				</span>
			)}
		</div>
	);
};

export default RegisterStep3;
