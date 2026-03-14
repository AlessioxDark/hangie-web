import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { ApiCalls } from "@/services/api";
import { useEffect, useState } from "react";
import ProfileIcon from "../ProfileIcon";
import { useSocket } from "@/contexts/SocketContext";
import { useNavigate } from "react-router";

const FriendItem = ({ friend, setFetchData, type }) => {
  const { executeApiCall } = useApi();
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const navigate = useNavigate();
  const handleAction = async (actionType) => {
    // Mapping delle azioni verso lo status del DB
    const statusMap = {
      send: "pending",
      accept: "accepted",
      delete: "delete",
    };
    console.log("friend cliccato", friend);

    const apiStatus = statusMap[actionType];

    const updateUI = () => {
      if (setFetchData) {
        setFetchData((prevData) => {
          const data = prevData || [];

          if (actionType === "delete") {
            // Rimuovi completamente dall'array se annullata o rifiutata
            return data.filter((f) => f.user_id !== friend.user_id);
          }

          const exists = data.some((f) => f.user_id === friend.user_id);

          if (exists) {
            // Aggiorna lo stato se è già in friendsData
            return data.map((f) =>
              f.user_id === friend.user_id ? { ...f, status: apiStatus } : f,
            );
          } else {
            // Aggiungi all'array se abbiamo cercato globalmente e mandato una richiesta
            return [
              ...data,
              { ...friend, status: apiStatus, sender_id: session?.user?.id },
            ];
          }
        });
      }

      //socket
      if (actionType === "accept") {
        // Mandiamo un evento specifico per l'accettazione
        currentSocket.emit("accept_request", {
          sender_id: session.user.id,
          receiver_id: friend.user_id,
        });
      } else if (actionType == "delete") {
        currentSocket.emit("reject_request", {
          sender_id: session.user.id,
          receiver_id: friend.user_id,
          apiStatus: apiStatus,
        });
      } else {
        // Per invio o cancellazione usiamo quello standard
        currentSocket.emit("send_request", {
          sender_id: session.user.id,
          receiver_id: friend.user_id,
          apiStatus: apiStatus,
        });
      }
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
  const deleteFriend = async (e) => {
    e.stopPropagation();
    e.preventDefault();
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

  useEffect(() => {}, [friend]);
  return (
    <div
      className="flex flex-row justify-between px-3 py-3 border-b border-[#E2E8F0] last:border-b-0 hover:bg-slate-50 transition-colors duration-200 items-center"
      onClick={(e) => {
        navigate(`/profile/${friend.handle}`);
      }}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="w-12 h-12 flex-shrink-0">
          <ProfileIcon profile_pic={friend.profile_pic} />
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

      {type == "friend_request" ||
      (friend.status === "pending" &&
        friend.sender_id !== session?.user?.id) ? (
        <div className="flex flex-row gap-2">
          <button
            className="px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAction("accept");
            }}
          >
            Accetta
          </button>
          <button
            className="px-3 py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAction("delete");
            }}
          >
            Rifiuta
          </button>
        </div>
      ) : friend.status === "accepted" ? (
        <button
          className="text-xs px-2 py-1.5 bg-red-500 rounded-xl text-bg-1 font-semibold"
          onClick={deleteFriend}
        >
          Rimuovi Amico
        </button>
      ) : friend.status == "pending" ? (
        <button
          className="px-3 py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAction("delete");
          }}
        >
          Annulla
        </button>
      ) : (
        <button
          className="px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAction("send");
          }}
        >
          Aggiungi
        </button>
      )}
    </div>
  );
};

export default FriendItem;
