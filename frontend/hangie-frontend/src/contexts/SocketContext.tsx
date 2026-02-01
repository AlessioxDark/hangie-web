import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { type GroupData } from "@/types/chat";
import { useMobileLayout } from "./MobileLayoutChatContext";
import { useLocation, useNavigate } from "react-router";

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
    setGroupEventsData,
    setHomeEventsData,
    currentEventData,
    messagesMap,
    groupEventsData,
    setCurrentEventData,
  } = useChat();
  const { session } = useAuth();
  const { setMobileView } = useMobileLayout();
  const currentGroupDataRef = useRef<null | GroupData>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath =
    location.state?.backgroundLocation?.pathname || location.pathname;
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
      console.log("qui arrivo", { groupId, data, participants, imgUrl });
      setGroupsData((prev) => {
        return [
          ...prev,
          {
            group_id: groupId,
            group_cover_img: imgUrl,
            ...data,
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
      const myStatus =
        data.eventi.created_by == session.user.id ? "accepted" : "pending";
      const eventMessage = {
        type: "event",
        message_id: data.messageDetails.message_id,
        event_details: { ...data.eventi, status: myStatus },
        isUser: session.user.id == data.messageDetails.user_id,
      };
      if (currentGroup == data.group_id) {
        setCurrentChatData((prev) => {
          return { ...prev, messaggi: [...prev.messaggi, eventMessage] };
        });
        setGroupEventsData((prevGroups) => [
          ...prevGroups,
          eventMessage.event_details,
        ]);
      }
      if (messagesMap[data.group_id]) {
        setMessagesMap((messMap) => {
          return {
            ...messMap,
            [data.group_id]: [...messMap[data.group_id], eventMessage],
          };
        });
      }

      console.log("controllo se è user", eventMessage.isUser);
      if (eventMessage.isUser) {
        console.log("si, aggiungo evento", data.eventi);
        setHomeEventsData((prevEvents) => {
          const category = eventMessage.isUser ? "accepted" : "pending";
          return {
            ...prevEvents,
            [category]: [data.eventi, ...prevEvents[category]],
          };
        });
      } else {
        console.log("no, aggiungo evento", data.eventi);
        setHomeEventsData((prevEvents) => {
          return {
            ...prevEvents,
            pending: [data.eventi, ...prevEvents.pending],
          };
        });
      }
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
    socket.on("deleted_event", (data) => {
      // notifica

      console.log("arrivato deleted_event");
      const { event_id, group_id } = data;

      if (currentPath == `/events/${event_id}`) {
        console.log("stesso event_id");
        navigate(-1);
      }
      setMessagesMap((messMap) => {
        const { [group_id]: removed, ...newMessMap } = messMap;
        return newMessMap;
      });

      setHomeEventsData((prevEvents) => {
        return {
          ...prevEvents,
          pending: prevEvents.pending.filter((e) => e.event_id !== event_id),
          accepted: prevEvents.accepted.filter((e) => e.event_id !== event_id),
        };
      });
      if (currentGroup == group_id) {
        console.log("qui lo toglo");
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;
          console.log("prima", prevData.messaggi);
          console.log("restituisco", {
            messaggi: prevData.messaggi.filter((m) => {
              if (m?.event_id == null) return true;
              return m.event_details.event_id !== event_id;
            }),
          });
          return {
            ...prevData,
            messaggi: prevData.messaggi.filter((m) => {
              if (m?.event_id == null) return true;
              return m.event_details.event_id !== event_id;
            }),
          };
        });
        console.log(groupEventsData);
        setGroupEventsData((prevEvents) => {
          return prevEvents.filter((e) => e.event_id !== event_id);
        });
      }
    });
    socket.on("voted_event", (data) => {
      // notifica
      console.log("arrivato voted_event");
      const { event_id, group_id, status, sender_id, prevStatus } = data;
      // setMessagesMap((messMap) => {
      //   const { [group_id]: removed, ...newMessMap } = messMap;
      //   return newMessMap;
      // });
      console.log({ event_id, group_id, status, sender_id, prevStatus });
      if (sender_id == session.user.id) {
        // bug con i partecipanti dell'evento al cambio per il sender
        console.log("modifichiamo per sender");
        setHomeEventsData((prevEvents) => {
          const eventToMove = prevEvents[prevStatus].find(
            (e) => e.event_id == event_id,
          );
          console.log("prevEvents", prevEvents);
          console.log("evento da spostare", eventToMove);
          console.log("risultato", {
            ...prevEvents,
            [status]: [eventToMove, ...prevEvents[status]],
            [prevStatus]: prevEvents[prevStatus].filter(
              (e) => e.event_id !== event_id,
            ),
          });

          return {
            ...prevEvents,
            [status]: [eventToMove, ...prevEvents[status]],
            [prevStatus]: prevEvents[prevStatus].filter(
              (e) => e.event_id !== event_id,
            ),
          };
        });

        if (currentEventData && currentEventData.event_id == event_id) {
          setCurrentEventData((prev) => {
            const newRisposte = {
              ...prev.risposte_evento,
              [status]: [
                ...prev.risposte_evento[status],
                { status, utenti: { user_id: sender_id } },
              ],
              [prevStatus]: prev.risposte_evento[prevStatus].filter(
                (p) => p.utenti.user_id !== sender_id,
              ),
            };
            return { ...prev, risposte_evento: newRisposte };
          });
        }
      }
      if (currentGroup == group_id) {
        console.log("qui lo toglo");
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            messaggi: prevData.messaggi.map((m) => {
              if (m.type == "event" && m.event_id == event_id) {
                console.log(
                  "prima di modifica",
                  m.event_details.risposte_eventi,
                );
                const altreRisposte = m.event_details.risposte_eventi.filter(
                  (r) => r.utenti?.user_id !== sender_id,
                );

                const newRisposte =
                  status !== "pending"
                    ? [
                        ...altreRisposte,
                        { status, utenti: { user_id: sender_id } },
                      ]
                    : altreRisposte;
                console.log("questi sono i nuovi risposte", newRisposte);
                return {
                  ...m,
                  event_details: {
                    ...m.event_details,
                    status,
                    risposte_eventi: newRisposte,
                  },
                };
              }
              return m;
            }),
          };
        });
        setGroupEventsData((prevEvents) => {
          return prevEvents.map((e) => {
            if (e.event_id == event_id) {
              // const newRisposte = {
              //   [prevStatus]:     ...e.risposte_eventi[prevStatus].filter(
              //     (event) => event.event_id !== event_id,
              //   ),
              //   { ...eventToMove, status },
              // }
              const altreRisposte = e.risposte_evento[prevStatus].filter(
                (r) => r.user_id !== sender_id,
              );

              const newRisposte = [
                ...altreRisposte,
                { status, user_id: sender_id },
              ];

              return {
                ...e,
                risposte_evento: {
                  ...e.risposte_evento,
                  [prevStatus]: altreRisposte,
                  [status]: newRisposte,
                },
                status,
              };
            }
            return e;
          });
        });
      }
      console.log("non lo ho inviato io");
      setHomeEventsData((prevEvents) => {
        const category = status;
        console.log("la category è", category);
        const categoryEvents = prevEvents[category].map((event) => {
          if (event.event_id == event_id) {
            const newRisposte = {
              ...event.risposte_evento,
              [prevStatus]: event.risposte_evento[prevStatus]
                .filter((e) => e.utenti.user_id !== sender_id)
                .map((e) => {
                  return { ...e, utenti: { user_id: e.user_id } };
                }),
              [status]: [
                { status: status, utenti: { user_id: sender_id } },
                ...event.risposte_evento[status],
              ],
            };
            return { ...event, risposte_evento: newRisposte };
          } else {
            return event;
          }
        });
        return { ...prevEvents, [category]: categoryEvents };
      });
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
      socket.off("deleted_event");
      socket.off("voted_event");
      socket.disconnect();
    };
  }, [
    session?.user?.id,
    setCurrentChatData,
    currentGroupData,
    currentGroup,
    location.pathname,
  ]);

  useEffect(() => {});
  return (
    <SocketContext.Provider value={{ currentSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
