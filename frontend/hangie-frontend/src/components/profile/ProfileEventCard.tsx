import { useChat } from "@/contexts/ChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import ProfileIcon from "../ProfileIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";

const ProfileEventCard = ({ event }) => {
  const {
    titolo,
    created_by,
    event_id,
    data,
    luogo,
    costo,
    utente,
    event_imgs,
    status: eventStatus,
    descrizione,
    risposte_evento,
    cover_img,
    gruppo,
  } = event;
  const { currentSocket } = useSocket();
  const { session } = useAuth();
  const { handleEventDecision } = useChat();
  const [prevStatus, setPrevStatus] = useState(eventStatus);

  const sendSocketVoteEvent = (status, prevStatus) => {
    setCurrentEventData((prev) => {
      return { ...prev, status };
    });
    currentSocket.emit(
      "vote_event",
      event_id,
      gruppo.group_id,
      status,
      session.user.id,
      prevStatus,
    );
  };
  const risposteAccepted = risposte_evento.filter(
    (r) => r.status == "accepted",
  );
  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const { openModal } = useModal();
  const { currentScreen } = useScreen();
  const { setCurrentEventData } = useChat();
  const location = useLocation();
  return (
    <Link
      to={`/events/${event_id}`}
      state={currentScreen != "xs" && { backgroundLocation: location }}
      onClick={() => {
        setCurrentEventData(event);
      }}
    >
      <article
        className="flex flex-col  border border-[#E2E8F0] rounded-xl cursor-pointer group
		     hover:-translate-y-2 relative
		  shadow-sm hover:shadow-2xl
		     transition-all duration-300
             
	 "
        onClick={() => {
          if (currentScreen == "2xl") {
            openModal({ data: { event_id: event_id }, type: "EVENT_MODAL" });
          }
        }}
      >
        <img
          src={cover_img}
          className="w-full rounded-t-xl h-56 object-cover flex-shrink-0"
          alt="Immagine cover evento"
          loading="lazy"
        />

        {gruppo && (
          <div className="absolute top-3 left-3 max-w-[70%]">
            <div className="px-3 py-1.5 2xl:py-2 bg-text-1/80 backdrop-blur-md rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6">
                  <img src={gruppo.group_cover_img} alt="" />
                </div>

                <span className="text-sm font-bold text-bg-1 truncate">
                  {gruppo.nome}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 pt-3 2xl:p-6 flex flex-col gap-2.5 2xl:gap-4 justify-between flex-1">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <time className="text-xs 2xl:text-base block text-primary font-semibold uppercase tracking-wider">
                {formattedTime}
              </time>
              <h2 className="text-base 2xl:text-xl font-bold font-body text-text-1 line-clamp-1 leading-tight">
                {titolo}
              </h2>
            </div>
          </div>
          <div className="flex flex-col gap-3 2xl:gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-row gap-1.5 2xl:gap-2.5 items-center">
                <div className="w-5 h-5 2xl:w-6 2xl:h-6 flex-shrink-0">
                  <MapIcon color={"#64748b"} />
                </div>
                <span className="text-text-2 font-body text-sm 2xl:text-base truncate">
                  {luogo.nome}, {luogo.cap}, {luogo.citta}, {luogo.paese}
                </span>
              </div>

              <div className="flex flex-row gap-1.5 2xl:gap-2.5 items-center  ">
                <div className="w-5 h-5 2xl:w-6 2xl:h-6 ">
                  <DollarIcon color={"#64748b"} />
                </div>
                <span className="text-text-2 font-body font-semibold text-sm 2xl:text-base truncate">
                  {costo}€
                </span>
              </div>
              <div className="flex flex-row gap-2 2xl:gap-2.5 items-center  ">
                <div className="w-5 h-5 2xl:w-6 2xl:h-6 ">
                  <ParticipantsIcon color={"#64748b"} />
                </div>

                <div className="flex items-center gap-1 2xl:gap-2">
                  {risposteAccepted.length > 0 ? (
                    <>
                      <div className="flex -space-x-1">
                        {risposteAccepted.map((partecipante, index) => {
                          return (
                            <div
                              className="2xl:w-7 2xl:h-7 w-6 h-6"
                              key={partecipante.user_id}
                            >
                              <ProfileIcon
                                user_id={partecipante.utenti.user_id}
                              />
                            </div>
                          );
                        })}

                        {risposteAccepted.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-text-2">
                              {risposteAccepted.length - 3}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className="text-text-2 font-body font-medium text-sm 2xl:text-base truncate">
                        {risposteAccepted.length} partecipant
                        {risposteAccepted.length !== 1 ? "i" : "e"}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-text-2">
                      Nessun partecipante
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 2xl:gap-4">
              <div className="w-full h-[0.3px] bg-text-3"></div>
              <div className="flex flex-row items-center gap-3">
                <div className="2xl:w-15 2xl:h-15 w-10 h-10 flex-shrink-0">
                  <ProfileIcon user_id={utente.user_id} />
                </div>
                <span className="font-body text-text-2 font-semibold text-base truncate">
                  {utente.nome}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2   ">
            {created_by !== session.user.id ? (
              <div className="w-full flex flex-row gap-4">
                <button
                  className={`flex-1 ${eventStatus == "accepted" ? "bg-primary text-white" : "bg-gray-50 text-gray-400 border border-gray-200"}  py-3 px-6 rounded-xl   active:scale-[0.97] transition-all duration-200 flex items-center justify-center cursor-pointer font-bold
                     hover:bg-primary/80`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const newStatus =
                      eventStatus == "accepted" ? "pending" : "accepted";

                    handleEventDecision(
                      event_id,
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
                  Accetta
                </button>

                <button
                  className={`flex-1 ${eventStatus == "rejected" ? "bg-red-500 text-white" : "bg-gray-50 text-gray-400 border border-gray-200"}  py-3 px-6 rounded-xl   active:scale-[0.97] transition-all duration-200 flex items-center justify-center cursor-pointer font-bold
                     hover:bg-primary/80`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const newStatus =
                      eventStatus == "rejected" ? "pending" : "rejected";

                    handleEventDecision(
                      event_id,
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
      </article>
    </Link>
  );
};

export default ProfileEventCard;
