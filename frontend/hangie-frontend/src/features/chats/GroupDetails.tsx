import ChevronLeft from "@/assets/icons/ChevronLeft";
import ChevronRight from "@/assets/icons/ChevronRight";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import { Edit2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AddParticipantsGroup from "./AddParticipantsGroup";
import { supabase } from "../../config/db.js";
import { useSocket } from "@/contexts/SocketContext.js";
import { useModal } from "@/contexts/ModalContext.js";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg", "webm", "svg"];

const GroupDetails = () => {
  const { currentScreen } = useScreen();
  const { session } = useAuth();

  const { currentGroupData, currentGroup, setCurrentGroupData, setGroupsData } =
    useChat();
  const { setMobileView } = useMobileLayoutChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isParticipantsAdd, setIsParticipantsAdd] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(
    currentGroupData?.partecipanti_gruppo?.some(
      (p) =>
        p.role === "admin" &&
        (p.partecipante_id || p.user_id) === session.user.id
    ) || false
  );

  const { currentSocket } = useSocket();

  const { openModal } = useModal();
  const fileInputRef = useRef(null);
  const [localGroupData, setLocalGroupData] = useState({
    group_cover_img: currentGroupData.group_cover_img,
    descrizione: currentGroupData.descrizione,
    nome: currentGroupData.nome,
  });
  const [currentEditingField, setCurrentEditingField] = useState(null);
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
  const displayImage = localGroupData.group_cover_img
    ? `${localGroupData.group_cover_img}?v=${
        currentGroupData.updated_at || Date.now()
      }`
    : null;

  const handleLeaveGroup = async () => {
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
          setMobileView("groups");
          console.log("invio emit leave group");

          currentSocket.emit(
            "leave_group",
            currentGroup,
            session.user.id,
            currentParticipants
          );
        });
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${currentGroup}/cover.${ext}`;
      const filePath = `${fileName}`;
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setFormError({
          type: "img",
          message: `inserire solo file tipi: ${ACCEPTED_EXTENSIONS.join(", ")}`,
        });
        return;
      }
      setFormError(null);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("group_cover_pics")
        .update(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });
      if (uploadError) {
        console.log(uploadError);
        setFormError("img", { message: uploadError.message });
        return;
      }
      const { data: urlData } = supabase.storage
        .from("group_cover_pics")
        .getPublicUrl(uploadData.path);
      const { data: coverData, error: coverError } = await supabase
        .from("gruppi")
        .update({ group_cover_img: urlData.publicUrl })
        .eq("group_id", currentGroup);
      if (coverError) setFormError("img", { message: coverError.message });
      setLocalGroupData((prev) => {
        return { ...prev, group_cover_img: urlData.publicUrl };
      });
      setCurrentGroupData((prevData) => {
        return { ...prevData, group_cover_img: urlData.publicUrl };
      });
      setGroupsData((prevData) => {
        return prevData.map((group) => {
          if (group.group_id == currentGroup) {
            return { ...group, group_cover_img: urlData.publicUrl };
          }
          return group;
        });
      });
      currentSocket.emit(
        "edit_field",
        currentGroup,
        "group_cover_img",
        urlData.publicUrl,
        currentParticipants
      );
    } catch (error) {
      setFormError("img", { message: error.message });
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
        currentSocket.emit(
          "add_participants",
          currentGroup,
          localParticipants,
          currentParticipants
        );
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };

  useEffect(() => {
    if (currentGroupData.partecipanti_gruppo) {
      console.log(
        "il nuovo partecipanti",
        currentGroupData.partecipanti_gruppo
      );
      setCurrentParticipants(
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
    }
  }, [currentGroupData.partecipanti_gruppo]);

  useEffect(() => {
    if (currentGroupData) {
      const { descrizione, nome, group_cover_img } = currentGroupData;
      const usefulGroupData = { descrizione, nome, group_cover_img };
      let hasChanged = false;
      const updatedState = { ...localGroupData };
      for (const key in usefulGroupData) {
        if (usefulGroupData[key] !== localGroupData[key]) {
          updatedState[key] = usefulGroupData[key];
          hasChanged = true;
        }
      }
      if (hasChanged) {
        setLocalGroupData(updatedState);
      }
    }
  }, [currentGroupData]);

  useEffect(() => {
    if (currentGroupData.partecipanti_gruppo && !isAdmin) {
      currentGroupData.partecipanti_gruppo.forEach((p) => {
        if (p.partecipante_id == session.user.id && p.role == "admin") {
          setIsAdmin(true);
        }
      });
    }
  }, [currentGroupData.partecipanti_gruppo]);
  const editField = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/modify/${currentGroup}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            field: currentEditingField,
            fieldValue: localGroupData[currentEditingField],
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        setCurrentGroupData((prevData) => {
          return {
            ...prevData,
            [currentEditingField]: localGroupData[currentEditingField],
          };
        });

        setGroupsData((prevData) => {
          return prevData.map((group) => {
            if (group.group_id == currentGroup) {
              return {
                ...group,
                [currentEditingField]: localGroupData[currentEditingField],
              };
            }
            return group;
          });
        });
        currentSocket.emit(
          "edit_field",
          currentGroup,
          currentEditingField,
          localGroupData[currentEditingField],
          currentParticipants
        );
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };
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
        console.log("invio il socket a tutti tranne me");
        currentSocket.emit(
          "remove_participant",
          currentGroup,
          partecipante,
          currentParticipants
        );
        // 4. Aggiorniamo lo stato locale e chiudiamo la schermata
        // setCurrentParticipants((prev) =>
        //   prev.filter((p) => p.user_id !== partecipante.user_id)
        // );

        // const participantsForGlobalState = currentParticipants.filter(
        //   (p) => p.user_id !== partecipante.user_id
        // );
        // const newParticipantsForGlobalState = participantsForGlobalState.map(
        //   (p) => {
        //     // return {...partici}
        //     return {
        //       partecipante_id: p.user_id, // Assicurati che il nome della chiave sia corretto per il tuo DB
        //       utenti: {
        //         user_id: p.user_id,
        //         nome: p.nome,
        //         handle: p.handle,
        //       },
        //     };
        //   }
        // );
        // setCurrentGroupData((prevData) => {
        //   return {
        //     ...prevData,
        //     partecipanti_gruppo: newParticipantsForGlobalState,
        //   };
        // });
        // setGroupsData((prevData) => {
        //   return prevData.map((group) => {
        //     if (group.group_id == currentGroup) {
        //       return {
        //         ...prevData,
        //         partecipanti_gruppo: newParticipantsForGlobalState,
        //       };
        //     }return group
        //   });
        // });
        // Nota: qui potresti voler chiamare una funzione dal tuo Context per rinfrescare i dati globali
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };

  const handleFinishEdit = async () => {
    if (
      localGroupData[currentEditingField] !==
      currentGroupData[currentEditingField]
    ) {
      if (validateField()) {
        await editField(); // Esegui la fetch
      }
    }
    setCurrentEditingField(null); // Chiudi l'edit solo dopo
  };

  const validateField = () => {
    if (currentEditingField == "descrizione") {
      if (localGroupData.descrizione.length < 10) {
        setFormError({
          type: "descrizione",
          message: "la descrizione deve essere minimo 10 caratteri",
        });
        return false;
      }
      if (localGroupData.descrizione.length > 350) {
        setFormError({
          type: "descrizione",
          message: "La descrizione può essere massimo 350 caratteri",
        });
        return false;
      }
      setFormError(null);

      return true;
    }
    if (currentEditingField == "nome") {
      if (localGroupData.nome.length < 3) {
        setFormError({
          type: "nome",
          message: "il titolo deve avere almeno 3 caratteri",
        });
        return false;
      }
      if (localGroupData.nome.length > 20) {
        setFormError({
          type: "nome",
          message: "il titolo può avere massimo 20 caratteri",
        });
        return false;
      }
      setFormError(null);

      return true;
    }
  };
  const handleMakeAdmin = async (partecipante) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/modify/participants/${currentGroup}`,
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
        console.log("invio il socket a tutti con me");
        currentSocket.emit(
          "admin_participant",
          currentGroup,
          partecipante,
          currentParticipants
        );
        // 4. Aggiorniamo lo stato locale e chiudiamo la schermata

        // setCurrentGroupData((prevData) => {
        //   return {
        //     ...prevData,
        //     partecipanti_gruppo: newParticipantsForGlobalState,
        //   };
        // });
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
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        accept="image/*"
                      />
                      <div className="flex flex-col gap-2 w-full items-center">
                        {localGroupData.group_cover_img == null ? (
                          <div
                            className="rounded-full w-48 h-48 "
                            onClick={() => {
                              fileInputRef.current.click();
                            }}
                          >
                            <DefaultGroupIcon />
                          </div>
                        ) : (
                          <img
                            // src={currentGroupImg}
                            src={displayImage}
                            alt=""
                            className="w-48 h-48 rounded-full"
                            onClick={() => {
                              fileInputRef.current.click();
                            }}
                          />
                        )}
                        {formError && formError.type == "img" && (
                          <span className="text-sm font-body  text-red-500 ">
                            {formError.message}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col text-center font-body">
                      <div className="relative">
                        {isAdmin && (
                          <div
                            className="absolute rounded-full -top-2.5 -right-5 rotate-270 p-1.5 bg-primary"
                            onClick={() => {
                              console.log("voglio modificare il titolo");
                              if (currentEditingField != "nome") {
                                console.log("era false lo metto true");
                                setCurrentEditingField("nome");
                              } else {
                                handleFinishEdit();
                              }
                            }}
                          >
                            {currentEditingField == "nome" ? (
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

                        {currentEditingField == "nome" ? (
                          <div className="flex flex-col gap-2 ">
                            <input
                              className="text-2xl font-bold text-text-1 leading-tight p-1 focus:outline-none text-center"
                              autoFocus
                              value={localGroupData.nome}
                              onChange={(e) => {
                                setLocalGroupData((prevData) => {
                                  return { ...prevData, nome: e.target.value };
                                });
                              }}
                            />
                            {formError && formError.type == "nome" && (
                              <span className="text-sm font-body  text-red-500 ">
                                {formError.message}
                              </span>
                            )}
                          </div>
                        ) : (
                          <h1 className="text-2xl font-bold text-text-1 leading-tight">
                            {localGroupData.nome}
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
                <div className="px-4">
                  <div className="w-full flex flex-row justify-between">
                    <h3 className="text-xs font-bold font-body text-text-2 uppercase tracking-wide mb-1">
                      Descrizione
                    </h3>
                    {isAdmin && (
                      <h3
                        className="text-xs font-bold font-body text-primary uppercase tracking-wide mb-1"
                        onClick={() => {
                          if (currentEditingField != "descrizione") {
                            setCurrentEditingField("descrizione");
                          } else {
                            handleFinishEdit();
                          }
                        }}
                      >
                        {currentEditingField == "descrizione"
                          ? "Fine"
                          : "Modifica"}
                      </h3>
                    )}
                  </div>
                  {currentEditingField == "descrizione" ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={localGroupData.descrizione}
                        className="text-text-1 font-body text-sm leading-relaxed w-full p-1.5 border-2 border-primary rounded-lg focus:outline-none resize-none "
                        onChange={(e) =>
                          setLocalGroupData((prevData) => {
                            return { ...prevData, descrizione: e.target.value };
                          })
                        }
                        rows={2}
                        autoFocus
                      ></textarea>
                      {formError && formError.type == "descrizione" && (
                        <span className="text-sm font-body  text-red-500 ">
                          {formError.message}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-1 font-body text-sm leading-relaxed">
                      {isExpanded
                        ? localGroupData.descrizione
                        : `${localGroupData.descrizione.slice(0, 120)}`}
                      {localGroupData.descrizione.length > 120 && (
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
                      <div
                        className="w-13 h-13 shrink-0 "
                        onClick={() => {
                          console.log("apro profilo di", partecipante.nome);
                        }}
                      >
                        <ProfileIcon user_id={partecipante.user_id} />
                      </div>
                      <div
                        className="flex flex-col min-w-0 flex-1"
                        onClick={() => {
                          if (partecipante.user_id !== session.user.id) {
                            console.log(
                              "apro action sheet di",
                              partecipante.nome
                            );
                            openModal({
                              type: "PARTICIPANT_ACTIONS",
                              data: {
                                partecipante,
                                handleMakeAdmin,
                                handleRemoveParticipants,
                                isAdmin,
                              },
                            });
                          }
                        }}
                      >
                        <div className="flex flex-row gap-1 items-end">
                          <span className="text-text-1 font-semibold truncate leading-tight">
                            {partecipante.nome}
                          </span>

                          {(currentGroupData.createdBy ==
                            partecipante.partecipante_id ||
                            currentGroupData.createdBy ==
                              partecipante.user_id) && (
                            <span className="text-primary text-[10px] py-0.5 px-1 rounded-xl font-medium">
                              CREATORE
                            </span>
                          )}
                          {partecipante.role == "admin" &&
                            !(
                              currentGroupData.createdBy ==
                                partecipante.partecipante_id ||
                              currentGroupData.createdBy == partecipante.user_id
                            ) && (
                              <span className="text-primary text-[10px] py-0.5 px-1 rounded-xl font-medium">
                                ADMIN
                              </span>
                            )}
                        </div>
                        <span className="text-text-2 text-sm truncate">
                          @{partecipante.handle}
                        </span>
                      </div>
                      <div
                        className="w-5 h-5"
                        onClick={() => {
                          console.log("apro profilo di", partecipante.nome);
                        }}
                      >
                        <ChevronRight color={"#64748b"} />
                      </div>
                    </div>
                  ))}
                  {isAdmin && (
                    <button
                      className="w-full bg-primary text-white font-body px-2.5 py-3 flex justify-center"
                      onClick={handleParticipantsAdd}
                    >
                      <Plus className="text-white font-bold " size={30} />
                    </button>
                  )}
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
