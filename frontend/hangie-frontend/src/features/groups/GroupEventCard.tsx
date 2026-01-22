import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";

const GroupEventCard = ({
  titolo,

  event_id,
  data,
  luogo,

  cover_img,
  gruppo,
  type,
  scadenza,
}) => {
  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
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
  const numPartecipanti = gruppo.partecipanti_gruppo.length;
  const isInactive = type === "archive" || type === "rejected";
  return (
    <div
      className={`flex flex-col p-3 2xl:p-4   border border-[#E2E8F0] rounded-xl cursor-pointer group
			     hover:-translate-y-2 relative
			  shadow-sm hover:shadow-2xl
			     transition-all duration-300
           ${isInactive && "grayscale"}
		 `}
      onClick={() => {
        openModal({ data: { event_id: event_id }, type: "EVENT_MODAL" });
      }}
    >
      <div className="flex flex-row gap-3 2xl:gap-6">
        <div className=" w-32 flex items-center">
          <img
            src={cover_img}
            className={`rounded-2xl rounded-bl-2xl ${
              type == "pending" ? "h-88/100" : " h-9/10"
            } w-full object-cover flex-shrink-0`}
            alt="Immagine cover evento"
            loading="lazy"
          />
        </div>

        <div className=" flex flex-col gap-3  flex-1 justify-center">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-end relative">
              <time className="text-primary font-body text-xs xl:text-sm font-bold uppercase tracking-wider">
                {formattedTime}
              </time>
              {type == "pending" && (
                <div
                  className={`
                      
		      flex items-center gap-2
		      px-3 py-2
		     bg-primary
		      rounded-xl
		      flex-shrink-0

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
                  <span className="text-xs font-body font-bold text-bg-1 whitespace-nowrap ">
                    {getUrgencyText()}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-sm 2xl:text-lg font-bold font-body text-text-1 line-clamp-2 leading-tight">
              {titolo}
            </h3>
          </div>

          <div className="flex flex-col gap-1 2xl:gap-2.5">
            <div className="flex flex-row gap-1 2xl:gap-2.5 items-center">
              <div className="2xl:w-6 2xl:h-6 w-5 h-5  flex-shrink-0 mt-0.5">
                <MapIcon color={"#64748b"} />
              </div>
              <span className="text-text-2 font-body 2xl:text-base text-sm truncate">
                {luogo.nome}, {luogo.cap}
              </span>
            </div>

            <div className="flex flex-row gap-1 2xl:gap-2.5  items-center  ">
              <div className="2xl:w-6 2xl:h-6 w-5 h-5">
                <ParticipantsIcon color={"#64748b"} />
              </div>

              <div className="flex items-center gap-2">
                {numPartecipanti > 0 ? (
                  <>
                    <div className="flex -space-x-1 2xl:-space-x-2">
                      <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {numPartecipanti}
                        </span>
                      </div>
                    </div>

                    <span className="text-text-2 font-body font-medium 2xl:text-base text-sm truncate">
                      {numPartecipanti} partecipant
                      {numPartecipanti !== 1 ? "i" : "e"}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">
                    Nessun partecipante
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {type == "pending" && (
        <div className="flex justify-center">
          <div className="pt-3 2xl:4 w-full   ">
            <div className="flex gap-3">
              <button
                className="
		            flex-1
		             px-3 py-2   2xl:px-4 2xl:py-2.5
		            bg-primary text-bg-1
		            rounded-xl
		            font-bold
		            hover:bg-primary/80
		            transition-colors
		            duration-300

		             text-base 2xl:text-lg
		             cursor-pointer "
              >
                Accetta Invito
              </button>
              <button
                className="
		            flex-1
		            px-3  py-2   2xl:px-4 2xl:py-2.5
		            bg-bg-1 text-text-2
		            border-2 border-text-3/60
		            rounded-xl
		            font-bold
		            hover:bg-bg-2/80
		            hover:border-text-2/80
		            transition-colors
		            duration-300
		         text-base 2xl:text-lg
		            cursor-pointer
					
		          "
              >
                Rifiuta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupEventCard;
