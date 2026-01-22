import { useModal } from "@/contexts/ModalContext";
import React, { useEffect } from "react";
import EventDetails from "../events/EventDetails";
import CreateEventModal from "./CreateEventModal";
import EventDetailsModal from "./EventDetailsModal";
import ParticipantActionsModal from "./ParticipantActionsModal";

const ModalHandler = () => {
  console.log("ok");
  const { modalType } = useModal();

  if (modalType == null) return <></>;
  if (modalType == "PARTICIPANT_ACTIONS") return <ParticipantActionsModal />;
  if (modalType == "CREATE_EVENT_MODAL") return <CreateEventModal />;
};

export default ModalHandler;
