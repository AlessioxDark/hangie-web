import ChevronLeft from "@/assets/icons/ChevronLeft";
import RenderEmptyState from "@/features/utils/RenderEmptyState";
import EventCardSuspended from "@/features/events/EventCardSuspended";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../config/db";
import { useScreen } from "@/contexts/ScreenContext";
import RenderErrorState from "@/features/utils/RenderErrorState";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
import { useApi } from "@/contexts/ApiContext";
import { ApiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
const EVENTSINPAGE = 12;

const EventsSuspended = () => {
  const [eventsData, setEventsData] = useState([]);
  const sliderRef = useRef(null);
  const [offset, setOffset] = useState<number>(0);
  const { currentScreen } = useScreen();
  const { executeApiCall, loading, error } = useApi();
  const { session } = useAuth();
  const { fetchEvents } = useChat();

  const saveData = (data) => {
    if (data.length > 0) {
      ("ecco i dati", data);
      setEventsData((prevData) => {
        const mergeData = [...prevData, ...data];

        const dedupData = Array.from(
          new Map(mergeData.map((item) => [item.event_id, item])).values(),
        );

        return dedupData;
      });
    }
  };

  useEffect(() => {
    if (session) {
      executeApiCall(
        "home_events",
        () => ApiCalls.fetchSuspendedEvents(session.access_token, offset),
        saveData,
      );
    }
  }, [offset, executeApiCall, session?.access_token]);
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => {
      if (loading.home_events) return;
      const { scrollHeight, scrollTop, clientHeight } = slider;
      const distanzaDalBasso = scrollHeight - scrollTop - clientHeight;

      if (distanzaDalBasso < 540) {
        setOffset((prevOffset) => prevOffset + EVENTSINPAGE);
      }
    };
    slider.addEventListener("scroll", onScroll);
    return () => slider.removeEventListener("scroll", onScroll);
  }, [loading.home_events]);

  const renderContent = useCallback(() => {
    if (error.home_events) {
      return (
        <RenderErrorState type={"home_events"} reloadFunction={fetchEvents} />
      );
    }
    if (loading.home_events) {
      return <RenderLoadingState type={"home"} />;
    }

    return (
      <>
        {eventsData.length > 0 ? (
          <div
            className="
         grid 
             
              md:grid-cols-2
              lg:grid-cols-2
              xl:grid-cols-2
              2xl:grid-cols-4
              gap-4
              2xl:gap-8
              "
          >
            {eventsData.map((event) => {
              // const evento = event.evento
              return (
                <div key={event.event_id}>
                  <EventCardSuspended {...event} line_clamp={"line-clamp-2"} />
                </div>
              );
            })}
          </div>
        ) : (
          <RenderEmptyState type={"home"} />
        )}
      </>
    );
  }, [eventsData, error.home_events, loading.home_events]);
  return (
    <div ref={sliderRef} className="">
      <div className="flex flex-row 2xl:flex-col ">
        <div className="flex items-center gap-2">
          <Link
            to={"/"}
            className="flex flex-row gap-1 items-center cursor-pointer"
          >
            <div className="w-6 h-6">
              <ChevronLeft />
            </div>

            {currentScreen !== "xs" && (
              <span className="text-primary font-semibold text-base 2xl:text-2xl font-body ">
                Indietro
              </span>
            )}
          </Link>
        </div>

        <h1 className="font-body text-text-1 text-xl 2xl:text-4xl font-bold 2xl:my-6">
          Eventi in sospeso
        </h1>
      </div>

      {renderContent()}
    </div>
  );
};

export default EventsSuspended;
