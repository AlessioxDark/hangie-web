import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useMobileLayoutChat } from "./MobileLayoutChatContext.js";
import { useScreen } from "./ScreenContext.js";
import { type Message, type UUID, type GroupData } from "../types/chat.tsx";
import { ApiCalls } from "@/services/api.tsx";

export const ChatContext = createContext({
  currentChatData: null,
  setCurrentChatData: (arg) => arg,
  currentGroup: null,
  setCurrentGroup: (arg) => arg,
  currentGroupData: {},
  setCurrentGroupData: (arg) => arg,
  groupsData: [],
  error: { chat: null, home: null, groups: null, events: null },
  groupEventsData: [],
  setGroupsData: (arg) => arg,
  fetchGroups: () => {},
  messagesMap: null,
  setMessagesMap: (arg) => arg,
  homeEventsData: [],
  homeOffset: 0,
  loading: { chat: false, home: false, groups: false, events: false },
});

export const useChat = () => {
  const context = useContext(ChatContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error("useChat deve essere usato all'interno di un ChatProvider");
  }

  return context;
};

export const ChatProvider = ({ children }) => {
  const [currentChatData, setCurrentChatData] = useState<Message[] | null>(
    null
  );
  const [currentGroup, setCurrentGroup] = useState<UUID | null>(null);
  const [currentGroupData, setCurrentGroupData] = useState<GroupData | null>(
    null
  );
  const [messagesMap, setMessagesMap] = useState<Message[] | null>(null);

  const [groupsData, setGroupsData] = useState<GroupData[] | null>(null);

  const [loading, setLoading] = useState({
    chat: false,
    home: false,
    groups: false,
    events: false,
  });
  const [error, setError] = useState({
    chat: null,
    home: null,
    groups: null,
    events: null,
  });

  // const [error, setError] = useState(null);

  const [homeOffset, setHomeOffset] = useState(0);
  const [homeEventsData, setHomeEventsData] = useState<{
    pending: any[];
    accepted: any[];
    refused: any[];
  }>({
    pending: [],
    accepted: [],
    refused: [],
  });

  const [groupEventsData, setGroupEventsData] = useState(null);
  const { setMobileView } = useMobileLayoutChat();
  const { currentScreen } = useScreen();
  const { session } = useAuth();

  const executeApiCall = async (type, fetchCall, onSuccess) => {
    console.log(`[DEBUG] Inizio chiamata per: ${type}`);

    if (loading[type]) {
      console.log(`[DEBUG] Chiamata ${type} annullata: sta già caricando`);
      return;
    }
    try {
      console.log(`[DEBUG] Sistemo errori e loading: ${type}`);
      setError((prev) => ({ ...prev, [type]: null }));
      setLoading((prev) => {
        return { ...prev, [type]: true };
      });
      console.log(`[DEBUG] Chiamo fetch: ${type}`);
      const data = await fetchCall();
      console.log(`[DEBUG] Dati tornati: ${type}:${data}`);
      onSuccess(data);
    } catch (err) {
      console.error("errore nel tipo: ", type, " :", err);
      setError((prev) => {
        return {
          ...prev,
          [type]: {
            message: err.message || "Errore di connessione",
            status: err.status || 500, // Se il tuo handleResponse lo passa
            at: Date.now(),
          },
        };
      });
    } finally {
      setLoading((prev) => {
        return { ...prev, [type]: false };
      });
    }
  };
  const fetchEvents = useCallback(async (): Promise<void> => {
    // try {
    //   setHomeError(null);
    //   setLoading((prev) => {
    //     return { ...prev, home: true };
    //   });
    //   // if (!response.ok) {
    //   //   console.log(response);
    //   //   setError(response.statusText || "Errore nel caricamento degli eventi");
    //   // }
    //   const data = await ApiCalls.fetchHomeEvents(
    //     homeOffset,
    //     session.access_token
    //   );
    //   console.log(data);
    // setHomeEventsData((prevData) => {
    //   const mergeAccepted = [...prevData.accepted, ...data.accepted];
    //   const dedupAccepted = Array.from(
    //     new Map(mergeAccepted.map((item) => [item.event_id, item])).values()
    //   );
    //   const mergePending = [...prevData.pending, ...data.pending];
    //   const dedupPending = Array.from(
    //     new Map(mergePending.map((item) => [item.event_id, item])).values()
    //   );
    //   const mergeRefused = [...prevData.refused, ...data.refused];
    //   const dedupRefused = Array.from(
    //     new Map(mergeRefused.map((item) => [item.event_id, item])).values()
    //   );
    //   return {
    //     pending: dedupPending,
    //     accepted: dedupAccepted,
    //     refused: dedupRefused, // fai uguale se ti serve
    //   };
    // });
    // } catch (err: any) {
    //   console.error("Errore fetch eventi:", err);
    //   setError(err.message || "Errore nel caricamento degli eventi");
    // } finally {
    //   setLoading((prev) => {
    //     return { ...prev, home: false };
    //   });
    // }

    const saveData = (data) => {
      setHomeEventsData((prevData) => {
        const mergeAccepted = [...prevData.accepted, ...data.accepted];
        const dedupAccepted = Array.from(
          new Map(mergeAccepted.map((item) => [item.event_id, item])).values()
        );
        const mergePending = [...prevData.pending, ...data.pending];
        const dedupPending = Array.from(
          new Map(mergePending.map((item) => [item.event_id, item])).values()
        );
        const mergeRefused = [...prevData.refused, ...data.refused];
        const dedupRefused = Array.from(
          new Map(mergeRefused.map((item) => [item.event_id, item])).values()
        );
        return {
          pending: dedupPending,
          accepted: dedupAccepted,
          refused: dedupRefused, // fai uguale se ti serve
        };
      });
    };
    await executeApiCall(
      "home",
      () => {
        return ApiCalls.fetchHomeEvents(homeOffset, session.access_token);
      },
      saveData
    );
  }, [homeOffset, session]);
  const fetchGroupEvents = async () => {
    // try {
    //   setLoading((prev) => {
    //     return { ...prev, events: true };
    //   });
    //   // setIsEventsLoading(true);
    //   // if (!response.ok) {
    //   //   console.log(response);
    //   //   setError(response.statusText || "Errore nel caricamento degli eventi");
    //   // }
    //   const data = await ApiCalls.fetchGroupEvents(
    //     currentGroup,
    //     session.access_token
    //   );
    //   setGroupEventsData(data);
    // } catch (err: any) {
    //   console.error("Errore fetch eventi:", err);
    //   setError(err.message || "Errore nel caricamento degli eventi");
    // } finally {
    //   setLoading((prev) => {
    //     return { ...prev, events: false };
    //   });
    // }

    const saveData = (data) => {
      setGroupEventsData(data);
    };
    await executeApiCall(
      "events",
      () => {
        return ApiCalls.fetchGroupEvents(currentGroup, session.access_token);
      },
      saveData
    );
  };
  const fetchGroups = async () => {
    // if (loading.groups) return;
    // try {
    //   setError(null);
    //   setLoading((prev) => {
    //     return { ...prev, groups: true };
    //   });
    //   // if (!response.ok) {
    //   //   console.log(response);
    //   //   setError(
    //   //     response.statusText || "Errore nel caricamento degli eventi"
    //   //   );
    //   // }
    //   const data = await ApiCalls.fetchGroups(session.access_token);
    // setGroupsData((prevData) => {
    //   return data;
    // });
    // } catch (err: any) {
    //   console.error("Errore fetch eventi:", err);
    //   setError(err.message || "Errore nel caricamento degli eventi");
    // } finally {
    //   setLoading((prev) => {
    //     return { ...prev, groups: false };
    //   });
    // }
    const saveData = (data) => {
      setGroupsData(data);
    };
    await executeApiCall(
      "groups",
      () => {
        return ApiCalls.fetchGroups(session.access_token);
      },
      saveData
    );
  };
  const fetchChat = async (groupId: UUID) => {
    if (!groupId || !session) return;

    if (messagesMap[groupId]) {
      setCurrentChatData(messagesMap[groupId]);
    } else {
      setLoading((prev) => {
        return { ...prev, chat: true };
      });
      setLoading((prev) => {
        return { ...prev, chat: true };
      });
    }

    const saveData = (groupData) => {
      console.log("eseguo on success fetchchat");
      const mappedMessages = groupData.messaggi.map((mess) => ({
        ...mess,
        isUser: mess.user_id === session.user.id,
      }));
      console.log(mappedMessages);

      setCurrentChatData({
        ...groupData,
        messaggi: mappedMessages,
      });
      setMessagesMap((prev) => ({
        ...prev,
        [groupId]: [...mappedMessages],
      }));

      setMobileView("chat");
    };

    executeApiCall(
      "chat",
      () => {
        return ApiCalls.fetchChat(groupId, session.access_token);
      },
      saveData
    );
    // try {
    //   setError(null);

    //   // if (!response.ok) {
    //   //   const errorData = await response.json().catch(() => ({}));
    //   //   setError(
    //   //     errorData.error?.message ||
    //   //       response.statusText ||
    //   //       "Errore nel caricamento della chat"
    //   //   );
    //   //   return;
    //   // }

    //   const result = await ApiCalls.fetchChat(groupId, session.access_token);
    //   const groupData = result;
    //   if (groupData) {
    //     const mappedMessages = groupData.messaggi.map((mess) => ({
    //       ...mess,
    //       isUser: mess.user_id === session.user.id,
    //     }));
    //     console.log(mappedMessages);

    //     setCurrentChatData({
    //       ...groupData,
    //       messaggi: mappedMessages,
    //     });
    //     setMessagesMap((prev) => ({
    //       ...prev,
    //       [groupId]: [...mappedMessages],
    //     }));
    //     setMobileView("chat");
    //   } else {
    //     setError("Dati del gruppo non trovati.");
    //   }
    // } catch (err: any) {
    //   console.error("Errore fetch eventi:", err);
    //   setError(err.message || "Errore nel caricamento degli eventi");
    // } finally {
    //   setLoading((prev) => {
    //     return { ...prev, chat: false };
    //   });
    //   setMobileView("chat");
    // }
  };

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session]);
  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [homeOffset, session]);

  useEffect(() => {
    if (currentGroup) {
      fetchGroupEvents();
      fetchChat(currentGroup);
    }
  }, [currentGroup]);

  useEffect(() => {
    const isLargeScreen = currentScreen && currentScreen !== "xs";
    if (
      isLargeScreen &&
      !currentGroup &&
      groupsData &&
      groupsData?.length > 0
    ) {
      console.log("Layout Desktop rilevato: auto-seleziono primo gruppo");
      setCurrentGroup(groupsData[0].group_id);
      setCurrentGroupData(groupsData[0]);
    }
  }, [groupsData, currentGroup, currentScreen]);
  return (
    <ChatContext.Provider
      value={{
        currentChatData,
        setCurrentChatData,
        currentGroup,
        setCurrentGroup,
        currentGroupData,
        setCurrentGroupData,
        groupsData,
        error,
        groupEventsData,
        setGroupsData,
        fetchGroups,
        messagesMap,
        setMessagesMap,
        homeEventsData,
        setHomeOffset,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
