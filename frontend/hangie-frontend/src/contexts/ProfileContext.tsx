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

const ProfileContext = createContext({
  ProfileData: null,
});

export const ProfileProvider = ({ children }) => {
  const { executeApiCall } = useApi();
  const [profileData, setProfileData] = useState(null);
  const { session, isAuthLoading } = useAuth();
  const getProfileData = useCallback(async () => {
    if (!session?.access_token || !session?.user?.id) return;

    const saveData = (data) => {
      setProfileData(data);
    };

    executeApiCall(
      "profile",
      () => ApiCalls.handleGetProfile(session.access_token),
      saveData,
    );
  }, [session, executeApiCall]);
  useEffect(() => {
    if (session && !isAuthLoading) {
      getProfileData();
    }
  }, [session, isAuthLoading]);
  useEffect(() => {
    console.log("profile", profileData);
  }, [profileData]);
  return (
    <ProfileContext.Provider
      value={{
        profileData,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};
