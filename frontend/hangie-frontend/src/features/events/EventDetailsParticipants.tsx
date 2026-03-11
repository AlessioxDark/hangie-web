import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useModal } from "@/contexts/ModalContext";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import PartecipanteCard from "./PartecipanteCard";
import { useNavigate } from "react-router";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import SearchBar from "@/components/SearchBar";

const FILTER_TYPES = ["Confermati", "In attesa", "Rifiutati"];
const EventDetailsParticipants = () => {
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [currentRisposte, setCurrentRisposte] = useState([]);
  const { currentEventData } = useChat();
  const navigate = useNavigate();
  const { currentScreen } = useScreen();
  const renderFilteredAnswers = useCallback(() => {
    if (currentFilter == "") {
      {
        setCurrentRisposte(currentEventData?.risposte_evento);
      }
    }
    if (query !== "") {
      const queryRegex = new RegExp(query, "i");

      const nuoveRisposte = currentEventData?.risposte_evento.filter(
        (risposta) => {
          return risposta.utenti.nome.match(queryRegex);
        },
      );

      setCurrentRisposte(nuoveRisposte);
    }
    if (currentFilter == "Confermati") {
      setCurrentRisposte(
        currentEventData.risposte_evento?.filter((r) => r.status == "accepted"),
      );
    }
    if (currentFilter == "In attesa") {
      setCurrentRisposte(
        currentEventData.risposte_evento?.filter((r) => r.status == "pending"),
      );
    }
    if (currentFilter == "Rifiutati") {
      setCurrentRisposte(
        currentEventData.risposte_evento?.filter((r) => r.status == "rejected"),
      );
    }
  }, [currentFilter, query]);
  useEffect(() => {
    renderFilteredAnswers();
  }, [currentFilter, query]);

  return (
    <div className="flex flex-col gap-4 2xl:gap-12 overflow-hidden h-screen">
      <div className="flex flex-col gap-4">
        <div className="px-2 py-3 w-full flex flex-row items-center gap-2 border-b border-gray-200  bg-white">
          <div className="w-8 h-8" onClick={() => navigate(-1)}>
            <ChevronLeft color={"#2463eb"} />
          </div>
          <h1 className="font-body text-text-1 text-lg font-bold">
            Dettagli Partecipanti({currentRisposte.length})
          </h1>
        </div>
        <div className="flex flex-col 2xl:mt-6 mt-2 gap-3 2xl:gap-4 px-3">
          {currentScreen !== "xs" && (
            <h1 className="text-text-1 font-body font-semibold 2xl:text-3xl ">
              Partecipanti({currentRisposte.length})
            </h1>
          )}
          <div className="space-y-4">
            <div className="w-full h-12">
              <SearchBar query={query} setQuery={setQuery} />
            </div>
            <div className="flex flex-row gap-4 items-center">
              {currentScreen !== "xs" && (
                <span className="font-bold font-body text-text-2 text-sm 2xl:text-xl">
                  Filtra:{" "}
                </span>
              )}
              <div className="flex w-full flex-row gap-2 2xl:gap-4 items-center">
                {FILTER_TYPES.map((filter) => {
                  return (
                    <div
                      onClick={() => {
                        if (currentFilter === filter) {
                          setCurrentFilter("");
                        } else {
                          setCurrentFilter(filter);
                        }
                      }}
                      className={`px-3 2xl:px-5 py-2 ${
                        currentFilter == filter
                          ? "bg-primary text-bg-1 shadow-md "
                          : "bg-bg-2 text-text-2 border border-gray-200  hover:bg-bg-3 hover:shadow-md"
                      } font-body  text-xs 2xl:text-xl cursor-pointer
                
                
             
              font-semibold 
              rounded-full 
          
              transition-all duration-200 
              shadow-sm

             
              `}
                    >
                      {filter}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-y-scroll bg-bg-1  border border-bg-3 overflow-hidden shadow-sm shadow-slate-200/50">
        {currentRisposte?.map((risposta) => {
          return (
            <>
              <PartecipanteCard {...risposta} />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default EventDetailsParticipants;
