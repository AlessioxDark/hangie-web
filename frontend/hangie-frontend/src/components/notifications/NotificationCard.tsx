import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import React from "react";

const NotificationCard = ({
  user_id,
  type,
  sender_id,
  sender,
  messaggio,
  created_at,
  gruppo,
  is_read,
}) => {
  return (
    <div
      className={`flex items-center p-4 mb-2 cursor-pointer transition-all duration-200 rounded-xl border
        bg-blue-50 border-blue-100 shadow-sm`}
    >
      <div className="w-2 h-2 mr-3">
        {!is_read && <div className="w-2 h-2 bg-red-500 rounded-full" />}
      </div>
      <div className="relative flex-shrink-0">
        {/* <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
           {sender?.nome?.charAt(0).toUpperCase()}
         </div> */}
        {/* {gruppo.group_cover_img ? (
          <img
            src={gruppo.group_cover_img}
            className="w-12 h-12 rounded-full"
            alt=""
          />
        ) : ( */}
        {
          <div className="w-12 h-12 rounded-full">
            <DefaultGroupIcon />
          </div>
        }
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-1">{gruppo?.nome}</p>
          <span className="text-xs text-gray-400">
            {new Date(created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">
          {sender.nome}: {messaggio.content}
        </p>
      </div>
    </div>
    // <div>
    //   notifica
    //   <p>{message["new_message"]}</p>
    // </div>
  );
};

export default NotificationCard;
