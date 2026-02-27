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

  const SERVER_URL = "http://localhost:3000";
  useEffect(() => {
    if (!session?.user?.id || currentScreen !== "xs") {
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
            ultimoMessaggio: { sent_at: Date.now(), content: "" },
          },
        ];
      });
    });

    socket.on("left_group", (groupId, userId) => {
      console.log("leaving...", { groupId, userId, myid: session.user.id });
      const isMe = session.user.id == userId;
      setGroupsData((prev) => {
        // Usiamo MAP per creare un nuovo array, non forEach
        console.log("sono io ?", isMe);
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
          console.log("non sono io controllo tra i gruppi");
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
          console.log("non sono io");
          setCurrentChatData((prevChat) => {
            const newMessaggi = prevChat.messaggi.map((m) => {
              if (m.type == "event") {
                console.log(m, m.risposte_evento);
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
      console.log("e qui ci sto");
      if (isMe) {
        console.log("tolgo eventi");
        setHomeEventsData((prevEvents) => {
          console.log("questi", prevEvents);
          return {
            pending: prevEvents.pending.filter((e) => e.group_id !== groupId),
            accepted: prevEvents.accepted.filter((e) => e.group_id !== groupId),
            rejected: prevEvents.rejected.filter((e) => e.group_id !== groupId),
          };
        });
      }
    });
    socket.on("added_participants", (data) => {
      console.log("data dal socket", data);
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
        console.log("c'è eventdetails");

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
      console.log("dati dall'invio eventi al socket", data);
      console.log("sent_event");
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
    socket.on("removed_participant", (data) => {
      console.log("rimosso");
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
      if (currentGroup && currentGroup == data.group_id) {
        if (isMe) {
          navigate(-1);
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
          console.log("non sono io");
          setCurrentChatData((prevChat) => {
            const newMessaggi = prevChat.messaggi.map((m) => {
              if (m.type == "event") {
                console.log(m, m.risposte_evento);
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
      console.log("e qui ci sto");
      if (isMe) {
        console.log("tolgo eventi");
        setHomeEventsData((prevEvents) => {
          console.log("questi", prevEvents);
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
        console.log(
          "controllo se i due event id sono uguali",
          currentEventData.event_id,
          event_id,
        );
        if (currentEventData && currentEventData.event_id == event_id) {
          console.log("lo sono");
          setCurrentEventData((prev) => {
            const newResponses = prev.risposte_evento.filter(
              (r) => r.utenti.user_id !== sender_id,
            );

            const newRisposte = [
              ...newResponses,
              { status, utenti: { user_id: sender_id } },
            ];
            return { ...prev, risposte_evento: newRisposte };
          });
        }
      }
      if (currentGroup == group_id) {
        console.log("qui lo toglo");

        setGroupEventsData((prevEvents) => {
          return prevEvents.map((e) => {
            if (e.event_id == event_id) {
              // const newRisposte = {
              //   [prevStatus]:     ...e.risposte_eventi[prevStatus].filter(
              //     (event) => event.event_id !== event_id,
              //   ),
              //   { ...eventToMove, status },
              // }
              console.log("le risposte evento", e.risposte_evento, e);
              // const altreRisposte = e.risposte_evento.filter(
              //   (r) => r.user_id !== sender_id,
              // );

              const newRisposte = e.risposte_evento.map((r) => {
                return r.user_id == sender_id
                  ? { ...r, status, user_id: sender_id }
                  : r;
              });

              return {
                ...e,
                risposte_evento: [...newRisposte],
                status: session.user.id == sender_id ? status : e.status,
              };
            }
            return e;
          });
        });
      }
      console.log("non lo ho inviato io");
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
              ? { ...r, status: status } // Aggiorna solo lo stato dell'utente corrente
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
        console.log("prev", prevData);
        if (!prevData) return prevData;
        const newMessaggi = prevData.messaggi.map((m) => {
          console.log(m.event_id, event_id);
          if (m.type == "event" && m.event_id == event_id) {
            const newRisposte = m.event_details.risposte_evento.map((r) => {
              return r.utenti?.user_id == sender_id
                ? { ...r, status, ok: "ok" }
                : r;
            });
            console.log(newRisposte);
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
                  utenti: { user_id: sender_id },
                }
              : r;
          });
          return { ...event, risposte_evento: newRisposte };
        });
      }
    });
    socket.on("sent_request", (data) => {
      // notifica
      console.log("arrivato sent_request");
      if (getFriendsData) {
        getFriendsData();
      }
    });
    socket.on("deleted_friend", (data) => {
      // notifica
      console.log("arrivato deleted_friend");
      if (getFriendsData) {
        getFriendsData();
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
      socket.off("deleted_event");
      socket.off("voted_event");
      socket.off("sent_request");
      socket.off("deleted_friend");
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
