import ChevronLeft from "@/assets/icons/ChevronLeft";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import FriendCard from "../friends/FriendCard";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import { useApi } from "@/contexts/ApiContext";
import { ApiCalls } from "@/services/api";

const AddParticipantsGroup = ({
  setIsParticipantsAdd,
  setCurrentParticipants,
  currentParticipants,
  onConfirm,
  isGroup,
}) => {
  const [query, setQuery] = useState("");
  const [friendsData, setFriendsData] = useState([]);
  const [currentFriendsData, setCurrentFriendsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { session } = useAuth();
  const { error: errorApi, executeApiCall, loading } = useApi();
  const [error, setError] = useState(null);
  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const saveData = (data) => {
        const acceptedFriends = data.filter((f) => f.status == "accepted");
        setFriendsData(acceptedFriends);
        setCurrentFriendsData(acceptedFriends);
      };
      executeApiCall(
        "add_participants",
        () => {
          return ApiCalls.handleGetFriends(
            session.access_token,
            session.user.id,
          );
        },
        saveData,
      );
    } catch (error) {
      setError({ message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);
  useEffect(() => {
    if (errorApi?.add_participants) {
      setError({ message: errorApi.add_participants.message });
    }
  }, [errorApi?.new_participants]);
  useEffect(() => {
    if (query) {
      setCurrentFriendsData(() => {
        return friendsData.filter((friend) => {
          const pattern = new RegExp(`^${query}`, "i");
          if (friend.handle.match(pattern)) return friend;
        });
      });
    } else {
      setCurrentFriendsData(friendsData);
    }
  }, [query]);
  const [localParticipants, setLocalParticipants] =
    useState(currentParticipants);

  if (loading?.add_participants) {
    return <RenderLoadingState type={"add_participants"} />;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full  p-2 border-b border-bg-3 items-center flex flex-row justify-between">
        <div className="flex flex-row gap-1 items-center">
          <div
            className="w-6 h-6"
            onClick={() => {
              setIsParticipantsAdd(false);
            }}
          >
            <ChevronLeft color={"#2463eb"} />
          </div>
          <h1 className="text-lg text-text-1 font-body font-bold">
            Aggiungi partecipanti
          </h1>
        </div>

        <button
          className="px-2 py-1 rounded-md font-body text-bg-1 text-sm bg-primary disabled:bg-primary/75"
          disabled={localParticipants.length == 0}
          onClick={() => {
            setCurrentParticipants((prevParticipants) => {
              return [...localParticipants];
            });
            if (isGroup) {
              onConfirm(localParticipants);
            }
            setIsParticipantsAdd(false);
          }}
        >
          Invia
        </button>
      </div>
      <div className="w-full flex flex-col gap-3 2xl:gap-4 px-3">
        <SearchBar query={query} setQuery={setQuery} />
        <div>
          {isLoading ? (
            <RenderLoadingState type={"participant"} />
          ) : error ? (
            <RenderErrorState
              errorMessage={error.message}
              reloadFunction={fetchFriends}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {currentFriendsData?.map((friend) => {
                return (
                  <FriendCard
                    friend={friend}
                    localParticipants={localParticipants}
                    setLocalParticipants={setLocalParticipants}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddParticipantsGroup;
