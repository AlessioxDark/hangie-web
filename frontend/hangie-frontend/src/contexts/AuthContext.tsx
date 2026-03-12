import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../config/db.js";
import { Navigate, useNavigate } from "react-router";
import { ApiCalls } from "@/services/api.js";

const authContext = createContext({
  session: null,
  signUpNewUser: (arg) => arg,
  LoginUser: () => {},
  LogoutUser: () => {},
  isAuthLoading: false,
  handleGuestSignIn: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isPopulatingRef = useRef(false);
  const signUpNewUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    localStorage.setItem("to_remember", "true");

    if (error) {
      console.error("error during signing up process:", error);
      return { success: false, authError: error };
    }
    return { success: true, authData: data };
  };
  const LoginUser = async (email, password, rememberMe) => {
    try {
      localStorage.setItem("to_remember", rememberMe.toString());

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("errore nel login", error);
        return { success: false, authError: error.message };
      }
      console.log("loginnato");
      return { success: true, authData: data };
    } catch (error) {
      console.error("errore nel login", error);
    }
  };
  const LogoutUser = async () => {
    try {
      console.log("faccio il logout");
      await supabase.auth.signOut();
      setSession(null);
      localStorage.removeItem("to_remember");

      return <Navigate to={"/login"} replace />;
    } catch (error) {
      console.error("errore nel login", error);
    }
  };

  const handleGuestSignIn = async () => {
    console.log("ci proviamo");
    localStorage.setItem("to_remember", "true");
    isPopulatingRef.current = true;
    const { data: authData, error: authError } =
      await supabase.auth.signInAnonymously();
    if (authError || !authData?.user) {
      return {
        authData: null,
        authError: authError?.message || "Errore sconosciuto",
      };
    }
    let guestData = {};
    if (authData?.user) {
      console.log("metto isPopulating a true");
      guestData = {
        user_id: authData.user.id,
        handle: `guest_${Math.floor(Math.random() * 10000)}`,
        nome: `Ospite ${(Math.random() * 1000).toFixed(4)}`,
        email: authData.user.id + "@guest.com",
        is_guest: true,
      };
      await ApiCalls.addGuest(authData.session.access_token, {
        guestData,
      });
      console.log("c'è user");
      isPopulatingRef.current = false;
      console.log("lo metto false");
      setSession(authData?.session);
    }

    return { authData: { ...authData, guestData }, authError };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("controllo");
      const wantToBeRemembered = localStorage.getItem("to_remember") === "true";
      if (session && !wantToBeRemembered) {
        console.log("esco");
        await supabase.auth.signOut();
        setSession(null);
      } else {
        console.log("metto la sessione");
        setSession(session);
      }
      setIsAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      console.log("cambiato stato", session);
      if (isPopulatingRef.current) return;

      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("cambiata session", session);
  }, [session]);

  return (
    <authContext.Provider
      value={{
        session,
        handleGuestSignIn,
        signUpNewUser,
        LoginUser,
        LogoutUser,
        isAuthLoading,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
