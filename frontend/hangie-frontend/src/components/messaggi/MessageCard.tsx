import DoubleTick from "@/assets/icons/DoubleTick";
import TickIcon from "@/assets/icons/TickIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useEffect, useState } from "react";

const MessageCard = ({
  isUser,
  content,
  utenti,
  user_id,
  sent_at,
  isSent,
  isRead,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const renderTick = () => {
    if (!isUser) return;
    if (isRead) {
      return (
        <div className="w-5 h-4.5">
          <DoubleTick color="#ffffff" />
        </div>
      );
    }
    if (isSent) {
      return (
        <div className="w-5 h-4.5">
          <DoubleTick color="#94a3b8" />
        </div>
      );
    }

    return (
      <div className="w-5 h-4.5">
        <TickIcon color="#94a3b8" />
      </div>
    );

    // BLU
  };
  return (
    <div
      className={`flex flex-row ${
        isUser ? "justify-end" : "items-start"
      } gap-1 2xl:gap-2 w-full `}
    >
      {!isUser && (
        <div className="w-10 h-10 2xl:w-14 2xl:h-14 -mt-4   ">
          <ProfileIcon profile_pic={utenti.profile_pic} />
          {/* <ProfileIcon user_id={user_id} /> */}
        </div>
      )}
      <div
        className={`${
          isUser ? "bg-[#2563eb]" : "bg-bg-3"
        }  rounded-lg 2xl:rounded-xl
		    max-w-[80%] 2xl:max-w-xl relative
       min-h-8 flex flex-wrap
		   `}
      >
        <div
          className="flex flex-col px-2.5 py-1 2xl:px-4 2xl:py-1.5
		   max-w-full self-center"
        >
          {!isUser && (
            <span
              className={` ${"text-text-1"} -mb-0.5 font-body font-semibold text-sm 2xl:tex-base `}
            >
              {utenti.nome}
            </span>
          )}
          <span
            className={`font-body ${
              isUser ? "text-bg-1" : "text-text-1"
            } text-sm 2xl:text-base whitespace-pre-wrap break-words`}
          >
            {content}
          </span>
        </div>
        <div
          className={`flex flex-row items-end ml-auto ${
            isUser ? "pr-1" : "pr-2"
          }`}
        >
          <div className="ml-auto flex flex-row items-end gap-0.5 2xl:gap-1 h-auto">
            <span
              className={` font-body  text-[0.65rem] 2xl:text-xs shrink-0 ${
                isUser ? "text-bg-3" : "text-text-2"
              }`}
            >
              {formatDate(sent_at)}
            </span>

            {renderTick()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
