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
const Chats = ({ messaggi }) => {
  const {
    currentGroupData,
    setCurrentGroup,
    setCurrentChatData,
    currentChatData,
    socketRef,
  } = useChat();
  const [chatInput, setChatInput] = useState<string>("");
  const [showEvents, setShowEvents] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayoutChat();
  // const socketRef = useRef<any>(null);
  const chatInputRef = useRef<any>(null);
  const { session } = useAuth();
  useEffect(() => {
    console.log("aperto chat", messaggi);
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  });

  const sendMessage = async () => {
    console.log("messaggio inviato");
    const trimmedInput = chatInput.trim();
    socketRef.current.emit(
      "send_message",
      trimmedInput,
      currentGroupData?.group_id,
      session.access_token
    );

    console.log("risposta avviata gestendo dato");

    setCurrentChatData((prevData) => {
      return {
        ...prevData,
        messaggi: [
          ...prevData.messaggi,
          {
            // mettere tutti i dati per questo da errore es nome, pfpf ecc.
            content: trimmedInput,
            group_id: currentGroupData.group_id,
            user_id: session.user.id,
            sent_at: Date.now(),
            isUser: true,
          },
        ],
      };
    });
    setChatInput("");
    if (chatInputRef.current) {
      // Pulisce l'elemento DOM (l'input visibile)
      chatInputRef.current.textContent = "";
    }
  };

  useEffect(() => {
    if (currentGroupData) {
      socketRef.current.emit("join_room", currentChatData?.group_id);

      socketRef.current.on("receive_message", (data) => {
        console.log("messaggio ricevuto: ", data);
      });
      socketRef.current.on("receive_event", (data) => {
        console.log("evento ricevuto: ", data);
      });
    }
  }, []);
  console.log(currentGroupData);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-bg-1 p-2 items-center 2xl:p-4  border-b border-gray-400 flex flex-row  gap-2">
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
        <div className="flex flex-row items-center gap-3 2xl:gap-6">
          <img
            src={currentGroupData?.group_cover_img}
            className="w-10 h-10 2xl:w-16 2xl:h-16"
            alt=""
          />{" "}
          <div className="flex flex-col gap-0.5">
            <span className="text-text-1 font-bold font-body text-xl 2xl:text-3xl leading-4">
              {currentGroupData?.nome}
            </span>

            {currentGroupData?.partecipanti_gruppo?.map(
              (partecipante, iPart) => {
                return (
                  <span
                    key={partecipante.utenti.user_id}
                    className=" font-body text-text-1 text-xs "
                  >
                    {partecipante.utenti.nome}{" "}
                    {iPart !==
                      currentGroupData?.partecipanti_gruppo?.length - 1 && ", "}
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto  relative">
        <div className="fixed top-1/2 right-3 p-1 bg-primary flex items-center justify-center rounded-full hover:bg-primary/80 cursor-pointer z-20">
          <ChevronLeft color={"#ffffff"} />
        </div>
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
