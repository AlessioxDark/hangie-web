import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { useSocket } from "@/contexts/SocketContext";
import React from "react";

const LeaveButton = () => {
  const { session } = useAuth();
  const { setMobileView } = useMobileLayoutChat();
  const { currentGroup } = useChat();
  const { currentSocket } = useSocket();
  const handleLeaveGroup = async () => {
    try {
      fetch(`http://localhost:3000/api/groups/leave/${currentGroup}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setMobileView("groups");
          console.log("invio emit leave group");

          currentSocket.emit("leave_group", currentGroup, session.user.id);
        });
    } catch (error) {
      console.log("error", error);
    }
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
