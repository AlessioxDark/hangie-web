import ClipIcon from "@/assets/icons/ClipIcon";
import SendIcon from "@/assets/icons/SendIcon";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import { Calendar, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const ChatInput = ({
  chatInputRef,
  inputValue,
  setInputValue,
  sendMessage,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { openModal } = useModal();
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayout();
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Aggiunge l'event listener al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Pulizia: rimuove l'event listener quando il componente viene smontato
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInput = useCallback(
    (e) => {
      const currentContent = e.currentTarget.textContent || "";

      // 1. Cancella il timer precedente (se l'utente sta ancora digitando)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 2. Imposta un nuovo timer per aggiornare lo stato del genitore
      debounceTimerRef.current = setTimeout(() => {
        // Questa chiamata avviene solo DOPO la pausa, riducendo i re-render del genitore.
        setInputValue(currentContent);
      }, 100);
    },
    [setInputValue],
  );
  const isSendActive =
    inputValue && inputValue.trim().length > 0 && !isDropdownOpen;

  const handleDropdownChoice = (type) => {
    openModal({ type: type, data: null });
  };
  return (
    <div
      className="
            bg-white border-t border-gray-200
                    flex items-center justify-center 
                    p-2 2xl:p-4 shadow-2xl 
					w-full
        "
      style={{ borderWidth: "0.1px", borderLeft: "0px" }}
    >
      {/* Contenitore Input Interno */}
      <div className="flex flex-row w-full  gap-1.5 2xl:gap-4 items-center">
        <div
          className="
          bg-gray-100 flex-1 
                            rounded-4xl 
                            focus-within:ring-2 
                            focus-within:ring-blue-500
                            p-1 shadow-inner transition-shadow
                            flex items-center
                             gap-0.5
                             min-h-11
                             
                           
                            
          "
        >
          <div
            className=" relative transition-all ml-2 hover:bg-bg-3 rounded-full w-6 h-full 2xl:h-12 2xl:w-12 flex items-center justify-center"
            ref={dropdownRef}
          >
            <div className="w-5 h-5 2xl:w-6 2xl:h-6" onClick={toggleDropdown}>
              <ClipIcon />
            </div>
            {isDropdownOpen &&
              (currentScreen !== "xs" ? (
                <div
                  className={`absolute bottom-12 w-32 min-h-12 bg-bg-1 transition-all rounded-xl `}
                >
                  <div className="w-full text-center hover:bg-bg-3/60 py-2 cursor-pointer transition-all rounded-t-xl">
                    <span
                      className="text-text-1 font-body font-medium  w-full"
                      onClick={() => {
                        handleDropdownChoice("CREATE_EVENT_MODAL");
                      }}
                    >
                      Crea Evento
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`absolute -left-5 bottom-10 w-screen  min-h-12 transition-all bg-bg-3 duration-500 rounded-t-xl flex flex-row gap-2 py-2 px-2 `}
                >
                  <div
                    onClick={() => {
                      setMobileView("CREATE_EVENT");
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="p-2 rounded-full bg-primary">
                      <Plus className="text-bg-1" />
                    </div>
                    <span className="text-xs font-body text-text-1">
                      Crea Evento
                    </span>
                  </div>
                  {/* <div className="w-full text-center hover:bg-bg-3/60 py-2 cursor-pointer transition-all rounded-t-xl">
                    <span
                      className="text-text-1 font-body font-medium  w-full"
                      onClick={() => {
                        handleDropdownChoice("CREATE_EVENT_MODAL");
                      }}
                    >
                      Crea Evento
                    </span>
                  </div> */}
                </div>
              ))}
          </div>

          <div
            // CRUCIALE: Disabilita l'editing quando il dropdown è aperto
            contentEditable={!isDropdownOpen}
            ref={chatInputRef}
            className={`
                            min-h-8
                            max-h-32
                           
                            w-full py-2 px-1 pr-3 outline-none 
                            text-sm 2xl:text-lg text-text-1 font-body
                            overflow-y-auto 
                            transition-opacity duration-200
                           
                            ${
                              isDropdownOpen
                                ? "opacity-50 cursor-not-allowed"
                                : "opacity-100"
                            }
                        `}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isSendActive) sendMessage(); // Invia solo se attivo
              }
            }}
            data-placeholder="Scrivi un messaggio..."
          ></div>
        </div>
        <button
          onClick={isSendActive ? sendMessage : undefined}
          disabled={!isSendActive}
          className={`
                        w-10 h-10 2xl:w-11 2xl:h-11 
                        flex items-center justify-center 
                        rounded-full 
                        transition-all duration-150
                        shadow-md 
                        flex-shrink-0
                        ${
                          isSendActive
                            ? "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                            : "bg-gray-300 cursor-not-allowed shadow-none"
                        }
                    `}
          aria-label="Invia messaggio"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
