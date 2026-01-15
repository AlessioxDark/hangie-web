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
  fetchGroupEvents: () => {},
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
  const [messagesMap, setMessagesMap] = useState<Message[] | object>({});

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

  const executeApiCall = useCallback(
    async (
      type: "chat" | "groups" | "events" | "home",
      fetchCall,
      onSuccess
    ) => {
      // if (loading[type]) return;

      try {
        setError((prev) => ({ ...prev, [type]: null }));
        setLoading((prev) => {
          return { ...prev, [type]: true };
        });
        const data = await fetchCall();
        onSuccess(data);
      } catch (err: any) {
        setError((prev) => {
          return {
            ...prev,
            [type]: {
              message: err.message || "Errore di connessione",
              status: err.status || 500,
              at: Date.now(),
            },
          };
        });
      } finally {
        setLoading((prev) => {
          return { ...prev, [type]: false };
        });
      }
    },
    []
  );
  const fetchEvents = useCallback(async (): Promise<void> => {
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
  }, [homeOffset, session, executeApiCall]);
  const fetchGroupEvents = useCallback(async () => {
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
  }, [session, executeApiCall, currentGroup]);
  const fetchGroups = useCallback(async () => {
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
  }, [session, executeApiCall]);
  const fetchChat = useCallback(
    async (groupId: UUID) => {
      if (!groupId || !session) return;

      const saveData = (groupData) => {
        const mappedMessages = groupData.messaggi.map((mess) => ({
          ...mess,
          isUser: mess.user_id === session.user.id,
        }));

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
    },
    [session, executeApiCall, setMobileView]
  );

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session, fetchGroups]);
  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [homeOffset, session, fetchEvents]);

  useEffect(() => {
    if (currentGroup) {
      fetchGroupEvents();
      fetchChat(currentGroup);
    }
  }, [currentGroup, fetchChat, fetchGroupEvents]);

  useEffect(() => {
    const isLargeScreen = currentScreen && currentScreen !== "xs";
    if (
      isLargeScreen &&
      !currentGroup &&
      groupsData &&
      groupsData?.length > 0
    ) {
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
        fetchGroupEvents,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
