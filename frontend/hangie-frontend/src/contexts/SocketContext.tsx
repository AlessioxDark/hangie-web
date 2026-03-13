import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { type GroupData } from "@/types/chat";
import { useLocation, useNavigate } from "react-router";
import { useFriends } from "./FriendsContext";
import { useScreen } from "./ScreenContext";

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
  const { currentScreen } = useScreen();
  const { getFriendsData } = useFriends();
  const currentGroupDataRef = useRef<null | GroupData>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath =
    location.state?.backgroundLocation?.pathname || location.pathname;
  useEffect(() => {
    currentGroupDataRef.current = currentGroupData;
  }, [currentGroupData]);

  // const SERVER_URL = "https://hangie-web.onrender.com/";
  const SERVER_URL = "http://localhost:3000/";
  useEffect(() => {
    if (!session?.user?.id || currentScreen !== "xs") {
      return;
    }

    const socket = io(SERVER_URL);
    socket.on("connect", () => {
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
            ...data,
            partecipanti_gruppo: participants,
            ultimoMessaggio: { sent_at: Date.now(), content: "" },
          },
        ];
      });
    });

    socket.on("left_group", (groupId, userId) => {
      const isMe = session.user.id == userId;
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach

        if (!isMe) {
          return prev.map((group) => {
            if (group.group_id === groupId) {
              const newParticipants = group.partecipanti_gruppo.filter(
                (p) => (p.partecipante_id || p.user_id) !== userId,
              );
              return { ...group, partecipanti_gruppo: newParticipants };
            }
            return group;
          });
        } else {
          return prev.filter((g) => {
            return g.group_id !== groupId;
          });
        }
      });
      if (currentGroup && currentGroup == groupId) {
        setCurrentGroupData((prev) => {
          const newParticipants = prev.partecipanti_gruppo.filter(
            (p) => (p.partecipante_id || p.user_id) !== userId, // Verifica se la chiave è user_id o partecipante_id
          );

          return { ...prev, partecipanti_gruppo: newParticipants };
        });
        if (!isMe) {
          setCurrentChatData((prevChat) => {
            const newMessaggi = prevChat.messaggi.map((m) => {
              if (m.type == "event") {
                const newRisposte = m.event_details.risposte_evento.filter(
                  (r) => r.utenti.user_id !== userId,
                );
                return {
                  ...m,
                  event_details: {
                    ...m.event_details,
                    risposte_evento: newRisposte,
                  },
                };
              }
              return m;
            });
            return { ...prevChat, messaggi: newMessaggi };
          });
        }
      }

      if (isMe) {
        setHomeEventsData((prevEvents) => {
          return {
            pending: prevEvents.pending.filter((e) => e.group_id !== groupId),
            accepted: prevEvents.accepted.filter((e) => e.group_id !== groupId),
            rejected: prevEvents.rejected.filter((e) => e.group_id !== groupId),
          };
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
        // MANCA CARICAMENTO DA ROUTE DI CURRENTCHATDATA E POI TESTIAMO TUTTO
        setCurrentChatData((prev) => {
          const newMessaggi = prev.messaggi.map((m) => {
            if (m.type == "event") {
              const newRisposte = [
                ...m.event_details.risposte_evento,
                ...data.eventsResponses[m.event_id],
              ];
              return {
                ...m,
                event_details: {
                  ...m.event_details,
                  risposte_evento: newRisposte,
                },
              };
            }
            return m;
          });
          return { ...prev, messaggi: newMessaggi };
        });
      }

      if (data.eventsDetails) {
        // "L'OPPOSTO" DEL REDUCE: Trasformiamo l'oggetto in un array piatto
        // data.eventsDetails è { "id1": [event], "id2": [event] }
        const flatEvents = Object.values(data.eventsDetails).flat();

        setHomeEventsData((prevData) => {
          // Evitiamo duplicati: filtriamo gli eventi che sono già presenti in qualche categoria
          const existingIds = new Set([
            ...prevData.accepted.map((e) => e.event_id),
            ...prevData.pending.map((e) => e.event_id),
          ]);

          const newPendingEvents = flatEvents.filter(
            (e) => !existingIds.has(e.event_id),
          );

          return {
            ...prevData,
            pending: [...newPendingEvents, ...prevData.pending],
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
      const myStatus =
        data.eventi.created_by == session.user.id ? "accepted" : "pending";
      const eventMessage = {
        type: "event",
        message_id: data.messageDetails.message_id,
        event_details: { ...data.eventi, status: myStatus },
        isUser: session.user.id == data.messageDetails.user_id,
        group_id: data.group_id,
        event_id: data.eventi.event_id,
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

      if (eventMessage.isUser) {
        setHomeEventsData((prevEvents) => {
          const category = eventMessage.isUser ? "accepted" : "pending";
          return {
            ...prevEvents,
            [category]: [data.eventi, ...prevEvents[category]],
          };
        });
      } else {
        setHomeEventsData((prevEvents) => {
          return {
            ...prevEvents,
            pending: [data.eventi, ...prevEvents.pending],
          };
        });
      }
      setGroupsData((prevData) => {
        return prevData.map((g) => {
          if (g.group_id == data.group_id) {
            return {
              ...g,
              ultimoMessaggio: {
                type: "event",
                content: data.eventi.titolo,
                sent_at: Date.now(),
              },
            };
          }
          return g;
        });
      });
    });
    socket.on("give_read_bulk", (data) => {
      // notifica

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
    socket.on("removed_participant", (data) => {
      const isMe = session.user.id == data.participant.user_id;
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach

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
          return prev.filter((g) => {
            return g.group_id !== data.group_id;
          });
        }
      });
      if (currentGroup && currentGroup == data.group_id) {
        if (isMe) {
          navigate("/chats");
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
        if (!isMe) {
          setCurrentChatData((prevChat) => {
            const newMessaggi = prevChat.messaggi.map((m) => {
              if (m.type == "event") {
                const newRisposte = m.event_details.risposte_evento.filter(
                  (r) => r.utenti.user_id !== data.participant.user_id,
                );
                return {
                  ...m,
                  event_details: {
                    ...m.event_details,
                    risposte_evento: newRisposte,
                  },
                };
              }
              return m;
            });
            return { ...prevChat, messaggi: newMessaggi };
          });
        }
      }

      if (isMe) {
        setHomeEventsData((prevEvents) => {
          return {
            pending: prevEvents.pending.filter(
              (e) => e.group_id !== data.group_id,
            ),
            accepted: prevEvents.accepted.filter(
              (e) => e.group_id !== data.group_id,
            ),
            rejected: prevEvents.rejected.filter(
              (e) => e.group_id !== data.group_id,
            ),
          };
        });
      }
    });
    socket.on("deleted_event", (data) => {
      // notifica

      const { event_id, group_id } = data;

      if (currentPath == `/events/${event_id}`) {
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
        setCurrentChatData((prevData) => {
          if (!prevData) return prevData;

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

        setGroupEventsData((prevEvents) => {
          return prevEvents.filter((e) => e.event_id !== event_id);
        });
      }
    });
    socket.on("voted_event", (data) => {
      // notifica

      const { event_id, group_id, status, sender_id, prevStatus, profile_pic } =
        data;

      if (sender_id == session.user.id) {
        // bug con i partecipanti dell'evento al cambio per il sender

        setHomeEventsData((prevEvents) => {
          const eventToMove = prevEvents[prevStatus].find(
            (e) => e.event_id == event_id,
          );

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
        console.log(
          "controllo se i due event id sono uguali",
          currentEventData.event_id,
          event_id,
        );
        if (currentEventData && currentEventData.event_id == event_id) {
          setCurrentEventData((prev) => {
            const newResponses = prev.risposte_evento.filter(
              (r) => r.utenti.user_id !== sender_id,
            );

            const newRisposte = [
              ...newResponses,
              { status, utenti: { user_id: sender_id, profile_pic } },
            ];
            return { ...prev, risposte_evento: newRisposte };
          });
        }
      }
      if (currentGroup == group_id) {
        console.log("prev?", groupEventsData);
        setGroupEventsData((prevEvents) => {
          // console.log("prev?", prevEvents);
          if (!prevEvents) return null;
          return prevEvents.map((e) => {
            if (e.event_id == event_id) {
              // const newRisposte = {
              //   [prevStatus]:     ...e.risposte_eventi[prevStatus].filter(
              //     (event) => event.event_id !== event_id,
              //   ),
              //   { ...eventToMove, status },
              // }

              // const altreRisposte = e.risposte_evento.filter(
              //   (r) => r.user_id !== sender_id,
              // );

              const newRisposte = e.risposte_evento.map((r) => {
                return r.user_id == sender_id
                  ? { ...r, status, user_id: sender_id, profile_pic }
                  : r;
              });

              return {
                ...e,
                risposte_evento: [...newRisposte],
                status: session.user.id == sender_id ? status : e.status,
                profile_pic,
              };
            }
            return e;
          });
        });
      }

      setHomeEventsData((prevEvents) => {
        const prevCategory = (
          Object.keys(prevEvents) as Array<keyof typeof prevEvents>
        ).find((cat) => prevEvents[cat].some((e) => e.event_id === event_id));

        if (!prevCategory) return prevEvents; // Se non lo trova, non fare nulla

        // 2. Trova l'oggetto evento originale
        const eventToUpdate = prevEvents[prevCategory].find(
          (e) => e.event_id === event_id,
        );
        if (!eventToUpdate) return prevEvents;

        // 3. Crea il nuovo oggetto evento con le risposte aggiornate
        const updatedEvent = {
          ...eventToUpdate,
          status: session.user.id === sender_id ? status : eventToUpdate.status,
          risposte_evento: eventToUpdate.risposte_evento.map((r) =>
            r.utenti.user_id === session.user.id
              ? { ...r, status: status, profile_pic } // Aggiorna solo lo stato dell'utente corrente
              : r,
          ),
        };

        // 4. Se l'utente loggato è colui che ha cambiato stato, sposta l'evento di categoria
        if (session.user.id === sender_id) {
          const newCategory = status as keyof typeof prevEvents;

          return {
            ...prevEvents,
            // Rimuovi dalla vecchia categoria
            [prevCategory]: prevEvents[prevCategory].filter(
              (e) => e.event_id !== event_id,
            ),
            // Aggiungi alla nuova categoria (evitando duplicati per sicurezza)
            [newCategory]: [
              ...prevEvents[newCategory].filter((e) => e.event_id !== event_id),
              updatedEvent,
            ],
          };
        }

        // 5. Se è stato un altro utente, aggiorna l'evento restando nella stessa categoria
        return {
          ...prevEvents,
          [prevCategory]: prevEvents[prevCategory].map((e) =>
            e.event_id === event_id ? updatedEvent : e,
          ),
        };
      });
      setCurrentChatData((prevData) => {
        if (!prevData) return prevData;
        const newMessaggi = prevData.messaggi.map((m) => {
          if (m.type == "event" && m.event_id == event_id) {
            const newRisposte = m.event_details.risposte_evento.map((r) => {
              return r.utenti?.user_id == sender_id
                ? { ...r, status, profile_pic }
                : r;
            });

            return {
              ...m,
              event_details: {
                ...m.event_details,
                status:
                  session.user.id == sender_id
                    ? status
                    : m.event_details.status,
                risposte_evento: newRisposte,
              },
            };
          }
          return m;
        });
        return {
          ...prevData,
          messaggi: newMessaggi,
        };
      });
      if (currentEventData.event_id == event_id) {
        setCurrentEventData((event) => {
          const newRisposte = event.risposte_evento.map((r) => {
            return r.utenti.user_id == sender_id
              ? {
                  ...r,
                  status,
                  user_id: sender_id,
                  utenti: { user_id: sender_id, profile_pic },
                }
              : r;
          });
          return { ...event, risposte_evento: newRisposte };
        });
      }
    });
    socket.on("sent_request", (data) => {
      // notifica

      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("deleted_friend", (data) => {
      // notifica
      console.log("rimuovo amico");
      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("accepted_request", (data) => {
      // notifica
      console.log("accetto richest");
      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("rejected_request", (data) => {
      // notifica
      console.log("rimuovo richiest");
      if (getFriendsData) {
        getFriendsData();
      }
    });

    return () => {
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
      socket.off("sent_request");
      socket.off("deleted_friend");
      socket.off("accepted_request");
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
