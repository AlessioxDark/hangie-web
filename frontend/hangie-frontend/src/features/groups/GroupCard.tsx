import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { useNotification } from "@/contexts/NotificationContext";
import React, { useEffect, useState } from "react";
import { Link } from "react-router";

const GroupCard = ({
  nome,
  group_cover_img,
  ultimoMessaggio,
  group_id,
  created_at,
  messaggi,
  partecipanti_gruppo,
  descrizione,
  createdBy,
  updated_at,
  fullGroup,
}) => {
  const { setCurrentGroup, setCurrentGroupData } = useChat();
  const { currentNotifications } = useNotification();
  const displayImage = group_cover_img
    ? `${group_cover_img}?v=${updated_at || Date.now()}`
    : null;

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString);
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

  const unreadMsgNotifications = currentNotifications.unread.filter((n) => {
    if (n.type == "new_message" && n.group_id == group_id) return n;
  }).length;
  return (
    <div
      className="bg-bg-2 p-3 flex items-center w-full 
    cursor-pointer 
    hover:bg-gray-100/80 
    transition-colors
    border-b border-gray-200
   "
      onClick={() => {
        setCurrentGroup(group_id);
        console.log("part gruppo", partecipanti_gruppo);
        setCurrentGroupData(fullGroup);
      }}
    >
      <div className="flex flex-row items-stretch w-full h-full gap-4">
        {displayImage == null ? (
          <div className="rounded-full w-12 h-12 2xl:h-16 2xl:w-16 flex-shrink-0">
            <DefaultGroupIcon />
          </div>
        ) : (
          <img
            src={displayImage}
            className="rounded-full w-12 h-12 2xl:h-16 2xl:w-16 flex-shrink-0"
            alt="Group cover"
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 ">
          <div className="flex justify-between ">
            <h1 className="font-bold font-body text-lg leading-4">{nome}</h1>

            <span className="text-text-3 text-sm flex-shrink-0 ml-4 font-body">
              {formatTime(ultimoMessaggio?.sent_at || created_at)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-2 font-body 2xl:text-lg leading-5 line-clamp-1 mr-2">
              {ultimoMessaggio?.type == "event"
                ? `evento`
                : ultimoMessaggio?.content}
            </span>
            {unreadMsgNotifications > 0 && (
              <div className="bg-primary  flex items-center justify-center w-6 h-6 text-center font-bold text-white rounded-full text-base flex-shrink-0">
                {unreadMsgNotifications}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
