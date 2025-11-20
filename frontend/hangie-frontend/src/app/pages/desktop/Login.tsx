import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router';
import { email, z } from 'zod';

import appleLogo from '../../../assets/Apple_logo.svg';
import facebookLogo from '../../../assets/Facebook_logo.svg';
import googleLogo from '../../../assets/Google_logo.svg';
import { supabase } from '../../../config/db.js';
import { useAuth } from '../../../contexts/AuthContext.js';

const Login = () => {
	const { LoginUser } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const schema = z.object({
		user_email: z.string().min(1, 'il campo è obbligatorio'),
		password: z.string().min(1, 'la password è obbligatoria'),
		remember: z.boolean().optional(),
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
	const navigate = useNavigate();

	const onSubmit: SubmitHandler<FormFields> = async (data) => {
		console.log('inviato');
		console.log(data);
		setIsLoading(true);
		try {
			const { user_email, password } = data;
			let realEmail = user_email;
			if (!realEmail.includes('@')) {
				supabase
					.from('utenti')
					.select('email')
					.eq('handle', user_email)
					.single();
			}

			const { authData, authError } = await LoginUser(realEmail, password);

			if (authError) {
				setError('root', { message: 'Credenziali non corrette' });
				return;
			}

			console.log('Registrazione completata con successo.');
		} catch (error) {
			console.log(`errore ${error} `);
			setError('root', { message: `errore ${error} ` });
		} finally {
			setIsLoading(false);
			<Navigate to={'/'} replace />;
		}
	};

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	return (
		<div className="h-screen w-full p-5 flex justify-center items-center flex-col relative bg-bg-2">
			{/* 60% - Primary dominance in header */}
			<div className="absolute top-5 flex w-full h-1/4 justify-center items-center">
				<h1 className="font-bold font-title text-center text-5xl text-primary">
					Benvenuto ad Hangie
				</h1>
			</div>

			{/* 30% - Neutral base */}
			<div className="w-3/10 flex flex-col items-center gap-8 rounded-lg shadow-lg bg-white p-8">
				<h1 className="font-bold font-title text-center text-4xl text-black">
					Accedi
				</h1>

				<div className="flex flex-col gap-6 w-full">
					<form className="flex flex-col gap-6 w-full">
						{/* Progress Steps - 60% Primary */}
						<div className="flex flex-col gap-5 w-full">
							<h2 className="text-2xl font-semibold text-center font-title">
								Inserisci le generalità
							</h2>
							<div className="flex flex-col gap-4 w-full">
								<div>
									<input
										type="text"
										className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
										placeholder="Email o Username"
										{...register('user_email')}
									/>
									{errors.user_email && (
										<span className="px-1.5 text-sm font-semibold font-body text-error ">
											{errors.user_email.message}
										</span>
									)}
								</div>

								<div className="flex flex-col ">
									<div className="relative flex items-center">
										<input
											type={isPasswordVisible ? 'text' : 'password'}
											className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
											placeholder="Password"
											{...register('password')}
										/>
										<span
											className="absolute right-3"
											onClick={() =>
												setIsPasswordVisible((lastVisible) => !lastVisible)
											}
										>
											{isPasswordVisible ? <Eye /> : <EyeOff />}
										</span>
									</div>

									{errors.password && (
										<span className="mt-1 px-1.5 text-sm font-semibold font-body text-error ">
											{errors.password.message}
										</span>
									)}
								</div>

								<div className="px-1.5">
									<div className="w-full flex items-center  gap-2">
										<input
											type="checkbox"
											id="remember"
											className="w-4 h-4  bg-gray-100 rounded border-gray-300   accent-primary"
											{...register('remember')}
										/>
										<label
											htmlFor="remember"
											className="font-body text-sm text-[#6b7280]"
										>
											Ricordati
										</label>
									</div>

									{errors.root && (
										<span className="text-sm font-semibold font-body text-error ">
											{errors.root.message}
										</span>
									)}
								</div>
							</div>
						</div>
						{/* Login Link - Primary accent */}
						<div className="w-full text-center text-[#6b7280]">
							<span className="font-body">
								Sei nuovo qui?{' '}
								<Link
									to="/signup"
									className="font-body font-semibold hover:underline transition-colors duration-200 text-primary"
								>
									Crea un account
								</Link>
							</span>
						</div>

						{/* Navigation Buttons - 60% Primary dominance */}
						<div className="w-full flex justify-center gap-4">
							<button
								type="button"
								className={`px-8 py-3 font-title font-bold rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                  
											bg-primary hover:bg-primary/80
											
									
                  text-white`}
								onClick={() => {
									handleSubmit(onSubmit)();
								}}
								disabled={isSubmitting}
							>
								<span className="text-lg">
									{isSubmitting ? 'Invio in corso...' : 'Accedi'}
								</span>
							</button>
						</div>
					</form>

					{/* Neutral divider */}
					<div className="flex items-center justify-center gap-4">
						<div className="flex-1 h-px bg-[#e5e7eb]"></div>
						<span className="font-body text-sm px-4 text-[#6b7280]">
							oppure continua con
						</span>
						<div className="flex-1 h-px bg-[#e5e7eb]"></div>
					</div>

					{/* Social Login - subtle accents */}
					<div className="flex flex-row gap-4 items-center w-full justify-center">
						{[
							{ src: googleLogo, alt: 'Google' },
							{ src: appleLogo, alt: 'Apple' },
							{ src: facebookLogo, alt: 'Facebook' },
						].map((social, index) => (
							<button
								key={index}
								type="button"
								className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out border-2 hover:shadow-md bg-white border-[#e5e7eb] hover:border-primary hover:translate-y-[-1px]"
							>
								<img
									src={social.src}
									alt={`${social.alt} Logo`}
									className="w-5 h-5"
								/>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
