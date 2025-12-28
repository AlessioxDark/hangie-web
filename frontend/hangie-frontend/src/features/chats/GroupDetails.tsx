import ChevronLeft from "@/assets/icons/ChevronLeft";
import ChevronRight from "@/assets/icons/ChevronRight";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import { Edit, Edit2, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddParticipantsGroup from "./AddParticipantsGroup";

const GroupDetails = () => {
  const { currentScreen } = useScreen();
  const { session } = useAuth();

  const { currentGroupData, currentGroup, setCurrentGroupData } = useChat();
  const { setMobileView } = useMobileLayoutChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isParticipantsAdd, setIsParticipantsAdd] = useState(false);
  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const isCreator = currentGroupData?.createdBy == session.user.id;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(
    currentGroupData.descrizione
  );
  const [currentTitle, setCurrentTitle] = useState(currentGroupData.nome);
  const [currentParticipants, setCurrentParticipants] = useState(() => {
    return (
      currentGroupData?.partecipanti_gruppo?.map((partecipante) => {
        const { utenti, ...resto } = partecipante;
        return {
          ...resto,
          nome: utenti.nome,
          handle: utenti.handle,
          user_id: utenti.user_id,
        };
      }) || []
    );
  });

  const handleLeaveGroup = async () => {
    console.log(currentGroupData);

    try {
      fetch(`http://localhost:3000/api/groups/leave/${currentGroup}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleParticipantsAdd = () => {
    setIsParticipantsAdd(true);
  };
  const handleSaveParticipants = async (updatedList) => {
    // 1. Troviamo chi è veramente nuovo (quelli in updatedList che non sono in currentGroupData)
    const newParticipants = updatedList.filter((participant) => {
      return !currentGroupData.partecipanti_gruppo.some(
        (original) => original.utenti.user_id === participant.user_id
      );
    });

    // 2. Se non ci sono nuovi membri, chiudiamo e basta
    if (newParticipants.length === 0) {
      setIsParticipantsAdd(false);
      return;
    }

    // 3. Prepariamo i soli ID da inviare
    const newParticipantsIds = newParticipants.map((p) => ({
      user_id: p.user_id,
    }));

    console.log("Invio nuovi partecipanti:", newParticipantsIds);

    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/add/participants/${currentGroup}`,
        {
          method: "PATCH",
          body: JSON.stringify(newParticipantsIds),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        // 4. Aggiorniamo lo stato locale e chiudiamo la schermata
        setCurrentParticipants(updatedList);
        setIsParticipantsAdd(false);
        console.log("aggiorno stato globale con:", newParticipants);
        const newParticipantsForGlobalState = newParticipants.map((p) => ({
          partecipante_id: p.user_id, // Assicurati che il nome della chiave sia corretto per il tuo DB
          utenti: {
            user_id: p.user_id,
            nome: p.nome,
            handle: p.handle,
          },
        }));
        setCurrentGroupData((prevData) => {
          return {
            ...prevData,
            partecipanti_gruppo: [
              ...prevData.partecipanti_gruppo,
              ...newParticipantsForGlobalState,
            ],
          };
        });
        // Nota: qui potresti voler chiamare una funzione dal tuo Context per rinfrescare i dati globali
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };

  const handleModifyParticipants = () => {
    setIsEditingParticipants((prev) => !prev);
  };

  useEffect(() => {
    if (
      !isEditingDescription &&
      currentDescription !== currentGroupData.descrizione
    ) {
      editField("descrizione");
    }
  }, [isEditingDescription]);
  useEffect(() => {
    if (!isEditingTitle && currentTitle !== currentGroupData.nome) {
      editField("nome");
    }
  }, [isEditingTitle]);

  const editField = async (field) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/modify/${currentGroup}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            [field]: field == "descrizione" ? currentDescription : currentTitle,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        // 4. Aggiorniamo lo stato locale e chiudiamo la schermata

        setCurrentGroupData((prevData) => {
          return {
            ...prevData,
            [field]: field == "descrizione" ? currentDescription : currentTitle,
          };
        });
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };
  console.log(currentGroupData);
  const handleRemoveParticipants = async (partecipante) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/remove/participants/${currentGroup}`,
        {
          method: "PATCH",
          body: JSON.stringify({ user_id: partecipante.user_id }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        // 4. Aggiorniamo lo stato locale e chiudiamo la schermata
        setCurrentParticipants((prev) =>
          prev.filter((p) => p.user_id !== partecipante.user_id)
        );

        const participantsForGlobalState = currentParticipants.filter(
          (p) => p.user_id !== partecipante.user_id
        );
        const newParticipantsForGlobalState = participantsForGlobalState.map(
          (p) => {
            // return {...partici}
            return {
              partecipante_id: p.user_id, // Assicurati che il nome della chiave sia corretto per il tuo DB
              utenti: {
                user_id: p.user_id,
                nome: p.nome,
                handle: p.handle,
              },
            };
          }
        );
        setCurrentGroupData((prevData) => {
          return {
            ...prevData,
            partecipanti_gruppo: newParticipantsForGlobalState,
          };
        });
        // Nota: qui potresti voler chiamare una funzione dal tuo Context per rinfrescare i dati globali
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };
  return (
    <div>
      {isParticipantsAdd ? (
        <AddParticipantsGroup
          setIsParticipantsAdd={setIsParticipantsAdd}
          setCurrentParticipants={setCurrentParticipants}
          currentParticipants={currentParticipants}
          isGroup={true}
          onConfirm={(listaDalloSchermoAdd) =>
            handleSaveParticipants(listaDalloSchermoAdd)
          }
        />
      ) : (
        <div className="pb-6">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-bg-1 px-4 py-3 backdrop-blur-md border-b border-gray-200  mb-4">
            <div className="flex items-center gap-2">
              {currentScreen === "xs" && (
                <button
                  onClick={() => {
                    console.log("lista aggiornata", currentGroupData);
                    setMobileView("chat");
                  }}
                  className="w-7 h-7"
                >
                  <ChevronLeft color={"#007AFF"} /> {/* Blue Apple Color */}
                </button>
              )}
              <h2 className="text-lg font-semibold text-text-1">Info Gruppo</h2>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <div className="w-full flex justify-center">
                  <div className="flex flex-col gap-6 items-center">
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
                    <div className="flex flex-col text-center font-body">
                      <div className="relative">
                        {isCreator && (
                          <div
                            className="absolute rounded-full -top-1.5 -right-4 rotate-270 p-1.5 bg-primary"
                            onClick={() => {
                              setIsEditingTitle((prev) => !prev);
                            }}
                          >
                            {isEditingTitle ? (
                              <X fill="#ffffff" stroke="#ffffff" size={12} />
                            ) : (
                              <Edit2
                                fill="#ffffff"
                                stroke="#ffffff"
                                size={12}
                              />
                            )}
                          </div>
                        )}
                        {isEditingTitle ? (
                          <input
                            className="text-2xl font-bold text-text-1 leading-tight p-1 focus:outline-none text-center"
                            autoFocus
                            value={currentTitle}
                            onChange={(e) => {
                              setCurrentTitle(e.target.value);
                            }}
                          />
                        ) : (
                          <h1 className="text-2xl font-bold text-text-1 leading-tight">
                            {currentTitle}
                          </h1>
                        )}
                      </div>
                      <p className="text-text-2 text-zinc-400 text-base font-medium">
                        Gruppo • {currentGroupData?.partecipanti_gruppo.length}{" "}
                        partecipanti
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-3">
                  <div className="w-full flex flex-row justify-between">
                    <h3 className="text-xs font-bold font-body text-text-2 uppercase tracking-wide mb-1">
                      Descrizione
                    </h3>
                    {isCreator && (
                      <h3
                        className="text-xs font-bold font-body text-primary uppercase tracking-wide mb-1"
                        onClick={() => setIsEditingDescription((prev) => !prev)}
                      >
                        {isEditingDescription ? "Fine" : "Modifica"}
                      </h3>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <textarea
                      value={currentDescription}
                      className="text-text-1 font-body text-sm leading-relaxed w-full p-1.5 border-2 border-primary rounded-lg focus:outline-none resize-none "
                      onChange={(e) => setCurrentDescription(e.target.value)}
                      rows={2}
                      autoFocus
                    ></textarea>
                  ) : (
                    <span className="text-text-1 font-body text-sm leading-relaxed">
                      {isExpanded
                        ? currentDescription
                        : `${currentDescription.slice(0, 120)}`}
                      {currentDescription.length > 120 && (
                        <span
                          className="text-primary font-semibold text-sm hover:underline"
                          onClick={() => {
                            setIsExpanded((prev) => !prev);
                          }}
                        >
                          Leggi {isExpanded ? "Meno" : "Tutto"}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <section className="flex flex-col gap-2.5">
                <div className="w-full flex flex-row justify-between">
                  <h3 className="px-8 text-xs font-bold font-body text-text-2 uppercase tracking-wide">
                    {currentParticipants.length} Partecipanti
                  </h3>

                  {isCreator && (
                    <h3
                      className="px-6 text-xs font-bold font-body text-primary uppercase tracking-wide cursor-pointer"
                      onClick={handleModifyParticipants}
                    >
                      {isEditingParticipants ? "Fine" : "Modifica"}
                    </h3>
                  )}
                </div>
                <div className="mx-4 bg-bg-1 rounded-2xl border border-bg-3 overflow-hidden shadow-sm shadow-slate-200/50">
                  {currentParticipants.map((partecipante, idx) => (
                    <div
                      key={partecipante.partecipante_id}
                      className={`flex items-center gap-2.5 px-2.5 py-3 hover:bg-bg-2 active:bg-bg-3/50 transition-all cursor-pointer group relative ${
                        idx !== currentParticipants.length - 1 &&
                        "border-b border-bg-3"
                      } `}
                    >
                      {isEditingParticipants &&
                        isCreator &&
                        partecipante.user_id !== session.user.id && (
                          <div
                            className="absolute top-1.5 right-1.5 p-0.5 bg-primary rounded-full"
                            onClick={() =>
                              handleRemoveParticipants(partecipante)
                            }
                          >
                            <X size={13} className="text-white" />
                          </div>
                        )}
                      <div className="w-13 h-13 shrink-0 ">
                        <ProfileIcon user_id={partecipante.user_id} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-row gap-1 items-end">
                          <span className="text-text-1 font-semibold truncate leading-tight">
                            {partecipante.nome}
                          </span>

                          {session.user.id == partecipante.user_id &&
                            isCreator && (
                              <span className="text-primary text-[10px] py-0.5 px-1 rounded-xl font-medium">
                                CREATORE
                              </span>
                            )}
                        </div>
                        <span className="text-text-2 text-sm truncate">
                          @{partecipante.handle}
                        </span>
                      </div>
                      <div className="w-5 h-5">
                        <ChevronRight color={"#64748b"} />
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full bg-primary text-white font-body px-2.5 py-3 flex justify-center"
                    onClick={handleParticipantsAdd}
                  >
                    <Plus className="text-white font-bold " size={30} />
                  </button>
                </div>
              </section>
            </div>
            <section className="px-4 mt-4">
              <button
                className="w-full py-4 text-white  bg-red-500 font-semibold rounded-2xl active:bg-red-400 transition-all shadow-sm"
                onClick={() => {
                  handleLeaveGroup();
                }}
              >
                Abbandona Gruppo
              </button>
            </section>
          </div>
        </div>
      )}
      ;
    </div>
  );
};
export default GroupDetails;
