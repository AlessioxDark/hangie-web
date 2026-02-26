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
});

export const ProfileProvider = ({ children }) => {
  const { executeApiCall } = useApi();
  const [profileData, setProfileData] = useState(null);
  const location = useLocation();
  const { session, isAuthLoading } = useAuth();
  const [defaultHandle, setDefaultHandle] = useState(false);

  const getDefaulHandle = async () => {
    if (!session?.access_token || !session?.user?.id) return;
    console.log("session user c'è", session.user.id);
    try {
      const {
        data: { handle },
        error: userError,
      } = await supabase
        .from("utenti")
        .select("handle")
        .eq("user_id", session?.user.id)
        .single();
      console.log("trovato userhandle", handle, userError);
      if (userError) throw userError;
      return handle;
    } catch (err) {
      console.log("err", err);
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
    console.log("qui arrivo", userHandle);
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
    console.log(splittedLoation);
    console.log("sess", session);
    if (splittedLoation[1] == "profile") {
      getProfileData(splittedLoation[2]);
    }
  }, [location.pathname]);
  // const { executeApiCall } = useApi();
  // const [profileData, setProfileData] = useState(null);
  // const { session, isAuthLoading } = useAuth();
  // const getProfileData = useCallback(async () => {
  // if (!session?.access_token || !session?.user?.id) return;

  //   const saveData = (data) => {
  //     setProfileData(data);
  //   };

  //   executeApiCall(
  //     "profile",
  //     () => ApiCalls.handleGetProfile(session.access_token),
  //     saveData,
  //   );
  // }, [session, executeApiCall]);

  // useEffect(() => {
  //   if (session && !isAuthLoading) {
  //     getProfileData();
  //   }
  // }, [session, isAuthLoading]);
  useEffect(() => {
    console.log("profile", profileData);
  }, [profileData]);
  return (
    <ProfileContext.Provider
      value={{
        profileData,
        getProfileData,
        defaultHandle,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};
