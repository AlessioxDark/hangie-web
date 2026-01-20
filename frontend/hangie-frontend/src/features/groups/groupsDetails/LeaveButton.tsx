import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { useSocket } from "@/contexts/SocketContext";
import { ApiCalls } from "@/services/api";
import React from "react";

const LeaveButton = () => {
  const { session } = useAuth();
  const { setMobileView } = useMobileLayoutChat();
  const { currentGroup, setCurrentGroup } = useChat();
  const { currentSocket } = useSocket();
  const { executeApiCall } = useApi();
  const handleLeaveGroup = async () => {
    const saveData = (data) => {
      setMobileView("groups");
      setCurrentGroup(null);
      currentSocket.emit("leave_group", currentGroup, session.user.id);
    };

    executeApiCall(
      "leave_group",
      () => {
        return ApiCalls.handleLeaveGroup(session.access_token, currentGroup);
      },
      saveData,
    );
  };
  return (
    <section className="px-4 mt-4">
      <button
        className="w-full py-4 text-white  bg-red-500 font-semibold rounded-2xl active:bg-red-400 transition-all shadow-sm"
        onClick={() => {
          handleLeaveGroup();
        }}
      >
        Abbandona Gruppo
      </button>
    </section>
  );
};

export default LeaveButton;
