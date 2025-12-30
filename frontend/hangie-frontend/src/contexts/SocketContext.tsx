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
  const {
    setCurrentChatData,
    currentGroup,
    currentChatData,
    currentGroupData,
  } = useChat();
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

      console.log("sto per aggiornare");
      const isMe = data.sender_id === session?.user?.id;

      setCurrentChatData((prevData) => {
        if (!prevData) {
          console.log("Nessuna chat aperta (prevData è null)");
          return prevData;
        }
        // Controllo fondamentale: la chat aperta è la stessa del messaggio in arrivo?
        // Usiamo String() per evitare conflitti tra tipi Number e String
        const currentId = String(prevData.group_id);
        const incomingId = String(data.group_id);
        if (!prevData || String(prevData.group_id) !== String(data.group_id))
          return prevData;

        // BLOCCA DUPLICATI: Se il messaggio esiste già (perché lo hai inviato tu ottimisticamente), non aggiungerlo
        if (prevData.messaggi.some((m) => m.message_id === data.message_id))
          return prevData;
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
              isUser: isMe,
              isSent: isMe ? false : true, // Se è mio, aspetto la conferma (message_arrived). Se è altrui, per me è già arrivato.
              isRead: false,
              utenti: data.sender,
            },
          ],
        };
      });
      console.log("sono me?", isMe);
      if (!isMe) {
        console.log("non sono me faccio sent");
        socket.emit(
          "message_sent",
          data.message_id,
          session?.user?.id,
          data.group_id
        );
      }
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

    return () => {
      console.log("Pulizia socket e rimozione listener...");
      socket.off("receive_message");
      socket.off("message_arrived");
      socket.off("give_read");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id, setCurrentChatData]);

  useEffect(() => {
    if (!currentSocket || !currentGroup || !currentChatData?.messaggi) return;

    currentSocket.on("give_read", (data) => {
      // notifica
      console.log("DENTRO GIVING READ! ID messaggio:", data.message_id);
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
      currentSocket?.off("give_read");
    };
  }, [currentSocket, setCurrentChatData, currentChatData?.messaggi?.length]);
  useEffect(() => {
    if (!currentSocket || !currentGroup || !currentChatData?.messaggi) return;

    const unreadMessages = currentChatData.messaggi.filter(
      (m) => !m.isRead && m.user_id !== session.user.id
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((m) => {
        currentSocket.emit(
          "message_read",
          m.message_id,
          session.user.id,
          currentGroup
        );
      });

      // Aggiorno localmente per evitare loop
      setCurrentChatData((prev) => ({
        ...prev,
        messaggi: prev.messaggi.map((m) =>
          m.user_id !== session?.user?.id && !m.isRead
            ? { ...m, isRead: true }
            : m
        ),
      }));
      // Aggiorna localmente per non ri-emettere subito
    }
    return () => {
      currentSocket?.off("message_read");
    };
  }, [currentChatData?.messaggi?.length, currentGroup, currentSocket]); // Solo quando cambia

  return (
    <SocketContext.Provider value={{ currentSocket, socketRef }}>
      {children}
    </SocketContext.Provider>
  );
};
