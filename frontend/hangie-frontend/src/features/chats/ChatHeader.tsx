import CalendarIcon from "@/assets/icons/CalendarIcon";
import ChevronLeft from "@/assets/icons/ChevronLeft";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import React from "react";
import { useNavigate } from "react-router";

const ChatHeader = () => {
  const { currentScreen } = useScreen();
  const { currentGroupData, setCurrentGroup } = useChat();
  const displayImage = currentGroupData?.group_cover_img
    ? `${currentGroupData?.group_cover_img}?v=${
        currentGroupData?.updated_at || Date.now()
      }`
    : null;

  const navigate = useNavigate();
  return (
    <div className="bg-bg-1 p-2 items-center 2xl:p-4  border-b border-neutral-300 flex flex-row  justify-between sticky top-0">
      <div className="flex flex-row gap-1 items-center flex-1">
        {currentScreen == "xs" && (
          <div
            className="w-7 h-7"
            onClick={() => {
              setCurrentGroup(null);
              navigate(-1);
            }}
          >
            <ChevronLeft color={"#2463eb"} />
          </div>
        )}
        <div
          className="flex flex-row items-center gap-3 2xl:gap-6  flex-grow"
          onClick={() => {
            navigate(`/chats/${currentGroupData?.group_id}/details`);
          }}
        >
          {displayImage ? (
            <img
              src={displayImage}
              loading="eager"
              className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-full"
              alt=""
            />
          ) : (
            <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-full">
              <DefaultGroupIcon />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-text-1 font-bold font-body text-xl 2xl:text-3xl leading-4">
              {currentGroupData?.nome}
            </span>
            <div className="flex flex-row">
              <span className="font-body text-text-1 text-xs line-clamp-1 opacity-70">
                {currentGroupData?.partecipanti_gruppo
                  ?.map((p) => p.utenti.nome)
                  .join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            navigate(`/chats/${currentGroupData.group_id}/events`);
            if (currentScreen == "xl") {
              //   setShowEvents(true);
            }
          }}
          className="relative p-2.5 rounded-full bg-[#D9EAFF] active:bg-indigo-100 transition-all group"
          title="Vedi Eventi"
        >
          <div className="w-6 h-6">
            <CalendarIcon color={"#2463eb"} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
