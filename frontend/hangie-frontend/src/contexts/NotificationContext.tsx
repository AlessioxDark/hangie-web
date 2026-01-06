import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../config/db.js";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { useChat } from "./ChatContext.js";

const NotificationContext = createContext({
  currentNotifications: null,
  setCurrentNotifications: (arg) => arg,
  markAllAsRead: () => {},
});

export const useNotification = () => {
  const context = useContext(NotificationContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error(
      "useNotification deve essere usato all'interno di un ChatProvider"
    );
  }

  return context;
};

// all'inizio non è send sui messaggi perchè non esiste dati di chat

export const NotificationProvider = ({ children }) => {
  const [currentNotifications, setCurrentNotifications] = useState({
    unread: [],
    read: [],
  });
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const { currentChatData, setCurrentChatData, setGroupsData, groupsData } =
    useChat();
  const getDbNotifications = async () => {
    if (!session?.user?.id) return;
    const { data: notificationData, error: notificationError } = await supabase
      .from("notifiche")
      .select(
        `
    type,
    sender_id,
    user_id,
    receiver:utenti!notifiche_user_id_fkey (
      nome,
      handle,
      profile_pic
      ),
      sender:utenti!notifiche_sender_id_fkey (
        nome,
        handle,
        profile_pic
    ),
    group_id,
    gruppo:gruppi!notifiche_group_id_fkey (
    nome
    ),
    messaggio:messaggi!notifiche_message_id_fkey (
    content
    ),
    created_at,
    is_read`
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    console.log(notificationData);
    if (notificationError) return;
    const read = notificationData.filter((notif) => {
      if (notif.is_read) return notif;
    });
    const unread = notificationData.filter((notif) => {
      if (!notif.is_read) return notif;
    });
    setCurrentNotifications({ read, unread });
  };
  useEffect(() => {
    getDbNotifications();
  }, [session?.user?.id]);
  useEffect(() => {
    if (currentSocket) {
      // ASCOLTATORE GLOBALE

      currentSocket.on("new_notification", (data) => {
        console.log("Nuova notifica ricevuta via socket:", data);

        // Se la notifica è per me, la aggiungo in cima allo stato
        // Filtriamo lato client per sicurezza

        console.log("data user_id", data.user_id);
        console.log("sessuin user id", session.user.id);
        console.log(data.user_id == session.user.id);
        if (data.user_id === session.user.id) {
          console.log("è mia");
          setCurrentNotifications((prev) => {
            return { read: prev.read, unread: [data, ...prev.unread] };
          });
        }
      });
      currentSocket.on("clear_notifications_count", (data) => {
        console.log("Rimozione notifiche:", data);

        if (data.user_id === session.user.id) {
          setCurrentNotifications((prev) => {
            const newlyRead = prev.unread.filter(
              (n) => n.group_id === data.group_id
            );
            const remainingUnread = prev.unread.filter(
              (n) => n.group_id !== data.group_id
            );
            return {
              read: [
                ...newlyRead.map((n) => ({ ...n, is_read: true })),
                ...prev.read,
              ],
              unread: remainingUnread,
            };
          });
        }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("new_notification");
        currentSocket.off("clear_notifications_count");
      }
    };
  }, [
    session?.user?.id,
    setCurrentChatData,
    currentChatData?.messaggi?.length,
    currentNotifications,
    setCurrentNotifications,
    currentSocket,
    setGroupsData,
    groupsData,
  ]);
  useEffect(() => {
    console.log("cambio notifiche", currentNotifications);
  }, [currentNotifications]);

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("notifiche")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) return;

    setCurrentNotifications((prev) => {
      return {
        unread: [],
        read: [
          ...(prev.unread || []).map((n) => ({ ...n, is_read: true })),
          ...(prev.read || []),
        ],
      };
    });
  };
  return (
    <NotificationContext.Provider
      value={{
        currentNotifications,
        setCurrentNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
