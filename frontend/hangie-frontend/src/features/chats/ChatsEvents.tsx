import { useChat } from "@/contexts/ChatContext";
import RenderEmptyState from "@/features/utils/RenderEmptyState";
import SearchBar from "@/components/SearchBar";
import GroupEventCard from "@/features/groups/GroupEventCard";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useScreen } from "@/contexts/ScreenContext";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import ChevronLeft from "@/assets/icons/ChevronLeft";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import { useApi } from "@/contexts/ApiContext";

const FILTER_TYPES = ["accepted", "pending", "archive"];
const ChatsEvents = () => {
  const [currentFilter, setCurrentFilter] = useState("");
  const { groupEventsData, fetchGroupEvents } = useChat();
  const [query, setQuery] = useState("");
  const { session } = useAuth();
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayout();
  const { error, loading } = useApi();

  const getEventStatus = (event) => {
    console.log("eventStatus");
    if (event?.created_by === session.user.id) {
      console.log("creator");
      return "creator"; // L'utente è il creatore, vede i pulsanti di modifica
    }
    console.log(session.user.id);
    console.log(event.risposte_eventi);
    const userResponse = event.risposte_eventi.find(
      (risposta) => risposta.user_id === session.user.id,
    );

    if (userResponse) {
      return userResponse.status;
    }
  };

  const filteredEvents = useMemo(() => {
    const allEvents = groupEventsData || [];

    const getUserEventStatus = (event) => {
      if (event.created_by === session.user.id) {
        return "creator";
      }

      const userResponse = (event.risposte_eventi || []).find(
        (risposta) => risposta.user_id === session.user.id,
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
        (evento) => evento.titolo && evento.titolo.match(regex),
      );
    }

    return statusFilteredList;
  }, [groupEventsData, currentFilter, query, session?.user.id]);

  if (loading.events) {
    return <RenderLoadingState type="events" />;
  }
  if (error.events) {
    return (
      <RenderErrorState
        errorMessage={error.events.message}
        reloadFunction={fetchGroupEvents}
      />
    );
  }
  return (
    <div className="2xl:min-w-1/5 2xl:max-w-1/5 h-full">
      <div className="p-3 2xl:p-6 flex flex-col gap-3 2xl:gap-8">
        <div className="flex flex-row gap-1 items-center w-full">
          {currentScreen == "xs" && (
            <div className="w-6 h-6" onClick={() => setMobileView("chat")}>
              <ChevronLeft color="#2463eb" />
            </div>
          )}
          <h1 className="font-body font-bold text-lg 2xl:text-2xl">
            Eventi Gruppo
          </h1>
        </div>
        <div className="w-full flex flex-col gap-3 2xl:gap-4">
          <SearchBar query={query} setQuery={setQuery} />

          <div className="flex w-full flex-row gap-2 2xl:gap-3 items-center">
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
                  } font-body text-base 2xl:text-xl cursor-pointer font-semibold rounded-full transition-all duration-200 shadow-sm`}
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
              <RenderEmptyState type="events" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsEvents;
