import React, {
  Component,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";

type UUID = string;
interface User {
  user_id: UUID;
  nome: string;
  handle: string;
  profile_pic: string | null;
}
interface Participant {
  correlation_id: UUID;
  role: "admin" | "member";
  joinedAt: string;
  group_id: UUID;
  user: User;
}
interface GroupData {
  nome: string;
  partecipanti_gruppo: Participant[];
  group_id: UUID;
  descrizione: string;
  createdBy: UUID;
  created_at: string;
  group_cover_img: string | null;
  event_id: UUID | null;
  updated_at: string | null;
}
const SocketContext = createContext({
  currentSocket: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error(
      "useSocket deve essere usato all'interno di un ChatProvider"
    );
  }

  return context;
};
interface SocketProps {
  children: Component;
}
export const SocketProvider = ({ children }: SocketProps) => {
  const [currentSocket, setCurrentSocket] = useState(null); // Usiamo lo stato invece di useRef per la disponibilità
  const {
    setCurrentChatData,
    currentGroup,
    currentGroupData,
    setGroupsData,
    groupsData,
    setCurrentGroupData,
    setMessagesMap,
  } = useChat();
  const { session } = useAuth();

  const currentGroupDataRef = useRef<null | GroupData>(null);

  useEffect(() => {
    currentGroupDataRef.current = currentGroupData;
  }, [currentGroupData]);

  const SERVER_URL = "http://localhost:3000";
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const socket = io(SERVER_URL);
    socket.on("connect", () => {
      console.log("Socket.IO Connesso! ID:", socket.id);
      socket.emit("identify_user", session.user.id);
      setCurrentSocket(socket); // Questo scatena il re-render dei figli
    });
    socket.on("receive_message", (data) => {
      console.log("Messaggio intercettato globalmente:", data);

      console.log("sto per aggiornare");
      const isMe = data.sender_id === session?.user?.id;
      const lastMessage = {
        message_id: data.message_id,
        content: data.message,
        group_id: data.group_id,
        user_id: data.sender_id,
        sent_at: Date.now(),
        isUser: isMe,
        isSent: !isMe, // Più pulito: se non sono io, è arrivato. Se sono io, aspetto conferma.
        isRead: false,
        utenti: data.sender,
      };
      setGroupsData((prev) =>
        prev.map((g) =>
          String(g.group_id) === data.group_id
            ? {
                ...g,
                ultimoMessaggio: lastMessage,
                updated_at: new Date().toISOString(),
              }
            : g
        )
      );
      setMessagesMap((messMap) => {
        const existingMessages = messMap[data.group_id] || [];
        console.log("exmess", existingMessages);
        // Protezione anti-duplicati anche qui

        const newMessage = {
          message_id: data.message_id,
          content: data.message,
          group_id: data.group_id,
          user_id: data.sender_id,
          sent_at: Date.now(),
          isUser: isMe,
          isSent: !isMe, // Più pulito: se non sono io, è arrivato. Se sono io, aspetto conferma.
          isRead: false,
          utenti: data.sender,
        };

        return {
          ...messMap,
          [data.group_id]: [...existingMessages, newMessage],
        };
      });
      if (data.group_id == currentGroup) {
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
                isSent: !isMe,
                isRead: false,
                utenti: data.sender,
              },
            ],
          };
        });
      }
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
      console.log("messa rrivato a me");
      setMessagesMap((messMap) => {
        return {
          ...messMap,
          [data.group_id]: messMap[data.group_id]?.map((mess) => {
            return mess.message_id === data.message_id
              ? { ...mess, isSent: true }
              : mess;
          }),
        };
      });
      if (currentGroup == data.group_id) {
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            messaggi: prevData.messaggi.map((m) =>
              m.message_id === data.message_id ? { ...m, isSent: true } : m
            ),
          };
        });
      }
    });

    socket.on("added_new_group", (groupId, data, participants, imgUrl) => {
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
    });

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
    socket.on("sent_event", (data) => {
      console.log("dati dall'invio eventi al socket", data);
      const eventMessage = {
        type: "event",
        message_id: data.messageDetails.message_id,
        event_details: data.messageDetails.eventi,
        isUser: session.user.id == data.messageData.user_id,
      };
      setCurrentChatData((prev) => {
        return [...prev, eventMessage];
      });
    });
    socket.on("give_read", (data) => {
      // notifica
      console.log("DENTRO GIVING READ! ID messaggio:", data.message_id);

      setMessagesMap((messMap) => {
        return {
          ...messMap,
          [data.group_id]: messMap[data.group_id]?.map((mess) => {
            return mess.message_id === data.message_id
              ? { ...mess, isRead: true }
              : mess;
          }),
        };
      });
      if (currentGroup == data.group_id) {
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            messaggi: prevData.messaggi.map((m) =>
              m.message_id === data.message_id ? { ...m, isRead: true } : m
            ),
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
      socket.off("sent_event");
      socket.disconnect();
    };
  }, [session?.user?.id, setCurrentChatData, currentGroupData, currentGroup]);

  useEffect(() => {});
  return (
    <SocketContext.Provider value={{ currentSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
