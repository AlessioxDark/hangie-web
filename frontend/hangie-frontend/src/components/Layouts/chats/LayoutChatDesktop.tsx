import Chats from "@/app/pages/Chats.js";
import Sidebar from "@/app/pages/desktop/Sidebar";
import ChatsEvents from "@/features/chats/ChatsEvents.js";
import ChatsSidebar from "@/features/chats/ChatsSidebar.js";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "../../../config/db.js";
import {
  ChatContext,
  ChatProvider,
  useChat,
} from "../../../contexts/ChatContext.js";
import { useApi } from "@/contexts/ApiContext.js";
const LayoutChatDesktop = ({}) => {
  const {
    currentGroup,
    setCurrentGroup,
    currentGroupData,
    setCurrentGroupData,
    currentChatData,
    setCurrentChatData,
  } = useChat();
  const { error, loading } = useApi();

  const renderContent = useCallback(() => {
    if (loading.chat) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full h-full ">
          <div className=" rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-2">
            Caricamento della chat...
          </h3>
          <p className="text-gray-500 text-center text-lg ">
            Stiamo cercaando la chat per te
          </p>
        </div>
      );
    }
    if (error && error.chat) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-20 h-20 text-warning" />
          </div>
          <h3 className="text-2xl font-medium text-text-1 mb-2">
            Ops! Qualcosa è andato storto
          </h3>
          <p className="text-gray-500 mb-6 text-center text-lg">
            {error.chat.message}
          </p>
          <button
            // onClick={() => fetchChat()}
            className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      );
    }
    if (currentChatData && currentGroupData && currentChatData.messaggi) {
      console.log("sto renderizzando chat");
      console.log(currentChatData);
      // return currentChatData.map((chat, chatIndex) => {
      // 	return <Chats {...chat} />;
      // });

      return <Chats />;
    }
    return <p>c'è stato un errore</p>;
  }, [
    currentChatData,
    // fetchChat,
    currentGroupData,
    currentGroup,
    error,
    loading.chat,
    // fetchFirstGroup,
  ]);
  return (
    <div className="h-screen w-full flex flex-row">
      <Sidebar />
      <ChatsSidebar />
      <div className="flex flex-col w-full h-screen  bg-bg-2">
        <main className="flex-grow h-screen overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <ChatsEvents />
    </div>
  );
};

export default LayoutChatDesktop;
