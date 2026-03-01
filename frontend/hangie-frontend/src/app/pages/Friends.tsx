import ProfileIcon from "@/components/ProfileIcon";
import SearchBar from "@/components/SearchBar";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import RenderErrorState from "@/features/utils/RenderErrorState";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
import { ApiCalls } from "@/services/api";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react"; // Se non hai lucide-react, usa un testo come "V"
import FriendItem from "@/components/friends/FriendItem";
import { useFriends } from "@/contexts/FriendsContext";
const Friends = () => {
  const [query, setQuery] = useState("");
  const { error, loading, executeApiCall } = useApi();
  const [isPendingCollapsed, setIsPendingCollapsed] = useState(false);
  const [isAcceptedCollapsed, setIsAcceptedCollapsed] = useState(false);
  const {
    friendsData,
    globalFriendships,
    getFriendsByQuery,
    pendingFriends,
    acceptedFriends,
    setFriendsData,

    setGlobalFriendships,
  } = useFriends();

  useEffect(() => {
    if (query.length < 3) {
      setGlobalFriendships([]);
      return;
    }

    const handler = setTimeout(() => {
      getFriendsByQuery(query);
    }, 500); // Aspetta 500ms di "silenzio" prima di sparare l'API

    return () => clearTimeout(handler); // Pulisce il timer se l'utente digita ancora
  }, [query, getFriendsByQuery]);
  const renderContent = () => {
    // if (loading?.friends) {
    //   return <RenderLoadingState type={"friends"} />;
    // }
    if (error && error?.friends) {
      return <RenderErrorState reloadFunction={friendsData} type={"friends"} />;
    }

    if (query === "") {
      return (
        <div className="flex flex-col gap-4">
          {/* SEZIONE RICHIESTE PENDENTI */}
          <div className="flex flex-col gap-2">
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => setIsPendingCollapsed((prev) => !prev)}
            >
              <h1 className="font-body text-lg font-bold">
                Richieste di Amicizia ({pendingFriends.length})
              </h1>
              <ChevronDown
                className={`transition-transform duration-300 ${isPendingCollapsed ? "-rotate-90" : ""}`}
              />
            </div>

            <div
              className={`border-2 border-[#E2E8F0] rounded-lg transition-all duration-500 ease-in-out overflow-hidden ${
                isPendingCollapsed
                  ? "max-h-0 opacity-0 border-transparent pointer-events-none"
                  : "max-h-[1000px] opacity-100"
              }`}
            >
              {pendingFriends.length > 0 ? (
                pendingFriends.map((friend) => (
                  <FriendItem
                    key={friend.user_id}
                    friend={friend}
                    setFetchData={setFriendsData}
                    type="friend_request"
                  />
                ))
              ) : (
                <p className="p-4 text-sm text-text-2 italic">
                  Nessuna richiesta pendente
                </p>
              )}
            </div>
          </div>

          {/* SEZIONE AMICI ACCETTATI */}
          <div className="flex flex-col gap-2">
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => setIsAcceptedCollapsed((prev) => !prev)}
            >
              <h1 className="font-body text-lg font-bold">
                Amici ({acceptedFriends.length})
              </h1>
              <ChevronDown
                className={`transition-transform duration-300 ${isAcceptedCollapsed ? "-rotate-90" : ""}`}
              />
            </div>

            <div
              className={`border-2 border-[#E2E8F0] rounded-lg transition-all duration-500 ease-in-out overflow-hidden ${
                isAcceptedCollapsed
                  ? "max-h-0 opacity-0 border-transparent pointer-events-none"
                  : "max-h-[2000px] opacity-100"
              }`}
            >
              {acceptedFriends.length > 0 ? (
                acceptedFriends.map((friend) => (
                  <FriendItem
                    key={friend.user_id}
                    friend={friend}
                    setFetchData={setFriendsData}
                  />
                ))
              ) : (
                <p className="p-4 text-sm text-text-2 italic">
                  Non hai ancora aggiunto amici
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (query !== "") {
      const queryRegex = new RegExp(query, "i");

      const nuoviFriends = friendsData.filter((friend) => {
        return friend.handle.match(queryRegex);
      });
      const allFriends = [...nuoviFriends, ...globalFriendships];
      return (
        <div className="border-2 border-[#E2E8F0] rounded-lg transition-all duration-500 ease-in-out overflow-hidden">
          {allFriends.length > 0 ? (
            allFriends.map((friend) => {
              return (
                <FriendItem
                  key={friend.user_id}
                  friend={friend}
                  setFetchData={setFriendsData}
                />
              );
            })
          ) : (
            <p className="p-4 text-sm text-text-2 italic">
              Non è stato trovato nulla per la ricerca
            </p>
          )}
        </div>
      );
    }

    return null; // Aggiungi qui la logica per quando query != ""
  };

  return (
    <div className="pt-2 pb-20">
      <div className="space-y-4 mb-6">
        <h1 className="font-body text-2xl font-bold">Friends</h1>
        <SearchBar query={query} setQuery={setQuery} />
      </div>
      {renderContent()}
    </div>
  );
};

export default Friends;
