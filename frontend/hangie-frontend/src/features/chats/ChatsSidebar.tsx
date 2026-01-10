import GroupCard from "@/features/groups/GroupCard.js";

import { AlertCircle, Group, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext.js";
import { useChat } from "@/contexts/ChatContext.js";
import RenderEmptyState from "@/components/renderEmptyState";
const ChatsSidebar = () => {
  const { setMobileView } = useMobileLayoutChat();
  const { groupsData, error, isGroupsLoading, fetchGroups } = useChat();

  const renderContent = useCallback(() => {
    if (isGroupsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full h-full ">
          <div className=" rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Caricamento dei gruppi in corso...
          </h3>
          <p className="text-gray-500 text-center  ">
            Stiamo cercando i tuoi gruppi
          </p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-warning" />
          </div>
          <h3 className="text-lg font-medium text-text-1 mb-2">
            Ops! Qualcosa è andato storto
          </h3>
          <p className="text-gray-500 mb-6 text-center">{error}</p>
          <button
            onClick={() => fetchGroups()}
            className="bg-primary hover:bg-primary/90 text-bg-1 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      );
    }
    if (groupsData.length == 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Group className="w-16 h-16 text-gray-400" />
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun Gruppo per il momento
          </h3>
        </div>
      );
    }
    if (groupsData) {
      return groupsData.map((group, i) => {
        return <GroupCard index={i} {...group} />;
      });
    }
  }, [error, isGroupsLoading, groupsData, fetchGroups]);
  return (
    <div className="h-screen bg-bg-1 xl:w-5/12 2xl:w-1/4">
      <div className="flex flex-col xl:gap-0 2xl:gap-12">
        <div className="p-4 flex flex-row justify-between items-center xl:p-6 2xl:p-14">
          <h1 className="font-body font-bold text-text-1 text-xl xl:text-3xl 2xl:text-5xl">
            Messaggi
          </h1>
          <div
            className="bg-primary rounded-full p-2 flex items-center justify-center "
            onClick={() => {
              setMobileView("CREATE_GROUP");
            }}
          >
            <Plus className="text-bg-1" />
          </div>
        </div>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default ChatsSidebar;
