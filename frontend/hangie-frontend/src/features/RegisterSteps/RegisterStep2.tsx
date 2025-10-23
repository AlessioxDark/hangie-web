import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import React, { useState } from 'react';
const mesiValidi = [
	'Gennaio',
	'Febbraio',
	'Marzo',
	'Aprile',
	'Maggio',
	'Giugno',
	'Luglio',
	'Agosto',
	'Settembre',
	'Ottobre',
	'Novembre',
	'Dicembre',
];
const RegisterStep2 = ({}: any) => {
	const {
		register,
		formState: { errors },
		setValue,
		getValues,
	} = useFormContext();
	const { mese } = getValues();
	const returnError = () => {
		if (errors.giorno) {
			return (
				<span className="px-1.5 text-sm font-semibold font-body text-error ">
					{errors.giorno.message}
				</span>
			);
		} else if (errors.giorno) {
			return (
				<span className="px-1.5 text-sm font-semibold font-body text-error ">
					{errors.mese.message}
				</span>
			);
		} else if (errors.anno) {
			return (
				<span className="px-1.5 text-sm font-semibold font-body text-error ">
					{errors.anno.message}
				</span>
			);
		} else {
			return '';
		}
	};
	const [meseValue, setMeseValue] = useState(mese);
	return (
		<div className="flex flex-col gap-5 w-full">
			<h2 className="text-2xl font-semibold text-center font-title">
				Inserisci la tua data di nascita
			</h2>
			<div className="flex flex-col gap-2 w-full">
				<div className="flex flex-row gap-5 w-full">
					<input
						type="number"
						className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-accent transition-colors shadow-sm hover:shadow-md"
						placeholder="Giorno"
						{...register('giorno')}
						min={0}
					/>
					<Select
						onValueChange={(value) => {
							setValue('mese', value);
							setMeseValue(value);
						}}
						value={meseValue}
					>
						<SelectTrigger
							className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-accent transition-colors shadow-sm hover:shadow-md"
							style={{ height: '100%', fontFamily: 'var(--font-body)' }}
						>
							<SelectValue placeholder="Mese" className="text-xl" />
						</SelectTrigger>
						<SelectContent
							className=" bg-white border-2 border-gray-300 rounded-lg p-1 font-body w-full text-xl  "
							style={{ fontFamily: 'var(--font-body)' }}
						>
							{mesiValidi.map((meseValido) => (
								<SelectItem
									key={meseValido}
									value={meseValido}
									className="font-body"
									style={{ fontFamily: 'var(--font-body)' }}
								>
									{meseValido}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<input
						type="number"
						className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-accent transition-colors shadow-sm hover:shadow-md"
						placeholder="Anno"
						{...register('anno')}
						min={0}
					/>
				</div>
				{returnError()}
			</div>
		</div>
	);
};

export default RegisterStep2;
