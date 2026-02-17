import { useChat } from "@/contexts/ChatContext.js";
import { useAuth } from "@/contexts/AuthContext.js";
import ChatInput from "@/features/chats/ChatInput.js";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/SocketContext.js";
import ChatsEvents from "@/features/chats/ChatsEvents.js";
import ChatHeader from "@/features/chats/ChatHeader.js";
import ChatView from "@/features/chats/ChatView.js";
import RenderEmptyState from "@/features/utils/RenderEmptyState";
import { useParams } from "react-router";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
const Chats = () => {
  const { currentGroupData, currentChatData, currentGroup, setCurrentGroup } =
    useChat();
  const { groupId } = useParams();
  const { currentSocket } = useSocket();
  const [chatInput, setChatInput] = useState<string>("");
  const [showEvents, setShowEvents] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const { session, isAuthLoading } = useAuth();

  console.log(currentGroupData);
  const sendMessage = async () => {
    if (!currentSocket) {
      console.error("Socket non ancora connesso!");
      return;
    }
    const trimmedInput = chatInput.trim();

    currentSocket.emit(
      "send_message",
      trimmedInput, // 1. message
      currentGroupData.group_id,
      // currentGroupData?.partecipanti_gruppo,
      session.access_token, // 4. token
      {
        group_cover_img: currentGroupData.group_cover_img,
        nome: currentGroupData.nome,
      },
    );

    setChatInput("");
    if (chatInputRef.current) chatInputRef.current.textContent = "";
  };
  // useEffect(() => {
  //   console.log("faccio la fetchchat nuova", currentChatData);
  //   if (!currentChatData) {
  //     setCurrentGroup(groupId);
  //   }
  // }, []);

  const messaggi = currentChatData?.messaggi;

  useEffect(() => {
    if (messaggi) {
      console.log("invio bulk ");

      const messaggiDaLeggere = messaggi
        ?.filter((m) => !m.isRead && m.user_id !== session?.user?.id)
        ?.map((m) => m.message_id);

      if (currentSocket && messaggiDaLeggere?.length > 0) {
        // messaggiDaLeggere.forEach((mess) => {
        //   currentSocket.emit(
        //     "message_read",
        //     mess.message_id,
        //     session.user.id,
        //     currentGroup
        //   );
        // });

        currentSocket.emit(
          "message_read_bulk",
          messaggiDaLeggere,
          session.user.id,
          currentGroup,
        );
      }
    }
  }, [
    messaggi?.length,
    currentSocket,
    session.user.id,
    currentGroup,
    messaggi,
  ]);

  // if (!currentGroup) {
  //   // return <RenderEmptyState type={"chat"} />;
  // }
  if (isAuthLoading) {
    console.log("auth lo");
    return <RenderLoadingState type={"chat"} />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ChatHeader />

      <ChatView messaggi={messaggi} />
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
