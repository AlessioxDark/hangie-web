import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { ApiCalls } from "@/services/api";
import { useState } from "react";
import ProfileIcon from "../ProfileIcon";
import { useSocket } from "@/contexts/SocketContext";

const FriendItem = ({ friend, setFetchData, type }) => {
  const [isSent, setIsSent] = useState(friend.status === "pending");
  const { executeApiCall } = useApi();
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const handleAction = async (actionType) => {
    // Mapping delle azioni verso lo status del DB
    const statusMap = {
      send: "pending",
      accept: "accepted",
      delete: "delete",
    };

    const apiStatus = statusMap[actionType];

    const updateUI = () => {
      // Se accettiamo o inviamo, isSent/isAccepted cambia
      if (actionType === "send") setIsSent(true);
      if (actionType === "delete") setIsSent(false);

      if (setFetchData) {
        setFetchData((prevData) => {
          if (!prevData) return null;

          // Se l'azione è delete, forse vorresti rimuovere l'item dalla lista (specialmente se rifiuti)
          if (actionType === "delete" && type === "friend_request") {
            return prevData.filter((f) => f.user_id !== friend.user_id);
          }

          return prevData.map((f) =>
            f.user_id === friend.user_id ? { ...f, status: apiStatus } : f,
          );
        });
      }

      //socket
      currentSocket.emit("send_request", {
        sender_id: session.user.id, // Coerenza con snake_case
        receiver_id: friend.user_id, // Il server cerca receiver_id
        apiStatus: apiStatus,
      });
    };

    executeApiCall(
      "friends",
      () =>
        ApiCalls.handleSendOrDeleteFriendRequest(session.access_token, {
          status: apiStatus,
          user_id: session.user.id,
          friend_id: friend.user_id,
        }),
      updateUI,
    );
  };
  const deleteFriend = async () => {
    const saveData = (data) => {
      currentSocket.emit("delete_friend", {
        user_id: session.user.id,
        friend_id: friend.user_id,
      });
    };
    executeApiCall(
      "friends",
      () => {
        return ApiCalls.handleDeleteFriend(session.access_token, {
          friend_id: friend.user_id,
        });
      },
      saveData,
    );
  };
  return (
    <div className="flex flex-row justify-between px-3 py-3 border-b border-[#E2E8F0] last:border-b-0 hover:bg-slate-50 transition-colors duration-200 items-center">
      <div className="flex flex-row items-center gap-3">
        <div className="w-12 h-12 flex-shrink-0">
          <ProfileIcon user_id={friend.user_id} />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-text-1 font-body font-bold truncate text-sm">
            {friend.nome}
          </h1>
          <span className="font-body text-xs text-text-2 truncate">
            @{friend.handle}
          </span>
        </div>
      </div>

      {/* Logica Bottone: Mostriamo "Annulla" se isSent è true, altrimenti "Invia" */}
      {type == "friend_request" ? (
        <div className="flex flex-row gap-2">
          <button
            className="px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold"
            onClick={() => handleAction("accept")}
          >
            Accetta
          </button>
          <button
            className="px-3 py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-semibold"
            onClick={() => handleAction("delete")}
          >
            Rfiuta
          </button>
        </div>
      ) : friend.status === "accepted" ? (
        <button
          className="text-xs px-2 py-1.5 bg-red-500 rounded-xl text-bg-1 font-semibold"
          onClick={deleteFriend}
        >
          Rimuovi Amico
        </button>
      ) : isSent ? (
        <button
          className="px-3 py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-semibold"
          onClick={() => handleAction("delete")}
        >
          Annulla
        </button>
      ) : (
        <button
          className="px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold"
          onClick={() => handleAction("send")}
        >
          Aggiungi
        </button>
      )}
    </div>
  );
};

export default FriendItem;
