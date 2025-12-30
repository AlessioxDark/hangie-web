import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const ChatContext = createContext({
  currentChatData: null, // dati chat corrente
  setCurrentChatData: (arg) => arg, // impostare dati chat
  currentGroup: null, // id chat corrente
  setCurrentGroup: (arg) => arg, // impostare id chat
  currentGroupData: null,
  setCurrentGroupData: (arg) => arg,
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
  // useEffect(() => {
  //   const SERVER_URL = "http://localhost:3000";

  //   // Stabilisce la connessione con il server
  //   const socket = io(SERVER_URL);
  //   socketRef.current = socket;
  //   socket.on("connect", () => {
  //     console.log("Socket.IO Connesso! ID:", socket.id);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (socketRef.current) {
  //     // ASCOLTATORE GLOBALE
  //     socketRef.current.on("receive_message", (data) => {
  //       console.log("Messaggio intercettato globalmente:", data);

  //       // 1. FA LA SPIA (Conferma ricezione per doppia spunta)
  //       socketRef.current.emit(
  //         "message_arrived",
  //         data.message_id,
  //         session.user.id,
  //         data.group_id
  //       );

  //       // 2. AGGIORNA LA CHAT SE È APERTA
  //       setCurrentChatData((prevData) => {
  //         // Se non ho una chat aperta o è un altro gruppo, non fare nulla qui
  //         // if (!prevData || prevData.group_id !== data.group_id) return prevData;

  //         // Se è la chat che sto guardando, aggiungi il messaggio
  //         return {
  //           ...prevData,
  //           messaggi: [
  //             ...prevData.messaggi,
  //             {
  //               message_id: data.message_id,
  //               content: data.message,
  //               group_id: data.group_id,
  //               user_id: data.sender_id,
  //               sent_at: Date.now(),
  //               isUser: false,
  //               // isSent: true,
  //               utenti: data.sender,
  //             },
  //           ],
  //         };
  //       });
  //     });

  //     // 3. ASCOLTA QUANDO I TUOI MESSAGGI ARRIVANO AGLI ALTRI (Doppia spunta per te)
  //     socketRef.current.on("message_arrived", (data) => {
  //       // notifica

  //       setCurrentChatData((prevData) => {
  //         if (!prevData) return prevData;
  //         return {
  //           ...prevData,
  //           messaggi: prevData.messaggi.map((m) =>
  //             m.message_id === data.message_id ? { ...m, isSent: true } : m
  //           ),
  //         };
  //       });
  //     });

  //     // socketRef.current.on("message_arrived", (data) => {
  //     //   setCurrentChatData((prevData) => {
  //     //     if (!prevData) return prevData;
  //     //     return {
  //     //       ...prevData,
  //     //       messaggi: prevData.messaggi.map((m) =>
  //     //         m.message_id === data.message_id ? { ...m, isSent: true } : m
  //     //       ),
  //     //     };
  //     //   });
  //     // });
  //     // if (currentGroup) {
  //     //   currentGroupData?.messaggi?.map((mess) => {
  //     //     socketRef.current.emit(
  //     //       "message_read",
  //     //       mess.message_id,
  //     //       session.user.id,
  //     //       currentGroup
  //     //     );
  //     //   });
  //     // }

  //     socketRef.current.on("message_read", (data) => {
  //       setCurrentChatData((prevData) => {
  //         if (!prevData) return prevData;
  //         return {
  //           ...prevData,
  //           messaggi: prevData.messaggi.map((m) =>
  //             m.message_id === data.message_id ? { ...m, isRead: true } : m
  //           ),
  //         };
  //       });
  //     });
  //   }

  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.off("receive_message");
  //       socketRef.current.off("message_arrived");
  //       socketRef.current.off("message_read");
  //     }
  //   };
  // }, [session?.user?.id]);

  // useEffect(() => {
  //   if (currentGroup && currentChatData?.messaggi) {
  //     const unreadMessages = currentChatData.messaggi.filter(
  //       (m) => !m.isRead && m.user_id !== session.user.id
  //     );

  //     unreadMessages.forEach((m) => {
  //       socketRef.current.emit(
  //         "message_read",
  //         m.message_id,
  //         session.user.id,
  //         currentGroup
  //       );
  //     });
  //   }
  // }, [currentGroup, currentChatData?.messaggi?.length]); // Solo quando cambia

  useEffect(() => {
    console.log("currentchatData cambiato", currentChatData);
  }, [currentChatData]);
  return (
    <ChatContext.Provider
      value={{
        currentChatData,
        setCurrentChatData,
        currentGroup, // id chat corrente
        setCurrentGroup, // impostare id chat
        currentGroupData,
        setCurrentGroupData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
