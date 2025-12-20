import { useChat } from "@/contexts/ChatContext";
import RenderEmptyState from "@/components/renderEmptyState";
import SearchBar from "@/components/SearchBar";
import GroupEventCard from "@/features/groups/GroupEventCard";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const FILTER_TYPES = ["accepted", "pending", "archive"];
const ChatsEvents = ({}) => {
  const [groupEventsData, setGroupEventsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const { currentGroup } = useChat();
  const [query, setQuery] = useState("");
  const { session } = useAuth();
  const fetchGroupEvents = async () => {
    console.log("Fetch inziata");
    if (isLoading) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${currentGroup}/group-events`,
        {
          method: "GET",
          // body: JSON.stringify({ offset: offset }),
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      // console.log(response);
      if (!response.ok) {
        console.log(response);
        setError(response.statusText || "Errore nel caricamento degli eventi");
      }
      const data = await response.json();
      console.log(data);
      setGroupEventsData(data);
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsLoading(false);
    }
  };
  const getEventStatus = (event) => {
    console.log("eventStatus");
    if (event?.created_by === session.user.id) {
      console.log("creator");
      return "creator"; // L'utente è il creatore, vede i pulsanti di modifica
    }
    console.log(session.user.id);
    console.log(event.risposte_eventi);
    const userResponse = event.risposte_eventi.find(
      (risposta) => risposta.user_id === session.user.id
    );

    if (userResponse) {
      return userResponse.status;
    }
  };
  useEffect(() => {
    console.log("fetching...");
    if (currentGroup !== null) fetchGroupEvents();
  }, [currentGroup]);

  const filteredEvents = useMemo(() => {
    const allEvents = groupEventsData || [];

    const getUserEventStatus = (event) => {
      if (event.created_by === session.user.id) {
        return "creator";
      }

      const userResponse = (event.risposte_eventi || []).find(
        (risposta) => risposta.user_id === session.user.id
      );

      if (userResponse) {
        return userResponse.status;
      }

      return "pending";
    };

    let statusFilteredList = [];

    if (currentFilter === "") {
      statusFilteredList = allEvents;
    } else {
      statusFilteredList = allEvents.filter((event) => {
        const status = getUserEventStatus(event);

        if (currentFilter === "pending") {
          return status === "pending" || status === "creator";
        }

        return status === currentFilter;
      });
    }

    if (query.trim() !== "") {
      const regex = new RegExp(query, "i");
      return statusFilteredList.filter(
        (evento) => evento.titolo && evento.titolo.match(regex)
      );
    }

    return statusFilteredList;
  }, [groupEventsData, currentFilter, query, session?.user.id]);

  return (
    <div className="2xl:min-w-1/5 2xl:max-w-1/5 h-full">
      <div className="p-3 2xl:p-6 flex flex-col gap-3 2xl:gap-8">
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="font-body font-bold text-base 2xl:text-2xl">
            Eventi Gruppo
          </h1>
          {/* <span className="text-text-2 text-sm font-body">
						{groupEventsData?.all.length || 0} eventi
					</span> */}
        </div>
        <div className="w-full flex flex-col gap-2 2xl:gap-4">
          <SearchBar query={query} setQuery={setQuery} />

          <div className="flex w-full flex-row gap-3 items-center">
            {FILTER_TYPES.map((filter) => {
              return (
                <div
                  onClick={() => {
                    if (currentFilter === filter) {
                      setCurrentFilter("");
                    } else {
                      setCurrentFilter(filter);
                    }
                  }}
                  className={`px-3 py-1 2xl:px-4 2xl:py-2 ${
                    currentFilter == filter
                      ? "bg-primary text-bg-1 shadow-lg shadow-primary/50"
                      : "bg-bg-2 text-text-2 border border-text-2 hover:bg-bg-3 hover:shadow-md"
                  } font-body   text-base 2xl:text-xl cursor-pointer
                
                
                
             
              font-semibold 
              rounded-full 
          
              transition-all duration-200 
              shadow-sm

             
              `}
                >
                  {filter}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div>
            {filteredEvents?.length > 0 ? (
              <div
                className="
                flex flex-col gap-4
              "
              >
                {filteredEvents?.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div key={event.event_id}>
                      <GroupEventCard type={status} {...event} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <RenderEmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsEvents;
