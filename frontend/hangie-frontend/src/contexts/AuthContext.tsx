import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/db.js';

const authContext = createContext();

export const AuthContextProvider = ({ children }) => {
	const [session, setSession] = useState();

	// Sign Up

	const signUpNewUser = async ({ email, password }) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});
		if (error) {
			console.error('error during signing up process:', error);
			return { success: false, authError: error };
		}
		return { success: true, authData: data };
	};
	const LoginUser = async (email, password) => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) {
				console.error('errore nel login', error);
				return { success: false, authError: error.message };
			}
			console.log('signed in succesfully', data);
			return { success: true, authData: data };
		} catch (error) {
			console.error('errore nel login', error);
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			console.log(session);
			setSession(session);
		});
		supabase.auth.onAuthStateChange((_event, session) => {
			console.log(session);
			setSession(session);
		});
	}, []);

	return (
		<authContext.Provider value={{ session, signUpNewUser, LoginUser }}>
			{children}
		</authContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(authContext);
};
