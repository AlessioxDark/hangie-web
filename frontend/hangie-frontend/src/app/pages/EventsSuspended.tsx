import ChevronLeft from "@/assets/icons/ChevronLeft";
import RenderEmptyState from "@/features/utils/RenderEmptyState";
import EventCardSuspended from "@/features/events/EventCardSuspended";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../config/db";
import { useScreen } from "@/contexts/ScreenContext";
const EVENTSINPAGE = 12;

const EventsSuspended = () => {
  const [eventsData, setEventsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState(false);
  const sliderRef = useRef(null);
  const [offset, setOffset] = useState<number>(0);
  const { currentScreen } = useScreen();
  const fetchEvents = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    try {
      setDataError(null);
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(
          "http://localhost:3000/api/events/suspendedevenets/all",
          {
            method: "POST",
            body: JSON.stringify({ offset: offset }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!response.ok) {
          console.log(response);
          setDataError(
            response.statusText || "Errore nel caricamento degli eventi"
          );
        }

        const data = await response.json();
        console.log(data);

        setEventsData((prevData) => {
          const mergeData = [...prevData, ...data.data];

          const dedupData = Array.from(
            new Map(mergeData.map((item) => [item.event_id, item])).values()
          );

          return dedupData;
        });
      }
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setDataError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => {
      if (isLoading) return; // <--- QUESTA RIGA QUI
      const { scrollHeight, scrollTop, clientHeight } = slider;
      const distanzaDalBasso = scrollHeight - scrollTop - clientHeight;

      if (distanzaDalBasso < 540) {
        setOffset((prevOffset) => prevOffset + EVENTSINPAGE);
      }
    };
    slider.addEventListener("scroll", onScroll);
    return () => slider.removeEventListener("scroll", onScroll);
  }, [isLoading]);
  useEffect(() => {
    fetchEvents();
  }, [offset]);

  const renderContent = useCallback(() => {
    if (dataError) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <h3 className="text-lg font-medium text-text-1 mb-2">
            Ops! Qualcosa è andato storto
          </h3>
          <p className="text-gray-500 mb-6 text-center">{dataError}</p>
          <button
            onClick={() => fetchEvents()}
            className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
          <div className=" rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Caricamento degli eventi...
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
            Stiamo scoprendo le prossime esperienze per te.
          </p>
        </div>
      );
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
          <RenderEmptyState />
        )}
      </>
    );
  }, [fetchEvents, eventsData, dataError, isLoading]);
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

        <h1 className="font-body text-text-1 text-xl 2xl:text-4xl font-bold my-2.5 2xl:my-6">
          Eventi in sospeso
        </h1>
      </div>

      {renderContent()}
    </div>
  );
};

export default EventsSuspended;
