import { useChat } from "@/contexts/ChatContext";
import React, { useState } from "react";

const EditableDescription = ({
  isAdmin,
  currentEditingField,
  setCurrentEditingField,
  handleFinishEdit,
  localGroupData,
  setLocalGroupData,
  formError,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentGroupData } = useChat();
  return (
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
                if (
                  localGroupData.descrizione !== currentGroupData.descrizione
                ) {
                  handleFinishEdit();
                } else {
                  setCurrentEditingField("");
                }
              }
            }}
          >
            {currentEditingField == "descrizione" ? "Fine" : "Modifica"}
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
  );
};

export default EditableDescription;
