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
import React, { useMemo, useState } from "react";
const MessageEvent = ({ event_details }) => {
  console.log(event_details);
  const [buttonContent, setButtonContent] = useState(null);
  const { openModal } = useModal();
  const { session } = useAuth();
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

  // Determina se la data di scadenza è passata

  const isDeadlinePassed = useMemo(() => {
    return (
      event_details.data_scadenza &&
      new Date(event_details.data_scadenza) < new Date()
    );
  }, [event_details?.data_scadenza || null]);

  // --- Icona Placeholder per Profilo (sostituisce ProfileIcon) ---

  // --- Logica Contenuto Bottone ---
  const getButtonContent = () => {
    if (session.user.id === event_details.utenti.user_id) {
      return null;
    }
    if (isDeadlinePassed) {
      return (
        <button
          disabled
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 font-bold rounded-xl
                  transition-colors duration-300 text-lg shadow-inner cursor-not-allowed opacity-80"
        >
          Evento Concluso / Scaduto
        </button>
      );
    } else if (" d" === "partecipo") {
      return (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-center w-full px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg">
            <Check className="w-5 h-5 mr-2" />
            Hai Conferato la tua partecipazione
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full text-sm py-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
          >
            Annulla la partecipazione
          </button>
        </div>
      );
    } else if (" d" === "non_partecipo") {
      return (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-center w-full px-6 py-3 bg-red-100 text-red-600 border border-red-300 font-bold rounded-xl shadow-lg">
            <XCircle className="w-5 h-5 mr-2" />
            Hai Rifiutato l'Invito
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full text-sm py-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
          >
            Cambia idea e partecipa
          </button>
        </div>
      );
    } else {
      return (
        <div className="w-full flex flex-row gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold
                     hover:bg-primary/80 transition-colors duration-300 shadow-md"
          >
            Accetta Invito
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-bold
                     hover:bg-gray-100 hover:border-gray-500 transition-colors duration-300 shadow-sm"
          >
            Rifiuta
          </button>
        </div>
      );
    }
  };

  return (
    <>
      <div
        className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden
      shadow-xl transition-all duration-300   hover:shadow-2xl
      min-w-sm max-w-sm  my-2 cursor-pointer"
        onClick={() => {
          openModal({
            type: "EVENT_MODAL",
            data: { event_id: event_details.event_id },
          });
        }}
      >
        {/* Immagine di Copertina */}
        <div className="w-full  bg-gray-300 relative cursor-pointer">
          {/* L'immagine deve avere una dimensione fissa o responsive */}
          <img
            className="w-full h-full object-cover aspect-[16/9] "
            src={event_details.cover_img}
            alt={event_details.titolo || "Event Cover"}
          />
          {event_details.data_scadenza && (
            <div
              className={`absolute top-0 right-0 m-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg font-body ${
                isDeadlinePassed ? "bg-red-600" : "bg-primary"
              }`}
            >
              {isDeadlinePassed
                ? "CHIUSO"
                : `Scade: ${formatDate(event_details.data_scadenza)}`}
            </div>
          )}
        </div>

        {/* Contenuto della Card */}
        <div className="p-5 flex flex-col gap-3">
          {/* Titolo e Data Evento */}
          <div className="flex flex-col ">
            <h1 className="font-bold text-2xl text-text-1 leading-snug mb-2">
              {event_details.titolo}
            </h1>
            {/* Data Evento in alto a destra */}
            <div className="flex items-center gap-2 text-primary text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              <span className="font-body text-primary text-sm font-semibold">
                {formatDate(event_details.data) || "Data non specificata"}
              </span>
            </div>
          </div>

          {/* Dettagli (Luogo, Costo, Creatore) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2.5 border-gray-200 ">
              {/* Luogo e Indirizzo */}

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex-shrink-0">
                  {/* Usa la Sostituzione MapIcon */}
                  <MapIcon color={"#64758b"} />
                </div>
                <span className={`font-body truncate text-text-2`}>
                  {event_details.luoghi.nome}
                </span>
              </div>

              {/* Costo */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex-shrink-0">
                  {/* Usa la Sostituzione DollarIcon */}
                  <DollarIcon
                    color={event_details.costo == 0 ? "#16a34a" : "#64748b"}
                  />
                </div>
                <span className="font-body font-bold ">
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
                {/* <Users className="w-4 h-4 text-blue-600" /> */}
                <div className="w-6 h-6">
                  <ParticipantsIcon color={"#64758b"} />
                </div>
                <span className="font-body text-text-2">
                  <span className="font-bold text-text-2 ">
                    {event_details.partecipanti_count} 3
                  </span>{" "}
                  {event_details.partecipanti_count === 1
                    ? "persona ha"
                    : "persone hanno"}{" "}
                  confermato
                </span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0">
                    {/* Usa la Sostituzione ProfileIcon */}
                    <ProfileIcon user_id={event_details.utenti?.user_id} />
                  </div>
                  <span className="font-medium text-sm text-text-2 font-body truncate">
                    Creato da:
                    <span className="font-semibold block text-base text-text-1 leading-none">
                      {event_details.utenti?.creatore}
                    </span>
                  </span>
                </div>

                {/* Contatore Partecipanti */}
              </div>
            </div>
            {/* Creatore e Partecipanti (Sezione 3) */}
          </div>

          {/* Bottoni di Risposta (Sezione 4) */}
          <div className="flex gap-2   ">{getButtonContent()}</div>
        </div>
      </div>
    </>
  );
};

export default MessageEvent;
