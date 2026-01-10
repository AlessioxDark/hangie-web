import SendIcon from "@/assets/icons/SendIcon.js";
import { useChat } from "@/contexts/ChatContext.js";
import MessageCard from "@/components/messaggi/MessageCard.js";
import { useAuth } from "@/contexts/AuthContext.js";
import ChatInput from "@/features/chats/ChatInput.js";
import MessageEvent from "@/features/chats/MessageEvent.js";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { supabase } from "../../config/db.js";
import ChevronLeft from "@/assets/icons/ChevronLeft.js";
import { useScreen } from "@/contexts/ScreenContext.js";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext.js";
import { Calendar } from "lucide-react";
import CalendarIcon from "@/assets/icons/CalendarIcon.js";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon.js";
import { useSocket } from "@/contexts/SocketContext.js";
const Chats = () => {
  const { currentGroupData, setCurrentGroup, currentChatData, currentGroup } =
    useChat();
  const messaggi = currentChatData?.messaggi;
  const { currentSocket } = useSocket();
  const [chatInput, setChatInput] = useState<string>("");
  // const [showEvents, setShowEvents] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayoutChat();
  // const socketRef = useRef<any>(null);
  const chatInputRef = useRef<any>(null);
  const { session } = useAuth();
  const displayImage = currentGroupData.group_cover_img
    ? `${currentGroupData.group_cover_img}?v=${
        currentGroupData.updated_at || Date.now()
      }`
    : null;
  useEffect(() => {
    console.log("aperto chat", messaggi);
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  });
  console.log(currentGroupData);
  const sendMessage = async () => {
    console.log("messaggio inviato", currentGroupData);
    if (!currentSocket) {
      console.error("Socket non ancora connesso!");
      return;
    }
    const trimmedInput = chatInput.trim();
    const partecipantiNoUtente = currentGroupData?.partecipanti_gruppo.filter(
      (partecipante) => {
        return partecipante.partecipante_id !== session.user.id;
      }
    );
    console.log(partecipantiNoUtente);

    currentSocket.emit(
      "send_message",
      trimmedInput, // 1. message
      currentGroupData.group_id,
      currentGroupData?.partecipanti_gruppo,
      session.access_token, // 4. token
      {
        group_cover_img: currentGroupData.group_cover_img,
        nome: currentGroupData.nome,
      }
    );

    console.log("risposta avviata gestendo dato");

    setChatInput("");
    if (chatInputRef.current) chatInputRef.current.textContent = "";
  };
  useEffect(() => {
    if (currentChatData) {
      console.log("controllo messaggi non letti");
      const messaggiDaLeggere = currentChatData?.messaggi?.filter(
        (m) => !m.isRead && m.user_id !== session?.user?.id
      );

      if (currentSocket && messaggiDaLeggere?.length > 0) {
        console.log(`Segno come letti ${messaggiDaLeggere.length} messaggi`);

        // Inviamo un singolo evento pers l'intero gruppo
        console.log("invio give read");
        messaggiDaLeggere.forEach((mess) => {
          currentSocket.emit(
            "message_read",
            mess.message_id,
            session.user.id,
            currentGroup
          );
        });
      }
    }
  }, [currentChatData.messaggi.length, currentSocket]);
  console.log(currentGroupData);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-bg-1 p-2 items-center 2xl:p-4  border-b border-gray-400 flex flex-row  justify-between">
        <div className="flex flex-row gap-1 items-center flex-1">
          {currentScreen == "xs" && (
            <div
              className="w-7 h-7"
              onClick={() => {
                setMobileView("groups");
                setCurrentGroup(null);
              }}
            >
              <ChevronLeft color={"#2463eb"} />
            </div>
          )}
          <div
            className="flex flex-row items-center gap-3 2xl:gap-6  flex-grow"
            onClick={() => setMobileView("GROUP_DETAILS")}
          >
            {displayImage ? (
              <img
                src={displayImage}
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
                <span className="font-body text-text-1 text-xs">
                  {currentGroupData?.partecipanti_gruppo?.map(
                    (partecipante, iPart) => {
                      return `${partecipante.utenti.nome}${
                        iPart !==
                        currentGroupData?.partecipanti_gruppo?.length - 1
                          ? ", "
                          : ""
                      }`;
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileView("events")}
            className="relative p-2.5 rounded-full bg-[#D9EAFF] active:bg-indigo-100 transition-all group"
            title="Vedi Eventi"
          >
            <div className="w-6 h-6">
              <CalendarIcon color={"#2463eb"} />
            </div>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto  relative">
        {/* <div className="fixed top-1/2 right-3 p-1 bg-primary flex items-center justify-center rounded-full hover:bg-primary/80 cursor-pointer z-20">
          <ChevronLeft color={"#ffffff"} />
        </div> */}
        <div className="flex flex-col gap-1.5 2xl:gap-2 mt-8  px-2 2xl:px-8">
          {messaggi.map((mess) => {
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
      <ChatInput
        chatInputRef={chatInputRef}
        sendMessage={sendMessage}
        inputValue={chatInput}
        setInputValue={setChatInput}
      />
    </div>
  );
};

export default Chats;
