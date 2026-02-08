import MessageCard from "@/components/messaggi/MessageCard";
import MessageEvent from "./MessageEvent";
import React, { useEffect, useRef } from "react";
const ChatView = ({ messaggi }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const scrollBehavior = messaggi?.length <= 20 ? "instant" : "smooth";
    messagesEndRef.current?.scrollIntoView({ behavior: scrollBehavior });
  });
  console.log(
    "messaggi arrivati",
    messaggi?.filter((m) => m.type == "event"),
  );
  return (
    <div className="flex-1 overflow-y-auto  relative">
      <div className="flex flex-col gap-1.5 2xl:gap-2 mt-8  px-2 2xl:px-8">
        {messaggi?.map((mess) => {
          if (mess.type == "event") {
            return (
              <div className={`w-full flex ${mess.isUser && "justify-end"}`}>
                <MessageEvent {...mess} />
              </div>
            );
          }
          return (
            <div className={`w-full flex ${mess.isUser && "justify-end"}`}>
              <MessageCard {...mess} />
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default ChatView;
