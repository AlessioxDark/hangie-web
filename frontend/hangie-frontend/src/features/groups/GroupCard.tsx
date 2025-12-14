import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import React, { useEffect } from "react";
import { Link } from "react-router";

const GroupCard = ({
  nome,
  group_cover_img,
  ultimoMessaggio,
  index,
  group_id,
  created_at,

  partecipanti,
}) => {
  const { setCurrentGroup, setCurrentGroupData } = useChat();
  const { setMobileView } = useMobileLayoutChat();

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    // Mostra l'ora se è oggi, altrimenti la data breve
    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
    });
  };
  return (
    <div
      className="bg-bg-2 p-3 flex items-center w-full 
    cursor-pointer 
    hover:bg-gray-100/80 
    transition-colors
    border-b border-gray-200
   "
      onClick={() => {
        console.log(setMobileView);
        setMobileView("chat");
        setCurrentGroup(group_id);
        setCurrentGroupData({
          nome,
          group_id,
          created_at,
          group_cover_img,
          partecipanti,
        });
      }}
    >
      <div className="flex flex-row items-stretch w-full h-full gap-4">
        <img
          src={group_cover_img}
          className="rounded-full w-14 h-14 2xl:h-16 2xl:w-16 flex-shrink-0" // Correzione Sizing
          alt="Group cover"
        />

        <div className="flex-1 min-w-0 flex flex-col gap-1.5 justify-center">
          <div className="flex justify-between items-center">
            <h1 className="font-bold font-body text-lg leading-4">{nome}</h1>

            <span className="text-text-3 text-sm flex-shrink-0 ml-4">
              {formatTime(ultimoMessaggio?.sent_at || created_at)}
            </span>
          </div>

          {/* Riga 2: Anteprima Messaggio e Badge (Bottom) */}
          <div className="flex justify-between items-center">
            <span className="text-text-2 font-body 2xl:text-lg leading-5 line-clamp-1 mr-2">
              {ultimoMessaggio?.type == "event"
                ? `evento`
                : ultimoMessaggio?.content}
            </span>
            {/* Badge Messaggi Non Letti */}
            {3 > 0 && (
              <div className="bg-primary  flex items-center justify-center w-6 h-6 text-center font-bold text-white rounded-full text-base flex-shrink-0">
                {3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
