import ChevronRight from "@/assets/icons/ChevronRight";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useSocket } from "@/contexts/SocketContext";
import { Plus } from "lucide-react";
import React from "react";

const ParticipantsSection = ({
  handleParticipantsAdd,
  isAdmin,
  currentParticipants,
}) => {
  const { openModal } = useModal();
  const { currentGroupData, currentGroup } = useChat();
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  console.log(currentParticipants);
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
        },
      );

      if (response.ok) {
        console.log("invio il socket a tutti con me");
        currentSocket.emit("admin_participant", currentGroup, partecipante);
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
        },
      );

      if (response.ok) {
        console.log("invio il socket a tutti tranne me");
        currentSocket.emit("remove_participant", currentGroup, partecipante);
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
      }
    } catch (error) {
      console.error("Errore durante l'invio:", error);
    }
  };
  return (
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
              idx !== currentParticipants.length - 1 && "border-b border-bg-3"
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
                  console.log("apro action sheet di", partecipante.nome);
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

                {(currentGroupData.createdBy == partecipante.partecipante_id ||
                  currentGroupData.createdBy == partecipante.user_id) && (
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
  );
};

export default ParticipantsSection;
