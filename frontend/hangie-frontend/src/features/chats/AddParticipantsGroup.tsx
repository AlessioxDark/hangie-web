import ChevronLeft from "@/assets/icons/ChevronLeft";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import FriendCard from "../friends/FriendCard";

const AddParticipantsGroup = ({
  setIsParticipantsAdd,
  setCurrentParticipants,
}) => {
  const [query, setQuery] = useState("");
  const [friendsData, setFriendsData] = useState(null);
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
  return (
    <div>
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
      <div className="w-full  p-2 border-b border-bg-3 items-center">
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
      </div>
      <div className="w-full flex flex-col gap-3 2xl:gap-4 px-3">
        <SearchBar query={query} setQuery={setQuery} />
        <div>
          {isLoading ? (
            <p>loading</p>
          ) : (
            <div>
              {friendsData?.map((friend) => {
                return <FriendCard {...friend} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddParticipantsGroup;
