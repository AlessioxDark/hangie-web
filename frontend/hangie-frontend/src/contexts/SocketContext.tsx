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
    setGroupsData,
    groupsData,
    setCurrentGroupData,
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
    socket.emit("identify_user", session.user.id);
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

    socket.on(
      "added_new_group",
      (groupId, data, participants, imgUrl, sender) => {
        // notifica
        console.log(data);
        const nuoviPartecipanti = participants.map((p) => {
          return {
            utenti: { nome: p.nome, handle: p.handle, user_id: p.user_id },
            ...p,
          };
        });
        console.log("aggiorno data perchè intercettato", {
          group_id: groupId,
          group_cover_img: imgUrl,
          ...data.groupData,
          partecipanti_gruppo: nuoviPartecipanti,
        });

        setGroupsData((prev) => {
          return [
            ...prev,
            {
              group_id: groupId,
              group_cover_img: imgUrl,
              ...data.groupData,
              partecipanti_gruppo: nuoviPartecipanti,
            },
          ];
        });

        // participants.forEach((p) => {
        //   socket.to.emit("new_notification", {
        //     type: "new_group",
        //     sender: sender,
        //     receiver: p,
        //     group_id: groupId,
        //     // messaggio: { content: message },
        //     gruppo: data,
        //     user_id: p.partecipante_id, // Il client filtrerà se è per lui
        //     created_at: new Date(),
        //     is_read: false,
        //   });
        // });
      }
    );

    socket.on("left_group", (groupId, userId) => {
      // notifica
      console.log("ricevuto left group");
      if (session.user.id == userId) {
        console.log("sono quello uscito");
        setGroupsData((prev) => {
          return prev.filter((group) => group.group_id !== groupId);
        });
      } else {
        console.log("sono quello non uscito");
        setGroupsData((prev) => {
          return prev.map((group) => {
            if (group.group_id == groupId) {
              const newParticipants = group.partecipanti_gruppo.filter(
                (p) => p.partecipante_id !== userId
              );
              return { ...group, partecipanti_gruppo: newParticipants };
            }
            return group;
          });
        });
        console.log("mi trovo in", currentGroupData.group_id);
        console.log("qualcuno è uscito in ", groupId);
        if (currentGroupData.group_id == groupId) {
          console.log(
            "non sono quello uscito e mi trovo nel gruppo che qualcuno ha abbandonato"
          );
          setCurrentGroupData((prev) => {
            const newParticipants = prev.partecipanti_gruppo.filter(
              (p) => p.partecipante_id !== userId
            );
            return { ...prev, partecipanti_gruppo: newParticipants };
          });
        }
      }
    });
    socket.on("removed_participant", (data) => {
      console.log("arrivato removed_participant al frontend");
      console.log("dati dal socket", data);
      console.log("groupsData", groupsData);
      console.log("currentGroupData", currentGroupData);
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            const newParticipants = group.partecipanti_gruppo.filter(
              (p) =>
                (p.partecipante_id || p.user_id) !== data.participant.user_id // Verifica se la chiave è user_id o partecipante_id
            );
            return { ...group, partecipanti_gruppo: newParticipants };
          }
          return group;
        });
      });
      if (currentGroupData.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          const newParticipants = prev.partecipanti_gruppo.filter(
            (p) => (p.partecipante_id || p.user_id) !== data.participant.user_id // Verifica se la chiave è user_id o partecipante_id
          );
          return { ...prev, partecipanti_gruppo: newParticipants };
        });
      }
    });
    socket.on("added_participants", (data) => {
      console.log("arrivato added_participatns al frontend");
      console.log("dati dal socket", data);
      console.log("groupsData", groupsData);
      console.log("currentGroupData", currentGroupData);
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            return {
              ...group,
              partecipanti_gruppo: [
                ...group.partecipanti_gruppo,
                ...data.addedParticipants,
              ],
            };
          }
          return group;
        });
      });
      if (currentGroupData.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          return {
            ...prev,
            partecipanti_gruppo: [
              ...prev.partecipanti_gruppo,
              ...data.addedParticipants,
            ],
          };
        });
      }
    });

    socket.on("edited_field", (data) => {
      console.log("arrivato edited_field al frontend");
      console.log("dati dal socket", data);
      console.log("groupsData", groupsData);
      console.log("currentGroupData", currentGroupData);
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            return {
              ...group,
              [data.field]: data.fieldValue,
            };
          }
          return group;
        });
      });
      console.log(
        "non mi trovo nel gruppo",
        currentGroupData.group_id,
        data.group_id
      );
      if (currentGroupData.group_id == data.group_id) {
        console.log(
          "mi trovo nel gruppo",
          currentGroupData.group_id,
          data.group_id
        );
        console.log("aggiorno campo con valore", data.field, data.fieldValue);
        setCurrentGroupData((prev) => {
          return {
            ...prev,
            [data.field]: data.fieldValue,
          };
        });
      }
    });
    socket.on("admined_participant", (data) => {
      console.log("arrivato admined_field al frontend");
      console.log("dati dal socket", data);
      console.log("groupsData", groupsData);
      console.log("currentGroupData", currentGroupData);
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            const nuoviPartecipantiGruppo = group.partecipanti_gruppo.map(
              (p) => {
                return p.partecipante_id == data.participant.partecipante_id
                  ? { ...p, role: "admin" }
                  : p;
              }
            );
            return {
              ...group,
              partecipanti_gruppo: nuoviPartecipantiGruppo,
            };
          }
          return group;
        });
      });
      console.log(
        "non mi trovo nel gruppo",
        currentGroupData.group_id,
        data.group_id
      );
      if (currentGroupData.group_id == data.group_id) {
        console.log(
          "mi trovo nel gruppo",
          currentGroupData.group_id,
          data.group_id
        );
        setCurrentGroupData((prev) => {
          const nuoviPartecipantiGruppo = prev.partecipanti_gruppo.map((p) => {
            return p.partecipante_id == data.participant.partecipante_id
              ? { ...p, role: "admin" }
              : p;
          });
          return {
            ...prev,
            partecipanti_gruppo: nuoviPartecipantiGruppo,
          };
        });
      }
    });

    return () => {
      console.log("Pulizia socket e rimozione listener...");
      socket.off("receive_message");
      socket.off("message_arrived");
      socket.off("added_new_group");
      socket.off("edited_field");
      socket.off("left_group");
      socket.off("added_participants");
      socket.off("removed_participant");
      socket.off("admined_participant");
      socket.off("give_read");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id, setCurrentChatData, currentGroupData, currentGroup]);

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
