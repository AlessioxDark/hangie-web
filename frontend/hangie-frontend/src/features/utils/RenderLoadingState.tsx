import { Loader2 } from "lucide-react";
import React from "react";

const RenderLoadingState = ({ type }) => {
  const message = {
    groups: {
      main: "Caricamento dei gruppi in corso...",
      alt: "Stiamo cercando i tuoi gruppi",
    },
    events: {
      main: "Caricamento degli eventi del gruppo in corso...",
      alt: "Stiamo cercando i tuoi eventi",
    },
    participant: {
      main: "Caricamento degli amici in corso...",
      alt: "Stiamo cercando i tuoi amici",
    },
    home: {
      main: "Caricamento degli eventi in corso...",
      alt: "Stiamo cercando i tuoi eventi",
    },
  };
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full h-full ">
      <div className=" rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2 text-center">
        {message[type].main}
      </h3>
      <p className="text-gray-500 text-center  ">{message[type].alt}</p>
    </div>
  );
};

export default RenderLoadingState;
