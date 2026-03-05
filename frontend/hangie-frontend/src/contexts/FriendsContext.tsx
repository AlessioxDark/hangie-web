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

const FriendsContext = createContext({
  pendingFriends: null,
  friendsData: null,
  setFriendsData: (arg) => arg,
  globalFriendships: null,
  getFriendsByQuery: () => {},
  setGlobalFriendships: null,
  getFriendsData: () => {},
});

export const FriendsProvider = ({ children }) => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);
  const [fetchData, setFetchData] = useState(null);
  const { error, loading, executeApiCall } = useApi();
  const { session, isAuthLoading } = useAuth();
  const [globalFriendships, setGlobalFriendships] = useState(null);
  const getFriendsData = useCallback(async () => {
    if (!session?.access_token || !session?.user?.id) return;

    const saveData = (data) => {
      setFetchData(data);
    };

    executeApiCall(
      "friends",
      () => ApiCalls.handleGetFriends(session.access_token, session.user.id),
      saveData,
    );
  }, [session, executeApiCall]);
  const getFriendsByQuery = useCallback(
    async (myQuery) => {
      if (!session?.access_token || !session?.user?.id) return;

      const saveData = (data) => {
        setGlobalFriendships(data);
      };

      executeApiCall(
        "friends",
        () => ApiCalls.handleGetFriendsByQuery(session.access_token, myQuery),
        saveData,
      );
    },
    [session, executeApiCall],
  );
  useEffect(() => {
    if (!isAuthLoading && session) {
      getFriendsData();
    }
  }, [isAuthLoading, session, getFriendsData]);
  useEffect(() => {
    if (!fetchData || !session) return;
    setPendingFriends(
      fetchData.filter(
        (f) => f.status === "pending" && f.sender_id !== session.user.id,
      ),
    );
    setAcceptedFriends(fetchData.filter((f) => f.status === "accepted"));
    fetchData;
  }, [fetchData]);
  useEffect(() => {
    console.log("modificato fetchdata", fetchData);
  }, [fetchData]);
  return (
    <FriendsContext.Provider
      value={{
        pendingFriends,
        setFriendsData: setFetchData,

        getFriendsByQuery,
        setGlobalFriendships: setGlobalFriendships,
        globalFriendships,
        acceptedFriends,
        friendsData: fetchData,
        getFriendsData,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  return useContext(FriendsContext);
};
