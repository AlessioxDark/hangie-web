import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import React from "react";
import { createPortal } from "react-dom";
const MountElement = document.getElementById("overlays");

const ParticipantActionsModal = () => {
  const { isModalOpen, modalData, closeModal } = useModal();
  const { session } = useAuth();

  const { handleMakeAdmin, handleRemoveParticipants, partecipante, isAdmin } =
    modalData;
  return createPortal(
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
             bg-black/40
             transition-opacity duration-300"
          // Chiude il modal cliccando sull'overlay
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div className=" bg-bg-1  rounded-2xl  w-90/100 py-4  overflow-y-auto">
            <div className="w-full p-3 px-7 active:bg-bg-3/50 transition-colors duration-200">
              <span>Visualizza Profilo</span>
            </div>
            {/* {partecipante.role !== "admin" && (
             
            )} */}
            {isAdmin && (
              <>
                {partecipante.role !== "admin" && (
                  <div
                    className="w-full  p-3 px-7 active:bg-bg-3/50 transition-colors duration-200"
                    onClick={() => {
                      handleMakeAdmin(partecipante);
                      closeModal();
                    }}
                  >
                    <span>Rendi Amministratore</span>
                  </div>
                )}
                <div
                  className="w-full p-3 px-7 active:bg-bg-3/50 transition-colors duration-200"
                  onClick={() => {
                    handleRemoveParticipants(partecipante);
                    closeModal();
                  }}
                >
                  <span className="text-red-500 font-body">
                    Rimuovi Partecipante
                  </span>
                </div>
              </>
            )}
          </div>
          {/* <EventDetails {...eventData} /> */}
        </div>
      )}
    </>,
    MountElement
  );
};

export default ParticipantActionsModal;
