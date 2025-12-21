import ProfileIcon from "@/components/ProfileIcon";
import React from "react";

const FriendCard = ({ nome, handle, user_id }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="w-16 h-16">
        <ProfileIcon user_id={user_id} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-text-1 font-body text-semibold leading-2">
          {nome}
        </h1>
        <span className="font-body text-base text-text-2">@{handle}</span>
      </div>
    </div>
  );
};

export default FriendCard;
