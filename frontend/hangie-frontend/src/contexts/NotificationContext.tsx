// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { supabase } from "../config/db.js";
// import { io } from "socket.io-client";
// import { useAuth } from "./AuthContext";
// import { useSocket } from "./SocketContext";

// export const NotificationContext = createContext({
//   currentNotifications: null,
//   setCurrentNotifications: (arg) => arg,
// });

// export const useNotification = () => {
//   const context = useContext(NotificationContext);

//   // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
//   if (context === undefined) {
//     throw new Error(
//       "useNotification deve essere usato all'interno di un ChatProvider"
//     );
//   }

//   return context;
// };

// export const NotificationProvider = ({ children }) => {
//   const [currentNotifications, setCurrentNotifications] = useState(null);
//   const { session } = useAuth();
//   const { socketRef } = useSocket();

//   const getDbNotifications = async () => {
//     const { data: notificationData, error: notificationError } = await supabase
//       .from("notifiche")
//       .select("*")
//       .eq("is_read", false)
//       .eq("user_id", session.user.id)
//       .order("created_at", { ascending: false }); // <--- La più recente in alto

//     if (notificationError) return;
//     setCurrentNotifications(notificationData);
//   };
//   useEffect(() => {
//     getDbNotifications();
//   }, []);
//   useEffect(() => {
//     if (socketRef.current) {
//       // ASCOLTATORE GLOBALE

//       socketRef.current.on("new_notification");
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off("receive_message");
//         socketRef.current.off("message_arrived");
//         socketRef.current.off("message_read");
//       }
//     };
//   }, [session?.user?.id]);

//   return (
//     <NotificationContext.Provider
//       value={{
//         currentNotifications,
//         setCurrentNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };
