import GroupCard from "@/features/groups/GroupCard.js";

import { Plus } from "lucide-react";
import { useChat } from "@/contexts/ChatContext.js";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import RenderEmptyState from "../utils/RenderEmptyState";
import { useApi } from "@/contexts/ApiContext";
const ChatsSidebar = () => {
  const { groupsData, fetchGroups } = useChat();
  const { error, loading } = useApi();

  const renderContent = () => {
    if (loading.groups) {
      return <RenderLoadingState type="groups" />;
    }
    if (error && error.groups) {
      return <RenderErrorState type="groups" reloadFunction={fetchGroups} />;
    }
    if (groupsData?.length == 0) {
      return <RenderEmptyState type="groups" />;
    }
    if (groupsData) {
      return groupsData.map((group, i) => {
        return <GroupCard key={i} {...group} fullGroup={group} />;
      });
    }
  };
  return (
    <div className="h-screen bg-bg-1 xl:w-5/12 2xl:w-1/4">
      <div className="flex flex-col xl:gap-0 2xl:gap-12">
        <div className="p-4 flex flex-row justify-between items-center xl:p-6 2xl:p-14">
          <h1 className="font-body font-bold text-text-1 text-2xl xl:text-3xl 2xl:text-5xl">
            Messaggi
          </h1>
          <div
            className="bg-primary rounded-full p-2 flex items-center justify-center "
            onClick={() => {}}
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
