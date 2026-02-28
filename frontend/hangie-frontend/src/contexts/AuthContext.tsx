import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/db.js";
import { Navigate, useNavigate } from "react-router";

const authContext = createContext({
  session: null,
  signUpNewUser: (arg) => arg,
  LoginUser: () => {},
  LogoutUser: () => {},
  isAuthLoading: false,
});

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // Sign Up
  const navigate = useNavigate();

  const signUpNewUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("error during signing up process:", error);
      return { success: false, authError: error };
    }
    return { success: true, authData: data };
  };
  const LoginUser = async (email, password, rememberMe) => {
    try {
      localStorage.setItem("to_remember", rememberMe.toString());

      console.log("passato rememberme", rememberMe);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("errore nel login", error);
        return { success: false, authError: error.message };
      }
      console.log("signed in succesfully", data);

      return { success: true, authData: data };
    } catch (error) {
      console.error("errore nel login", error);
    }
  };
  const LogoutUser = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      localStorage.removeItem("to_remember");

      return <Navigate to={"/login"} replace />;
    } catch (error) {
      console.error("errore nel login", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Questo gira SOLO quando l'utente carica la pagina per la prima volta (o preme F5)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const wantToBeRemembered = localStorage.getItem("to_remember") === "true";
      if (session && !wantToBeRemembered) {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(session);
      }
      setIsAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      // setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <authContext.Provider
      value={{ session, signUpNewUser, LoginUser, LogoutUser, isAuthLoading }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
