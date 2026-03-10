import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../config/db.js";
import { useApi } from "./ApiContext.js";
import { useAuth } from "./AuthContext.js";
import { ApiCalls } from "@/services/api.js";
import { useLocation } from "react-router";

const ProfileContext = createContext({
  ProfileData: null,
  getProfileData: (arg) => arg,
  setProfileData: (arg) => arg,
  setDefaultHandle: (arg) => arg,
});

export const ProfileProvider = ({ children }) => {
  const { executeApiCall } = useApi();
  const [profileData, setProfileData] = useState(null);
  const location = useLocation();
  const { session, isAuthLoading } = useAuth();
  const [defaultHandle, setDefaultHandle] = useState(false);

  const getDefaulHandle = async () => {
    if (!session?.access_token || !session?.user?.id) return;
    console.log("sess", session.user.id);
    // await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      const { data, error } = await supabase
        .from("utenti")
        .select("handle")
        .eq("user_id", session.user.id)
        .single();
      console.log("ricevuto", data);
      if (error) {
        console.warn("Handle non ancora trovato, riprovo...");
        throw error;
      }
      return data.handle;
    } catch (err) {
      console.log("err", err);
      return "non c'è data";
    }
  };
  useEffect(() => {
    console.log("avviato in profile", session, isAuthLoading, defaultHandle);
    if (session && !isAuthLoading && !defaultHandle) {
      console.log("session c'è");
      console.log("eccola", session);
      executeApiCall(
        "profile",
        () => {
          return getDefaulHandle();
        },
        (data) => {
          console.log("ris", data);
          if (data) {
            setDefaultHandle(data);
          } else {
            console.log(
              "DB non ancora pronto, mantengo lo stato attuale o riproverò al refresh",
            );
          }
        },
      );
    }
  }, [session, isAuthLoading, defaultHandle]);

  const getProfileData = useCallback(async (userHandle) => {
    const saveData = (data) => {
      setProfileData(data);
    };

    executeApiCall(
      "profile",
      () => ApiCalls.handleGetProfile(userHandle),
      saveData,
    );
  }, []);
  useEffect(() => {
    const splittedLoation = location.pathname.split("/");
    splittedLoation;
    ("sess", session);
    if (splittedLoation[1] == "profile") {
      getProfileData(splittedLoation[2]);
    }
  }, [location.pathname]);

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        getProfileData,
        defaultHandle,
        setProfileData,
        setDefaultHandle,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};
