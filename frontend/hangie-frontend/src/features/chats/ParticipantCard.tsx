import ProfileIcon from "@/components/ProfileIcon";
import { X } from "lucide-react";
import React from "react";

const ParticipantCard = ({
  handle,
  user_id,
  profile_pic,
  setCurrentParticipants,
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 relative">
        <div
          className="absolute top-1 right-0 p-1 rounded-full bg-text-2/20"
          onClick={() => {
            setCurrentParticipants((prevParticipants) => {
              return prevParticipants.filter((friend) => {
                if (friend.handle != handle) {
                  return friend;
                }
              });
            });
          }}
        >
          <X size={9} />
        </div>
        <ProfileIcon profile_pic={profile_pic} />
      </div>
      <span className="font-body text-xs text-text-1 leading-2">{handle}</span>
    </div>
  );
};

export default ParticipantCard;
