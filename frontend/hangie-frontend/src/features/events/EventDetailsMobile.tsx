import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import { ApiCalls } from "@/services/api";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";

const EventDetailsMobile = () => {
  const navigate = useNavigate();
  const { executeApiCall, error } = useApi();
  const { setCurrentEventData, currentEventData } = useChat();
  const { session } = useAuth();
  const fetchEvent = async () => {
    executeApiCall(
      "event",
      () => {
        return ApiCalls.fetchEvent(
          currentEventData.event_id,
          session.access_token,
        );
      },
      (data) => {
        console.log(" data è arrivato", data);
        console.log(" invece l'evento era", currentEventData);
        const usefulFields = [
          "descrizione",
          "titolo",
          "partecipanti_gruppo",
          "status",
          "gruppo",
          "luogo",
          "cover_img",
          "costo",
          "data",
          "data_scadenza",
          "utente",
        ];

        for (const key of usefulFields) {
          if (data[key] !== currentEventData[key]) {
            setCurrentEventData((prev) => {
              return { ...prev, [key]: data[key] };
            });
          }
        }
      },
    );
  };
  useEffect(() => {
    fetchEvent();
  }, []);

  const { titolo, descrizione, event_imgs } = currentEventData;
  return (
    <div>
      <div className="px-2 py-3 w-full flex flex-row items-center gap-4">
        <div className="w-8 h-8" onClick={() => navigate(-1)}>
          <ChevronLeft color={"#2463eb"} />
        </div>
        <h1 className="font-body text-text-1 text-lg font-bold">
          Dettagli Evento
        </h1>
      </div>
      <div>
        <h1>{titolo}</h1>
      </div>
    </div>
  );
};

export default EventDetailsMobile;
