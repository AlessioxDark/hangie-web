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
  const [currentNotifications, setCurrentNotifications] = useState([]);
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const { currentChatData } = useChat();
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
    created_at`
      )
      .eq("is_read", false)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    console.log(notificationData);
    if (notificationError) return;
    setCurrentNotifications(notificationData);
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
            // // Evitiamo duplicati se il socket invia messaggi ripetuti
            // const exists = prev.some((n) => n.message_id === data.message_id);
            // console.log("è exist", exists);
            // if (exists) return prev;
            console.log("allora invio:", [data, ...prev]);

            return [data, ...prev];
          });
        }
      });
      currentSocket.on("clear_notifications_count", (data) => {
        console.log("Rimozione notifiche:", data);

        if (data.user_id === session.user.id) {
          setCurrentNotifications((prev) => {
            return prev.filter((noti) => noti.group_id !== data.group_id);
          });
        }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("new_notification");
        currentSocket.off("clear_notification_count");
      }
    };
  }, [session?.user?.id, currentChatData]);
  useEffect(() => {
    console.log("cambio notifiche", currentNotifications);
  }, [currentNotifications]);
  return (
    <NotificationContext.Provider
      value={{
        currentNotifications,
        setCurrentNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
