import { AlertCircle, Loader2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";

import BottomNav from "@/app/pages/mobile/BottomNav.js";
import CreateEventForm from "@/features/events/CreateEventForm.js";
import CreateGroupForm from "@/features/chats/CreateGroupForm.js";
import { useApi } from "@/contexts/ApiContext";
import { Outlet, useLocation } from "react-router";
const LayoutChatMobile = () => {
  const { fetchGroups } = useChat();
  const { error, loading } = useApi();
  const location = useLocation();
  const { mobileView } = useMobileLayout();

  const renderContent = () => {
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
            Stiamo cercando la chat per te
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
            onClick={() => fetchGroups()}
            className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      );
    }

    if (mobileView == "CREATE_EVENT") {
      return <CreateEventForm />;
    }
    if (mobileView == "CREATE_GROUP") {
      return <CreateGroupForm />;
    }

    console.log(location);
    if (location.pathname == "/chats") {
      return (
        <>
          <Outlet />
          <BottomNav />
        </>
      );
    }
    return <Outlet />;
  };
  return (
    <div className="h-screen w-full flex flex-col justify-between ">
      {renderContent()}
    </div>
  );
};

export default LayoutChatMobile;
