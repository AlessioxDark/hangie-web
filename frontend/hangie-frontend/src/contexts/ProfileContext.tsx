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
});

export const ProfileProvider = ({ children }) => {
  const { executeApiCall } = useApi();
  const [profileData, setProfileData] = useState(null);
  const location = useLocation();
  const { session, isAuthLoading } = useAuth();
  const [defaultHandle, setDefaultHandle] = useState(false);

  const getDefaulHandle = async () => {
    if (!session?.access_token || !session?.user?.id) return;
    try {
      const {
        data: { handle },
        error: userError,
      } = await supabase
        .from("utenti")
        .select("handle")
        .eq("user_id", session?.user.id)
        .single();
      ("trovato userhandle", handle, userError);
      if (userError) throw userError;
      return handle;
    } catch (err) {
      ("err", err);
      // return err;
    }
  };
  useEffect(() => {
    if (session && !isAuthLoading) {
      executeApiCall(
        "profile",
        () => {
          return getDefaulHandle();
        },
        (data) => setDefaultHandle(data),
      );
    }
  }, [session, isAuthLoading]);

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
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};
