import ChevronLeft from "@/assets/icons/ChevronLeft";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import React, { useState } from "react";

const GroupDetails = () => {
  const { currentScreen } = useScreen();
  const { currentGroupData } = useChat();
  const { setMobileView } = useMobileLayoutChat();
  const [descLimit, setDescLimit] = useState(120);
  console.log(currentGroupData);
  return (
    <div className="pb-10">
      <div className="bg-bg-1 p-2 items-center 2xl:p-4  flex flex-row  justify-between ">
        <div className="flex flex-row gap-1 items-center">
          {currentScreen == "xs" && (
            <div
              className="w-7 h-7"
              onClick={() => {
                setMobileView("chat");
              }}
            >
              <ChevronLeft color={"#2463eb"} />
            </div>
          )}
          {/* <div className="flex flex-row items-center gap-3 2xl:gap-6">
          {currentGroupData?.group_cover_img ? (
            <img
              src={currentGroupData?.group_cover_img}
              className="w-10 h-10 2xl:w-16 2xl:h-16"
              alt=""
            />
          ) : (
            <div className="w-10 h-10 2xl:w-16 2xl:h-16">
              <DefaultGroupIcon />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-text-1 font-bold font-body text-xl 2xl:text-3xl leading-4">
              {currentGroupData?.nome}
            </span>
            <div className="flex flex-row">
              <span className="font-body text-text-1 text-xs">
                {currentGroupData?.partecipanti_gruppo?.map(
                  (partecipante, iPart) => {
                    return `${partecipante.utenti.nome}${
                      iPart !==
                      currentGroupData?.partecipanti_gruppo?.length - 1
                        ? ", "
                        : ""
                    }`;
                  }
                )}
              </span>
            </div>
          </div>
        </div> */}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <div className="w-full flex justify-center">
              <div className="flex flex-col gap-6">
                {currentGroupData.group_cover_img == null ? (
                  <div className="rounded-full w-48 h-48 ">
                    <DefaultGroupIcon />
                  </div>
                ) : (
                  <img
                    src={currentGroupData?.group_cover_img}
                    alt=""
                    className="w-48 h-48"
                  />
                )}
                <div className="flex flex-col gap-3">
                  <h1 className="font-body text-text-1 text-3xl text-center font-bold leading-4">
                    {currentGroupData?.nome}
                  </h1>
                  <h3 className="font-body text-text-2 text-base text-center font-medium">
                    {currentGroupData.partecipanti_gruppo.length} Membri
                  </h3>
                </div>
              </div>
            </div>
            <div className="px-3">
              <span className="text-text-1 font-body text-sm">
                {currentGroupData.descrizione.slice(0, descLimit)}
                <span
                  className="text-primary font-body text-sm font-medium"
                  onClick={() => {
                    if (descLimit == 120) {
                      setDescLimit(currentGroupData.descrizione.length);
                    } else {
                      setDescLimit(120);
                    }
                  }}
                >
                  Leggi {descLimit == 120 ? "Tutto" : "Meno"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-body text-text-2 text-base ml-4 ">
              {currentGroupData.partecipanti_gruppo.length} Membri
            </h1>
            <div className="flex flex-col">
              {currentGroupData.partecipanti_gruppo.map((partecipante) => {
                return (
                  <div
                    className="w-full px-2 p-1.5  flex flex-row gap-2 bg-bg-3/60
                items-center 
        cursor-pointer group
		     hover:-translate-y-2 relative
		  shadow-sm hover:shadow-2xl
		     transition-all duration-200 
                "
                  >
                    <div className="w-13 h-13">
                      <ProfileIcon user_id={partecipante.partecipante_id} />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 gap-0.5">
                      {/* <h1 className="font-body ">{partecipante.utenti.nome}</h1>
                    <h3>@{partecipante.utenti.handle}</h3> */}

                      <h1 className="text-text-1 font-body font-semibold truncate leading-4">
                        {partecipante.utenti.nome}
                      </h1>
                      <span className="font-body text-xs text-text-2 truncate">
                        @{partecipante.utenti.handle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-3">
          <button className="font-body text-bg-1 px-3 py-1.5 bg-red-500 rounded-md text-lg font-semibold ">
            Abbandona Gruppo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
