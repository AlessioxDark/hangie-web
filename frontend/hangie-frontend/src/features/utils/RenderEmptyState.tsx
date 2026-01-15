import { Calendar, Group, MessageCircle } from "lucide-react";
import React from "react";

const RenderEmptyState = ({ type }) => {
  const message = {
    groups: {
      text: "Nessun gruppo trovato",
      icon: <Group className="w-8 h-8 text-gray-400" />,
    },
    home: {
      text: "Nessun evento trovato",
      icon: <Calendar className="w-8 h-8 text-gray-400" />,
    },
    events: {
      text: "Nessun evento trovato",
      icon: <Calendar className="w-8 h-8 text-gray-400" />,
    },
    chat: {
      text: "Nessun gruppo trovato",
      icon: <MessageCircle className="w-8 h-8 text-gray-400" />,
    },
  };
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        {/* <Calendar className="w-8 h-8 text-gray-400" /> */}
        {message[type].icon}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message[type].text}{" "}
      </h3>
    </div>
  );
};

export default RenderEmptyState;
