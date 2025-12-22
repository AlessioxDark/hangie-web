import ChevronLeft from "@/assets/icons/ChevronLeft";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import FriendCard from "../friends/FriendCard";

const AddParticipantsGroup = ({
  setIsParticipantsAdd,
  setCurrentParticipants,
  currentParticipants,
}) => {
  const [query, setQuery] = useState("");
  const [friendsData, setFriendsData] = useState([]);
  const [currentFriendsData, setCurrentFriendsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const { session } = useAuth();
  const fetchFriends = () => {
    try {
      setIsLoading(true);
      console.log(session.user.id);
      fetch(`http://localhost:3000/api/friends/${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const newData = data.map((friend) => {
            return friend.user_1.isUser == false
              ? friend.user_1
              : friend.user_2;
          });
          setFriendsData(newData);
          setCurrentFriendsData(newData);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // useEffect(()=>)
  useEffect(() => {
    if (query) {
      setCurrentFriendsData((prevData) => {
        return prevData.filter((friend) => {
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
  return (
    <div className="flex flex-col gap-3">
      {/* <div className="flex flex-row gap-1">
        <div
          className="w-6 h-6"
          onClick={() => {
            setIsParticipantsAdd(false);
          }}
        >
          <ChevronLeft color="#2463eb" />
        </div>
        <h3>Partecipanti</h3>
      </div> */}
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
            console.log(localParticipants);
            setCurrentParticipants((prevParticipants) => {
              return [...localParticipants];
            });
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
            <p>loading</p>
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
