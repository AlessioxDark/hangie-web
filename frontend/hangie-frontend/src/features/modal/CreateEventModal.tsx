import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CreateEventForm from "../events/CreateEventForm";
const MountElement = document.getElementById("overlays");
const CreateEventModal = () => {
  const { isModalOpen, modalData, modalType, closeModal } = useModal();

  return createPortal(
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
	           bg-black/40
	           transition-opacity duration-300"
          // Chiude il modal cliccando sull'overlay
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          <CreateEventForm />
        </div>
      )}
    </>,
    MountElement,
  );
};

export default CreateEventModal;
