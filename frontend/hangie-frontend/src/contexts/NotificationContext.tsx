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

export const NotificationProvider = ({ children }) => {
  const [currentNotifications, setCurrentNotifications] = useState([]);
  const { session } = useAuth();
  const { currentSocket } = useSocket();

  const getDbNotifications = async () => {
    if (!session?.user?.id) return;
    const { data: notificationData, error: notificationError } = await supabase
      .from("notifiche")
      .select("*")
      .eq("is_read", false)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }); // <--- La più recente in alto

    if (notificationError) return;
    setCurrentNotifications(notificationData);
  };
  useEffect(() => {
    getDbNotifications();
  }, []);
  useEffect(() => {
    if (currentSocket) {
      // ASCOLTATORE GLOBALE

      currentSocket.on("new_notification", (data) => {
        console.log("Nuova notifica ricevuta via socket:", data);

        // Se la notifica è per me, la aggiungo in cima allo stato
        // Filtriamo lato client per sicurezza
        if (data.user_id === session.user.id) {
          setCurrentNotifications((prev) => {
            // Evitiamo duplicati se il socket invia messaggi ripetuti
            const exists = prev.some((n) => n.message_id === data.message_id);
            if (exists) return prev;

            return [data, ...prev];
          });
        }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("new_notification");
      }
    };
  }, [session?.user?.id]);
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
