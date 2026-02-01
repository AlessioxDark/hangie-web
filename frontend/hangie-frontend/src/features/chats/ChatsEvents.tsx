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
  const { groupEventsData, fetchGroupEvents, setGroupEventsData } = useChat();
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
    console.log(event);

    const userResponse = event.risposte_evento.find(
      (risposta) => risposta.user_id === session.user.id,
    );

    if (userResponse) {
      return userResponse.status;
    }
  };

  const filteredEvents = useMemo(() => {
    const allEvents = groupEventsData || [];
    console.log("qui arrivo", allEvents);
    const getUserEventStatus = (event) => {
      if (event.created_by === session.user.id) {
        return "creator";
      }

      const userResponse = (event.risposte_evento || []).find(
        (risposta) => risposta.user_id === session.user.id,
      );

      if (userResponse) {
        return userResponse.status;
      }

      return "pending";
    };

    let statusFilteredList = [];

    console.log("qui arrivo");
    if (currentFilter === "") {
      console.log("qui arrivo");
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
    console.log("pure qui", statusFilteredList);
    return statusFilteredList;
  }, [
    groupEventsData,
    currentFilter,
    query,
    session?.user.id,
    setGroupEventsData,
  ]);

  if (loading.events) {
    return <RenderLoadingState type="events" />;
  }
  if (error && error?.events) {
    return (
      <RenderErrorState type={"events"} reloadFunction={fetchGroupEvents} />
    );
  }
  return (
    <div className="2xl:min-w-1/5 2xl:max-w-1/5 h-full">
      <div className=" 2xl:p-6 flex flex-col gap-3 2xl:gap-8 ">
        <div className="px-2 py-3 bg-white z-[100] w-full flex flex-row items-center gap-2 border-b border-gray-200 sticky top-0">
          {currentScreen == "xs" && (
            <div className="w-8 h-8" onClick={() => setMobileView("chat")}>
              <ChevronLeft color="#2463eb" />
            </div>
          )}
          <h1 className="font-body font-bold text-lg 2xl:text-2xl">
            Eventi Gruppo
          </h1>
        </div>
        <div className="px-4 space-y-4.5 pt-4 pb-10">
          <div className="w-full flex flex-col gap-3 2xl:gap-4">
            <div className="w-full h-11">
              <SearchBar query={query} setQuery={setQuery} />
            </div>

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
                    className={` 2xl:py-2 px-3 2xl:px-5 py-2 ${
                      currentFilter == filter
                        ? "bg-primary text-bg-1 shadow-md "
                        : "bg-bg-2 text-text-2 border border-gray-200  hover:bg-bg-3 hover:shadow-md"
                    } font-body   text-xs 2xl:text-xl cursor-pointer   font-semibold 
              rounded-full 
          
              transition-all duration-200 
              shadow-sm`}
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
    </div>
  );
};

export default ChatsEvents;
