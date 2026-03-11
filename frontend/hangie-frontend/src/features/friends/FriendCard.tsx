import CheckIcon from "@/assets/icons/CheckIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { Check } from "lucide-react";
import React, { useMemo } from "react";

const FriendCard = ({
  friend,

  localParticipants,

  setLocalParticipants,
}) => {
  const isSelected = useMemo(
    () => localParticipants.some((p) => p.user_id === friend.user_id),
    [localParticipants, friend.user_id],
  );
  return (
    <div
      className={`flex flex-row items-center gap-2 px-2 p-1.5
       border-[#E2E8F0] rounded-xl cursor-pointer group
		     hover:-translate-y-2 relative
		  shadow-sm hover:shadow-2xl
		     transition-all duration-200 border-2 
         ${
           isSelected
             ? "border-primary bg-primary/5 shadow-md"
             : "border-[#E2E8F0] bg-white hover:border-gray-300 shadow-sm"
         }
         
          
        `}
      onClick={() => {
        if (isSelected) {
          setLocalParticipants((prevParticipants) => {
            return prevParticipants.filter(
              (participant) => participant.user_id !== friend.user_id,
            );
          });
        } else {
          setLocalParticipants((prevParticipants) => [
            friend,
            ...prevParticipants,
          ]);
        }
      }}
    >
      <div className="w-14 h-14 flex items-center justify-center">
        <ProfileIcon profile_pic={friend.profile_pic} />
      </div>
      <div className="flex flex-row justify-between w-full items-center">
        <div className="flex flex-col justify-center min-w-0 gap-1">
          <h1 className="text-text-1 font-body font-bold truncate leading-4">
            {friend.nome}
          </h1>
          <span className="font-body text-xs text-text-2 truncate">
            @{friend.handle}
          </span>
        </div>

        <div
          className={` rounded-full mr-2 transition-colors duration-300 border-2 flex items-center justify-center p-0.5  ${
            isSelected
              ? "bg-primary border-primary"
              : "bg-white border-gray-400 "
          }`}
        >
          <Check color={"#ffffff"} size={18} />
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
