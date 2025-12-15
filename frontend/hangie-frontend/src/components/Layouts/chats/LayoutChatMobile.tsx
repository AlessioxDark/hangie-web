import React, { useCallback, useEffect, useState } from "react";
import LayoutMobile from "../mobile/LayoutMobile";
import { AlertCircle, Loader2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { supabase } from "../../../config/db.js";
import ChatsSidebar from "@/features/chats/ChatsSidebar";
import {
  MobileLayoutChatProvider,
  useMobileLayoutChat,
} from "@/contexts/MobileLayoutChatContext.js";
import ChatsEvents from "@/features/chats/ChatsEvents.js";
import Chats from "@/app/pages/Chats.js";
import BottomNav from "@/app/pages/mobile/BottomNav.js";
const LayoutChatMobile = () => {
  const {
    currentGroup,
    setCurrentGroup,
    currentGroupData,
    setCurrentGroupData,
    currentChatData,
    setCurrentChatData,
  } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>("");
  const { mobileView } = useMobileLayoutChat();
  useEffect(() => {
    console.log(mobileView);
  }, [mobileView]);
  const fetchChat = async () => {
    if (isLoading) return;
    try {
      setError(null);
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(
          `http://localhost:3000/api/groups/${currentGroup}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(
            errorData.error?.message ||
              response.statusText ||
              "Errore nel caricamento della chat"
          );
          return;
        }

        const result = await response.json();
        const groupData = result;
        console.log(result);
        if (groupData) {
          const mappedMessages = groupData.messaggi.map((mess) => ({
            ...mess,
            isUser: mess.user_id === session.user.id,
          }));

          setCurrentChatData({
            ...groupData,
            messaggi: mappedMessages,
          });
        } else {
          setError("Dati del gruppo non trovati.");
        }
      }
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchFirstGroup = async () => {
    if (isLoading) return;
    console.log("sto fetchando first group");
    try {
      setError(null);
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(`http://localhost:3000/api/groups/`, {
          method: "GET",
          // body: JSON.stringify({ offset: offset }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          console.log(response);
          setError(
            response.statusText || "Errore nel caricamento degli eventi"
          );
        }

        const data = await response.json();
        console.log(data);

        setCurrentGroup(data[0].group_id);
        setCurrentGroupData(data[0]);
        console.log("ottenuti dati");
      }
    } catch (err: any) {
      console.error("Errore fetch eventi:", err);
      setError(err.message || "Errore nel caricamento degli eventi");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (currentGroup != null) {
      fetchChat();
    }
  }, [currentGroup]);
  useEffect(() => {
    if (currentGroup == null) {
      fetchFirstGroup();
    }
  }, []);
  useEffect(() => {
    console.log("mobile view cambiato", mobileView);
  }, [mobileView]);
  const renderContent = useCallback(() => {
    if (isLoading) {
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
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-20 h-20 text-warning" />
          </div>
          <h3 className="text-2xl font-medium text-text-1 mb-2">
            Ops! Qualcosa è andato storto
          </h3>
          <p className="text-gray-500 mb-6 text-center text-lg">{error}</p>
          <button
            onClick={() => fetchChat()}
            className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      );
    }

    if (mobileView == "groups") {
      return (
        <>
          <div className="overflow-hidden">
            <ChatsSidebar />
          </div>
          <div>
            <BottomNav />
          </div>
        </>
      );
    }
    if (mobileView == "events") {
      return <ChatsEvents />;
    }
    if (mobileView == "chat") {
      return <Chats messaggi={currentChatData?.messaggi} />;
    }
    return (
      <p className="p-4 text-center text-gray-500">
        Vista non valida. {`${mobileView}`}
      </p>
    );
  }, [fetchChat, error, isLoading, mobileView]);
  return (
    // <div className="h-screen w-full flex flex-row">
    //   <Sidebar />
    //   <ChatsSidebar />
    //   <div className="flex flex-col h-screen w-full bg-bg-2">
    //     <main className="flex-grow h-screen overflow-y-auto">
    //       {renderContent()}
    //     </main>
    //   </div>
    //   {/* <ChatsEvents /> */}
    // </div>
    <div className="h-screen w-full flex flex-col justify-between ">
      {/* <div className="overflow-hidden">{renderContent()}</div>
      <div>
        <BottomNav />
      </div> */}
      {renderContent()}
    </div>
  );
};

export default LayoutChatMobile;
