import DollarIcon from "@/assets/icons/DollarIcon";
import KebabMenuIcon from "@/assets/icons/KebabMenuIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import { useSocket } from "@/contexts/SocketContext";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const GroupEventCard = ({
  titolo,

  event_id,
  data,
  luogo,
  costo,
  cover_img,
  gruppo,
  type,
  scadenza,
  risposte_evento,
}) => {
  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const { handleDeleteEvent } = useChat();
  const { currentSocket } = useSocket();

  const sendSocket = () => {
    currentSocket.emit("delete_event", event_id, gruppo.group_id);
  };
  const getUrgencyText = () => {
    const scadenza_timestamp = new Date(scadenza).getTime();
    const distanza_ms = scadenza_timestamp - Date.now();
    if (distanza_ms <= 0) {
      return "Scaduto/a";
    }

    let residuo = distanza_ms;
    console.log(scadenza_timestamp, distanza_ms);
    const units = [
      {
        label: "y",
        ms: 31557600000,
      },
      {
        label: "m",
        ms: 2629800000,
      },
      {
        label: "g",
        ms: 86400000,
      },
      {
        label: "h",
        ms: 60 * 100 * 24,
      },
      {
        label: "m",
        ms: 60 * 100 * 24 * 60,
      },
    ];
    const parti = [];
    for (const { label, ms } of units) {
      const valore = Math.floor(residuo / ms);
      if (valore > 0) {
        parti.push(`${valore}${label}`);
        residuo %= ms;
      }
      if (parti.length === 2) break;
    }

    return `Scade tra ${parti.join(" e ")}`;
  };

  const { openModal } = useModal();
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayout();
  const numPartecipanti = risposte_evento.accepted.length;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Aggiunge l'event listener al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Pulizia: rimuove l'event listener quando il componente viene smontato
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isInactive = type === "archive" || type === "rejected";
  return (
    <div
      className={` cursor-pointer 
			     
           group relative flex flex-col px-5 bg-white rounded-2xl py-2.5
    shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
    hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]
    hover:-translate-y-1 transition-all duration-500 border border-slate-200
    ${isInactive ? "grayscale opacity-75" : ""}
  
          
		 `}
      // onClick={() => {
      //   navigate(`/events/${event_id}`);
      // }}
    >
      <div className="flex flex-row gap-4 2xl:gap-6  py-3 h-full">
        <div className="relative w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={cover_img}
            className="h-full w-full object-cover"
            alt="cover"
          />
        </div>
        <div className=" flex flex-col gap-2  flex-1 justify-center">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-end relative">
              <time className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {formattedTime}
              </time>

              <div className="flex flex-row gap-2 relative" ref={dropdownRef}>
                {type == "pending" && (
                  <div
                    className={`
                      
		      flex items-center gap-2
		      
		      rounded-xl
		      flex-shrink-0
px-2 py-1 bg-amber-50 text-amber-600  border border-amber-100
		    `}
                  >
                    {currentScreen != "xs" && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}

                    <span className="text-[10px]  rounded-full  font-bold">
                      {getUrgencyText()}
                    </span>
                  </div>
                )}
                <div className="w-4 h-4 " onClick={toggleDropdown}>
                  <KebabMenuIcon />
                </div>
                {isDropdownOpen && currentScreen == "xs" && (
                  <div className="absolute -right-6 top-4 w-30 bg-white shadow-xl rounded-xl border border-slate-100 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
                      onClick={() => {
                        console.log("click");
                        handleDeleteEvent(event_id, sendSocket);
                      }}
                    >
                      <span className="font-medium text-xs">
                        Elimina Evento
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-base 2xl:text-lg font-bold font-body text-text-1 line-clamp-2 leading-tight ">
              {titolo}
            </h3>
          </div>

          <div className="grid gap-1.5">
            {[
              { icon: <MapIcon color={"#64748b"} />, text: `${luogo.nome}` },
              { icon: <DollarIcon color={"#64748b"} />, text: `${costo}$` },
              {
                icon: <ParticipantsIcon color={"#64748b"} />,
                text: `${numPartecipanti} partecipanti`,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-500">
                <div className=" w-5 h-5">{item.icon}</div>
                <span className="text-xs font-medium truncate">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {type === "pending" && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button className="flex-1 px-4 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:brightness-110 transition-all">
            Accetta
          </button>
          <button className="flex-1 bg-gray-50 text-gray-400 font-bold px-4 py-3 text-xs hover:text-slate-600 transition-colors rounded-xl border border-gray-200">
            Ignora
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupEventCard;
