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
  const isPopulatingGuest = useRef(false);
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("errore nel login", error);
        return { success: false, authError: error.message };
      }

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
      isPopulatingGuest.current = true;
      guestData = {
        user_id: authData.user.id,
        handle: `guest_${Math.floor(Math.random() * 10000)}`,
        nome: `Ospite ${Math.random() * 1000}`,
        email: authData.user.id + "@guest.com",
        is_guest: true,
      };
      await ApiCalls.addGuest(authData.session.access_token, {
        guestData,
      });
      console.log("c'è user");
      isPopulatingGuest.current = false;
      setSession(authData?.session);
    }

    return { authData: { ...authData, guestData }, authError };
  };

  useEffect(() => {
    const initializeAuth = async () => {
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
      if (isPopulatingGuest.current) return;
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
