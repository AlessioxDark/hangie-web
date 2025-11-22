import DollarIcon from '@/assets/icons/DollarIcon';
import MapIcon from '@/assets/icons/MapIcon';
import React from 'react';

const FormInput = ({ id, label, type, placeholder, register, error }) => {
	console.log(register);
	const isDateField = type === 'datetime-local';

	return (
		<div className="flex flex-col gap-1 w-full group">
			<label
				htmlFor={id}
				className={`font-body text-text-1 text-base font-medium`}
			>
				{label} <span className="text-red-500 text-sm">*</span>
			</label>
			<div
				className={`flex items-center
		                         bg-bg-2 rounded-xl
		                         transition-all duration-200
		                         ${
																error
																	? 'border-red-500 border-2'
																	: 'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary'
															}
		                         shadow-inner-sm p-0.5`}
			>
				{/* Icona a sinistra */}

				{id == 'costo' && (
					<div className="h-full flex items-center justify-center">
						<div className="w-8 h-8">
							<DollarIcon color={'#64748b'} />
						</div>
					</div>
				)}
				{id == 'indirizzo' && (
					<div className="h-full flex items-center justify-center">
						<div className="w-8 h-8">
							<MapIcon color={'#64748b'} />
						</div>
					</div>
				)}

				<input
					id={id}
					type={type}
					placeholder={placeholder}
					className={`w-full font-body py-3 rounded-r-xl outline-none appearance-none bg-transparent
		                             text-text-1
																	placeholder-text-3
		                            px-3
		                             ${
																		id === 'costo' ||
																		id === 'indirizzo' ||
																		isDateField
																			? 'rounded-l-none'
																			: 'rounded-l-xl'
																	}
		                             `}
					// Uso corretto della funzione register
					{...register(id)}
				/>
			</div>
			{/* L'errore viene mostrato se esiste */}
			{error?.message && (
				<p className="text-sm text-red-500 ">{error.message}</p>
			)}
		</div>
	);
};

export default FormInput;
