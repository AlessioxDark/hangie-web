import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import React from "react";
import { Link } from "react-router";

const GroupEventCard = ({
  titolo,
  created_by,
  event_id,
  data,
  luogo,
  costo,
  utente,
  partecipanti_count = 0,
  event_imgs,
  user_id,
  descrizione,
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
    // 1. Calcola la differenza in millisecondi (la base di tutto)
    const scadenza_timestamp = new Date(scadenza).getTime();
    const distanza_ms = scadenza_timestamp - Date.now();

    // Se la scadenza è passata
    if (distanza_ms <= 0) {
      return "Scaduto/a";
    }

    let tempo_residuo = distanza_ms;
    console.log(scadenza_timestamp, distanza_ms);
    // 2. Calcoli basati su millisecondi medi per anno/mese (ATTENZIONE: impreciso)

    // Anni: 365.25 giorni * 24h * 60m * 60s * 1000ms
    const ms_in_anno = 31557600000;
    const anni = Math.floor(tempo_residuo / ms_in_anno);
    tempo_residuo %= ms_in_anno; // Rimuovi gli anni

    // Mesi: 30.44 giorni medi
    const ms_in_mese = 2629800000;
    const mesi = Math.floor(tempo_residuo / ms_in_mese);
    tempo_residuo %= ms_in_mese; // Rimuovi i mesi

    // Giorni: 24h * 60m * 60s * 1000ms
    const ms_in_giorno = 86400000;
    const giorni = Math.floor(tempo_residuo / ms_in_giorno);
    tempo_residuo %= ms_in_giorno; // Rimuovi i giorni

    // Ore e Minuti (calcolo preciso)
    const ore = Math.floor(tempo_residuo / (1000 * 60 * 60));
    tempo_residuo %= 1000 * 60 * 60;

    const minuti = Math.floor(tempo_residuo / (1000 * 60));

    // 3. Costruzione della stringa di output (mostra solo l'unità più grande)
    const parti = [];
    if (anni > 0) parti.push(`${anni}a`);
    if (mesi > 0) parti.push(`${mesi}M`);
    if (giorni > 0) parti.push(`${giorni}g`);
    if (ore > 0 && anni === 0 && mesi === 0) parti.push(`${ore}h`); // Mostra ore solo se non ci sono mesi/anni

    if (parti.length === 0) {
      return `Scade tra ${minuti}m`;
    }

    return `Scade tra ${parti.slice(0, 2).join(" e ")}`; // Mostra solo le due unità più grandi
  };

  const { openModal } = useModal();
  const { currentScreen } = useScreen();
  return (
    <div
      className={`flex flex-col p-3 2xl:p-4   border border-[#E2E8F0] rounded-xl cursor-pointer group
			     hover:-translate-y-2 relative
			  shadow-sm hover:shadow-2xl
			     transition-all duration-300
           ${(type == "archive" || type == "rejected") && "grayscale"}
		 `}
      onClick={() => {
        openModal({ data: { event_id: event_id }, type: "EVENT_MODAL" });
      }}
      // to={`/events/${event_id}`}
    >
      <div className="flex flex-row gap-3 2xl:gap-6">
        <div className=" w-32 flex items-end">
          <img
            src={cover_img}
            className={`rounded-2xl rounded-bl-2xl ${
              type == "pending" ? "h-88/100" : " h-9/10"
            } w-full object-cover flex-shrink-0`}
            alt="Immagine cover evento"
            loading="lazy"
          />
        </div>

        <div className=" flex flex-col gap-2 justify-between flex-1">
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
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
          </div>
          <div className="flex flex-col gap-4">
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
                {/* <span className="text-text-2 font-body text-base font-medium truncate">
								{gruppi.partecipanti_gruppo.length} partecipanti
							</span> */}
                {/* ✅ AVATAR STACK - Stile professionale */}
                <div className="flex items-center gap-2">
                  {gruppo.partecipanti_gruppo.length > 0 ? (
                    <>
                      <div className="flex -space-x-1 2xl:-space-x-2">
                        {/* Counter per rimanenti */}

                        <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700">
                            {gruppo.partecipanti_gruppo.length}
                          </span>
                        </div>
                      </div>

                      <span className="text-text-2 font-body font-medium 2xl:text-base text-sm truncate">
                        {gruppo.partecipanti_gruppo.length} partecipant
                        {gruppo.partecipanti_gruppo.length !== 1 ? "i" : "e"}
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

    // <article className="flex gap-3 p-3 bg-bg-1 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer">
    // 	{/* Thumbnail */}
    // 	<img
    // 		src={cover_img}
    // 		className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
    // 		alt={titolo}
    // 	/>

    // 	{/* Content */}
    // 	<div className="flex flex-col gap-1 flex-1 min-w-0">
    // 		<time className="text-xs text-primary font-bold uppercase">
    // 			{formattedTime}
    // 		</time>
    // 		<h4 className="text-sm font-bold text-text-1 line-clamp-1">{titolo}</h4>
    // 		<div className="flex items-center gap-2 text-xs text-text-2">
    // 			<div className="w-3 h-3">
    // 				<ParticipantsIcon />
    // 			</div>
    // 			<span>3 partecipanti</span>
    // 		</div>
    // 	</div>
    // </article>
  );
};

export default GroupEventCard;
