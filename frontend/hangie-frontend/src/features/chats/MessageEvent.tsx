import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import { useChat } from "@/contexts/ChatContext";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import {
  Calendar,
  Check,
  ChevronRight,
  DollarSign,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useScreen } from "@/contexts/ScreenContext";
import { useSocket } from "@/contexts/SocketContext";
const MessageEvent = ({ event_details, group_id }) => {
  const { openModal } = useModal();
  const { session } = useAuth();
  const location = useLocation();
  const { currentScreen } = useScreen();
  const [prevStatus, setPrevStatus] = useState(event_details.status);
  const { handleEventDecision, setCurrentEventData } = useChat();
  const { currentSocket } = useSocket();

  const formatDate = (dateString) => {
    if (!dateString) return "Data non definita";
    try {
      // Aggiungo una gestione più robusta
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };
  ("dettagli evento del socket", event_details);
  // Determina se la data di scadenza è passata

  const isDeadlinePassed = useMemo(() => {
    return (
      event_details.scadenza && new Date(event_details.scadenza) < new Date()
    );
  }, [event_details?.scadenza || null]);

  // --- Icona Placeholder per Profilo (sostituisce ProfileIcon) ---

  const sendSocketVoteEvent = (status, prevStatus) => {
    setCurrentEventData((prev) => {
      return { ...prev, status };
    });
    currentSocket.emit(
      "vote_event",
      event_details.event_id,
      group_id,
      status,
      session.user.id,
      prevStatus,
    );
  };

  ("message", event_details);
  const acceptedParticipants = event_details.risposte_evento.filter(
    (r) => r.status == "accepted",
  ).length;
  return (
    <Link
      to={`/events/${event_details.event_id}`}
      state={currentScreen != "xs" && { backgroundLocation: location }}
    >
      <div
        className={` flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden
      shadow-xl transition-all duration-300   hover:shadow-2xl  mr-4
       2xl:min-w-sm  my-2 cursor-pointer ${event_details.status == "rejected" && "grayscale opacity-75"}`}
        onClick={() => {
          openModal({
            type: "EVENT_MODAL",
            data: { event_id: event_details.event_id },
          });
        }}
      >
        <div className="w-58 2xl:w-full  relative cursor-pointer aspect-square 2xl:aspect-[16/9]">
          <img
            className="w-full h-full object-cover  "
            src={event_details.cover_img}
            alt={event_details.titolo || "Event Cover"}
          />
          {event_details.scadenza && (
            <div
              className={`absolute top-0 right-0 m-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg font-body ${
                isDeadlinePassed ? "bg-red-600" : "bg-primary"
              }`}
            >
              {isDeadlinePassed
                ? "CHIUSO"
                : `Scade: ${formatDate(event_details.scadenza)}`}
            </div>
          )}
        </div>

        <div className="p-2.5 2xl:p-5 flex flex-col gap-3">
          <div className="flex flex-col ">
            <h1 className="font-bold text-base 2xl:text-2xl text-text-1 leading-snug mb-2">
              {event_details.titolo}
            </h1>
            <div className="flex items-center gap-1 2xl:gap-2 text-primary text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              <span className="font-body text-primary text-xs 2xl:text-sm font-semibold">
                {formatDate(event_details.data) || "Data non specificata"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 2xl:gap-2.5">
            <div className="flex flex-col gap-1 2xl:gap-2.5 border-gray-200 ">
              <div className="flex items-center gap-1 2xl:gap-2">
                <div className="w-5 h-5 2xl:w-6 2xl:h-6 flex-shrink-0">
                  <MapIcon color={"#64758b"} />
                </div>
                <span
                  className={`font-body truncate text-xs 2xl:text-base text-text-2`}
                >
                  {event_details.luogo.nome}
                </span>
              </div>

              <div className="flex items-center gap-1 2xl:gap-2">
                <div className="w-5 h-5 2xl:w-6 2xl:h-6 flex-shrink-0">
                  <DollarIcon
                    color={event_details.costo == 0 ? "#16a34a" : "#64748b"}
                  />
                </div>
                <span className="font-body font-bold text-xs 2xl:text-base ">
                  {event_details.costo > 0 ? (
                    <span className="text-green-600">
                      {event_details.costo}€
                    </span>
                  ) : (
                    <span className="text-green-600">Gratuito</span>
                  )}
                </span>
              </div>
            </div>

            <div className="">
              <div className="col-span-2 flex items-center gap-2 pt-3 border-t border-gray-200 font-body">
                <div className="w-5 h-5 2xl:w-6 2xl:h-6">
                  <ParticipantsIcon color={"#64758b"} />
                </div>
                <span className="text-xs 2xl:text-base font-body text-text-2">
                  <span className="font-bold text-text-2 ">
                    {acceptedParticipants}
                  </span>{" "}
                  {acceptedParticipants === 1 ? "persona ha" : "persone hanno"}{" "}
                  confermato
                </span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 2xl:w-12 2xl:h-12 flex-shrink-0">
                    <ProfileIcon user_id={event_details.utente?.user_id} />
                  </div>
                  <span className="font-medium text-xs 2xl:text-sm text-text-2 font-body truncate">
                    Creato da:
                    <span className="font-semibold block text-sm 2xl:text-base text-text-1 leading-none">
                      {event_details.utente?.nome}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2   ">
            {event_details.created_by !== session.user.id ? (
              <div className="w-full flex flex-row gap-4">
                <button
                  className={`flex-1 ${event_details.status == "accepted" ? "bg-primary text-white" : "bg-gray-50 text-gray-400 border border-gray-200"}  py-3 px-6 rounded-xl   active:scale-[0.97] transition-all duration-200 flex items-center justify-center cursor-pointer font-bold
                     hover:bg-primary/80`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const newStatus =
                      event_details.status == "accepted"
                        ? "pending"
                        : "accepted";

                    handleEventDecision(
                      event_details.event_id,
                      {
                        status: newStatus,
                      },
                      () => {
                        sendSocketVoteEvent(newStatus, prevStatus);
                        setPrevStatus(newStatus);
                      },
                    );
                  }}
                  disabled={event_details.scadenza < Date.now()}
                >
                  Accetta
                </button>

                <button
                  className={`flex-1 ${event_details.status == "rejected" ? "bg-red-500 text-white" : "bg-gray-50 text-gray-400 border border-gray-200"}  py-3 px-6 rounded-xl   active:scale-[0.97] transition-all duration-200 flex items-center justify-center cursor-pointer font-bold
                     hover:bg-primary/80`}
                  disabled={event_details.scadenza < Date.now()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const newStatus =
                      event_details.status == "rejected"
                        ? "pending"
                        : "rejected";

                    handleEventDecision(
                      event_details.event_id,
                      {
                        status: newStatus,
                      },
                      () => {
                        sendSocketVoteEvent(newStatus, prevStatus);
                        setPrevStatus(newStatus);
                      },
                    );
                  }}
                >
                  Rifiuta
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MessageEvent;
