import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { supabase } from "../config/db.js";
import { useMobileLayoutChat } from "./MobileLayoutChatContext.js";
export const ChatContext = createContext({
  currentChatData: null, // dati chat corrente
  setCurrentChatData: (arg) => arg, // impostare dati chat
  currentGroup: null, // id chat corrente
  setCurrentGroup: (arg) => arg, // impostare id chat
  currentGroupData: null,
  setCurrentGroupData: (arg) => arg,
  groupsData: null,
  error: null,
  isGroupsLoading: false,
  isChatLoading: false,
  isEventsLoading: false,
  groupEventsData: [],
  setGroupsData: (arg) => arg,
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
  const [currentChatData, setCurrentChatData] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentGroupData, setCurrentGroupData] = useState(null);
  const [groupsData, setGroupsData] = useState(null);
  const [error, setError] = useState(null);
  const [groupEventsData, setGroupEventsData] = useState(null);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false); // Loader specifico per Sidebar
  const [isChatLoading, setIsChatLoading] = useState(false); // Loader specifico per Messaggi
  const [isEventsLoading, setIsEventsLoading] = useState(false); // Loader specifico per Messaggi
  const { setMobileView } = useMobileLayoutChat();
  const fetchGroupEvents = async () => {
    console.log("Fetch inziata");
    if (isEventsLoading) return;
    try {
      setIsEventsLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/groups/${currentGroup}/group-events`,
        {
          method: "GET",
          // body: JSON.stringify({ offset: offset }),
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      // console.log(response);
      if (!response.ok) {
        console.log(response);
        setError(response.statusText || "Errore nel caricamento degli eventi");
      }
      const data = await response.json();
      console.log(data);
      setGroupEventsData(data);
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsEventsLoading(false);
    }
  };
  const fetchGroups = async () => {
    if (isGroupsLoading) return;
    try {
      setError(null);
      setIsGroupsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch("http://localhost:3000/api/groups/", {
          method: "GET",
          // body: JSON.stringify({ offset: offset }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          console.log(response);
          setError(
            response.statusText || "Errore nel caricamento degli eventi"
          );
        }

        const data = await response.json();

        console.log(data);

        setGroupsData((prevData) => {
          return data;
        });
      }
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsGroupsLoading(false);
    }
  };
  const fetchChat = async (groupId) => {
    if (isChatLoading || !groupId) return;

    try {
      setError(null);
      setIsChatLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(
          `http://localhost:3000/api/groups/${currentGroup}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(
            errorData.error?.message ||
              response.statusText ||
              "Errore nel caricamento della chat"
          );
          return;
        }

        const result = await response.json();
        const groupData = result;
        console.log(result);
        if (groupData) {
          const mappedMessages = groupData.messaggi.map((mess) => ({
            ...mess,
            isUser: mess.user_id === session.user.id,
          }));
          console.log(mappedMessages);
          setCurrentChatData({
            ...groupData,
            messaggi: mappedMessages,
          });
        } else {
          setError("Dati del gruppo non trovati.");
        }
      }
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsChatLoading(false);
      setMobileView("chat");
    }
  };
  useEffect(() => {
    console.log("currentgruop", currentGroup);
    if (currentGroup != null) {
      console.log("fetching chat");
      fetchChat(currentGroup);
    }
  }, [currentGroup]);
  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    console.log("fetching...");
    if (currentGroup !== null) fetchGroupEvents();
  }, [currentGroup]);
  return (
    <ChatContext.Provider
      value={{
        currentChatData,
        setCurrentChatData,
        currentGroup, // id chat corrente
        setCurrentGroup, // impostare id chat
        currentGroupData,
        setCurrentGroupData,
        groupsData,
        error,
        groupEventsData,
        isGroupsLoading,
        isChatLoading,
        isEventsLoading,
        setGroupsData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
