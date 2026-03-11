import ChevronRight from "@/assets/icons/ChevronRight";
import ProfileIcon from "@/components/ProfileIcon";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useSocket } from "@/contexts/SocketContext";
import { ApiCalls } from "@/services/api";
import { Plus } from "lucide-react";

const ParticipantsSection = ({
  handleParticipantsAdd,
  isAdmin,
  currentParticipants,
}) => {
  const { openModal } = useModal();
  const { currentGroupData, currentGroup } = useChat();
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const { executeApiCall } = useApi();
  const handleMakeAdmin = async (partecipante) => {
    const saveData = (data) => {
      currentSocket.emit("admin_participant", currentGroup, partecipante);
    };
    executeApiCall(
      "make_admin",
      () => {
        return () => {
          ApiCalls.editGroupField(session.access_token, currentGroup, {
            user_id: partecipante.user_id,
          });
        };
      },
      saveData,
    );
  };
  const handleRemoveParticipants = async (partecipante) => {
    const saveData = (data) => {
      currentSocket.emit("remove_participant", currentGroup, partecipante);
    };
    ("ora la chiamo");

    executeApiCall(
      "remove_participant",
      () =>
        ApiCalls.handleRemoveParticipant(session.access_token, currentGroup, {
          user_id: partecipante.user_id,
        }),
      // () => {
      //   return () => {
      //      ("sto rimuovendo participant");
      //     ApiCalls.handleRemoveParticipant(session.access_token, currentGroup, {
      //       user_id: partecipante.user_id,
      //     });
      //   };
      // },
      saveData,
    );
  };
  console.log(currentParticipants);
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
                ("apro profilo di", partecipante.nome);
              }}
            >
              <ProfileIcon profile_pic={partecipante.profile_pic} />
            </div>
            <div
              className="flex flex-col min-w-0 flex-1"
              onClick={() => {
                if (partecipante.user_id !== session.user.id) {
                  ("apro action sheet di", partecipante.nome);
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
                ("apro profilo di", partecipante.nome);
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
