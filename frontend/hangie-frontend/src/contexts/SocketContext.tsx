import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { type GroupData } from "@/types/chat";
import { useMobileLayoutChat } from "./MobileLayoutChatContext";

const SocketContext = createContext({
  currentSocket: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error(
      "useSocket deve essere usato all'interno di un ChatProvider",
    );
  }

  return context;
};

export const SocketProvider = ({ children }) => {
  const [currentSocket, setCurrentSocket] = useState(null); // Usiamo lo stato invece di useRef per la disponibilità
  const {
    setCurrentChatData,
    currentGroup,
    currentGroupData,
    setGroupsData,

    setCurrentGroup,
    setCurrentGroupData,
    setMessagesMap,
  } = useChat();
  const { session } = useAuth();
  const { setMobileView } = useMobileLayoutChat();
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
      setCurrentSocket(socket);
    });
    socket.on("receive_message", (data) => {
      const isMe = data.sender_id === session?.user?.id;
      const newMessage = {
        message_id: data.message_id,
        content: data.message,
        group_id: data.group_id,
        user_id: data.sender_id,
        sent_at: Date.now(),
        isUser: isMe,
        isSent: !isMe,
        isRead: false,
        utenti: data.sender,
      };
      setGroupsData((prev) =>
        prev.map((g) =>
          String(g.group_id) === data.group_id
            ? {
                ...g,
                ultimoMessaggio: newMessage,
                updated_at: new Date().toISOString(),
              }
            : g,
        ),
      );
      setMessagesMap((messMap) => {
        const existingMessages = messMap[data.group_id] || [];

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

          if (!prevData || String(prevData.group_id) !== String(data.group_id))
            return prevData;

          // BLOCCA DUPLICATI: Se il messaggio esiste già (perché lo hai inviato tu ottimisticamente), non aggiungerlo
          if (prevData.messaggi.some((m) => m.message_id === data.message_id))
            return prevData;

          // Aggiungiamo il messaggio all'array
          return {
            ...prevData,
            messaggi: [...prevData.messaggi, newMessage],
          };
        });
      }
      if (!isMe) {
        socket.emit(
          "message_sent",
          data.message_id,
          session?.user?.id,
          data.group_id,
        );
      }
    });

    // 3. ASCOLTA QUANDO I TUOI MESSAGGI ARRIVANO AGLI ALTRI (Doppia spunta per te)
    socket.on("message_arrived", (data) => {
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
              m.message_id === data.message_id ? { ...m, isSent: true } : m,
            ),
          };
        });
      }
    });

    socket.on("added_new_group", (groupId, data, participants, imgUrl) => {
      setGroupsData((prev) => {
        return [
          ...prev,
          {
            group_id: groupId,
            group_cover_img: imgUrl,
            ...data.groupData,
            partecipanti_gruppo: participants,
          },
        ];
      });
    });

    socket.on("left_group", (groupId, userId) => {
      // notifica
      if (session.user.id == userId) {
        console.log("sono l'utente uscito");
        setGroupsData((prev) => {
          return prev.filter((group) => group.group_id !== groupId);
        });
      } else {
        setGroupsData((prev) => {
          return prev.map((group) => {
            if (group.group_id == groupId) {
              const newParticipants = group.partecipanti_gruppo.filter(
                (p) => p.user_id !== userId,
              );
              return { ...group, partecipanti_gruppo: newParticipants };
            }
            return group;
          });
        });
        if (currentGroupData.group_id == groupId) {
          setCurrentGroupData((prev) => {
            const newParticipants = prev.partecipanti_gruppo.filter(
              (p) => p.user_id !== userId,
            );
            return { ...prev, partecipanti_gruppo: newParticipants };
          });
        }
      }
    });
    socket.on("removed_participant", (data) => {
      const isMe = session.user.id == data.participant.user_id;
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        console.log("sono io ?", isMe);
        if (!isMe) {
          return prev.map((group) => {
            if (group.group_id === data.group_id) {
              const newParticipants = group.partecipanti_gruppo.filter(
                (p) =>
                  (p.partecipante_id || p.user_id) !== data.participant.user_id,
              );
              return { ...group, partecipanti_gruppo: newParticipants };
            }
            return group;
          });
        } else {
          console.log("non sono io controllo tra i gruppi");
          return prev.filter((g) => {
            console.log(g.group_id, data.group_id);

            return g.group_id !== data.group_id;
          });
        }

        // return prev.map((group) => {
        //   if (!isMe) {
        //     if (group.group_id === data.group_id) {
        //       const newParticipants = group.partecipanti_gruppo.filter(
        //         (p) =>
        //           (p.partecipante_id || p.user_id) !== data.participant.user_id,
        //       );
        //       return { ...group, partecipanti_gruppo: newParticipants };
        //     } else {
        //       return group;
        //     }
        //   } else {
        //     return prev.filter((g) => g.group_id !== data.group_id);
        //   }
        // });
      });
      if (currentGroupData.group_id == data.group_id) {
        if (isMe) {
          setMobileView("groups");
          setCurrentGroup(null);
          return;
        }
        setCurrentGroupData((prev) => {
          const newParticipants = prev.partecipanti_gruppo.filter(
            (p) =>
              (p.partecipante_id || p.user_id) !== data.participant.user_id, // Verifica se la chiave è user_id o partecipante_id
          );
          return { ...prev, partecipanti_gruppo: newParticipants };
        });
      }
    });
    socket.on("added_participants", (data) => {
      setGroupsData((prev) => {
        const groupExists = prev.find((g) => g.group_id === data.group_id);
        // Usiamo MAP per creare un nuovo array, non forEach
        if (groupExists) {
          return prev.map((group) => {
            if (group.group_id === data.group_id) {
              return {
                ...group,
                partecipanti_gruppo: data.newParticipants,
              };
            }
            return group;
          });
        } else {
          return [data.groupInfo, ...prev];
        }
      });
      if (currentGroup && currentGroupData.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          return {
            ...prev,
            partecipanti_gruppo: data.newParticipants,
          };
        });
      }
    });

    socket.on("edited_field", (data) => {
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
      if (currentGroupData.group_id == data.group_id) {
        setCurrentGroupData((prev) => {
          return {
            ...prev,
            [data.field]: data.fieldValue,
          };
        });
      }
    });
    socket.on("admined_participant", (data) => {
      setGroupsData((prev) => {
        return prev.map((group) => {
          if (group.group_id === data.group_id) {
            const nuoviPartecipantiGruppo = group.partecipanti_gruppo.map(
              (p) => {
                return p.partecipante_id == data.participant.partecipante_id
                  ? { ...p, role: "admin" }
                  : p;
              },
            );
            return {
              ...group,
              partecipanti_gruppo: nuoviPartecipantiGruppo,
            };
          }
          return group;
        });
      });

      if (currentGroupData.group_id == data.group_id) {
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
        isUser: session.user.id == data.messageDetails.user_id,
      };
      setCurrentChatData((prev) => {
        return { ...prev, messaggi: [...prev.messaggi, eventMessage] };
      });
      setMessagesMap((messMap) => {
        return {
          ...messMap,
          [data.group_id]: [...messMap[data.group_id], eventMessage],
        };
      });
    });
    socket.on("give_read_bulk", (data) => {
      // notifica
      console.log("arrivato bulk frontend");

      setMessagesMap((messMap) => {
        return {
          ...messMap,
          [data.group_id]: messMap[data.group_id]?.map((mess) => {
            return data.message_ids.includes(mess.message_id)
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
              data.message_ids.includes(m.message_id)
                ? { ...m, isRead: true }
                : m,
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
      socket.off("give_read_bulk");
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
