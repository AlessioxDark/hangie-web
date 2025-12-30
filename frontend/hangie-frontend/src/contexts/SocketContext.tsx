import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";

const SocketContext = createContext({
  socketRef: null,
  currentSocket: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error(
      "useSocket deve essere usato all'interno di un ChatProvider"
    );
  }

  return context;
};

export const SocketProvider = ({ children }) => {
  const [currentSocket, setCurrentSocket] = useState(null); // Usiamo lo stato invece di useRef per la disponibilità
  const { setCurrentChatData } = useChat();
  const { session } = useAuth();
  const socketRef = useRef(null);
  const SERVER_URL = "http://localhost:3000";
  useEffect(() => {
    if (!session?.user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SERVER_URL);
    socket.on("connect", () => {
      console.log("Socket.IO Connesso! ID:", socket.id);
      socketRef.current = socket;
      setCurrentSocket(socket); // Questo scatena il re-render dei figli
    });

    // ASCOLTATORE GLOBALE
    socket.on("receive_message", (data) => {
      console.log("Messaggio intercettato globalmente:", data);

      // 1. FA LA SPIA (Conferma ricezione per doppia spunta)

      // 2. AGGIORNA LA CHAT SE È APERTA

      console.log("sto per aggiornare");
      setCurrentChatData((prevData) => {
        if (!prevData) {
          console.log("Nessuna chat aperta (prevData è null)");
          return prevData;
        }
        // Controllo fondamentale: la chat aperta è la stessa del messaggio in arrivo?
        // Usiamo String() per evitare conflitti tra tipi Number e String
        const currentId = String(prevData.group_id);
        const incomingId = String(data.group_id);

        console.log(
          `Confronto ID: Locale(${currentId}) vs In arrivo(${incomingId})`
        );

        // Aggiungiamo il messaggio all'array
        return {
          ...prevData,
          messaggi: [
            ...prevData.messaggi,
            {
              message_id: data.message_id,
              content: data.message,
              group_id: data.group_id,
              user_id: data.sender_id,
              sent_at: Date.now(),
              isUser: data.sender_id === session.user.id,
              utenti: data.sender,
            },
          ],
        };
      });
      socket.emit(
        "message_arrived",
        data.message_id,
        session?.user?.id,
        data.group_id
      );
    });

    // 3. ASCOLTA QUANDO I TUOI MESSAGGI ARRIVANO AGLI ALTRI (Doppia spunta per te)
    socket.on("message_arrived", (data) => {
      // notifica

      setCurrentChatData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          messaggi: prevData.messaggi.map((m) =>
            m.message_id === data.message_id ? { ...m, isSent: true } : m
          ),
        };
      });
    });

    socket.on("message_read", (data) => {
      setCurrentChatData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          messaggi: prevData.messaggi.map((m) =>
            m.message_id === data.message_id ? { ...m, isRead: true } : m
          ),
        };
      });
    });

    return () => {
      console.log("Pulizia socket e rimozione listener...");
      socket.off("receive_message");
      socket.off("message_arrived");
      socket.off("message_read");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id, setCurrentChatData]);

  //   useEffect(() => {
  //     return () => {
  //       if (socketRef.current) {
  //         socketRef.current.off("receive_message");
  //         socketRef.current.off("message_arrived");
  //         socketRef.current.off("message_read");
  //       }
  //     };
  //   }, [socketRef.current]);

  //   useEffect(() => {
  //     if (currentGroup && currentChatData?.messaggi) {
  //       const unreadMessages = currentChatData.messaggi.filter(
  //         (m) => !m.isRead && m.user_id !== session.user.id
  //       );

  //       unreadMessages.forEach((m) => {
  //         socketRef.current.emit(
  //           "message_read",
  //           m.message_id,
  //           session.user.id,
  //           currentGroup
  //         );
  //       });
  //     }
  //   }, [currentGroup, currentChatData?.messaggi?.length]); // Solo quando cambia

  return (
    <SocketContext.Provider value={{ currentSocket, socketRef }}>
      {children}
    </SocketContext.Provider>
  );
};
