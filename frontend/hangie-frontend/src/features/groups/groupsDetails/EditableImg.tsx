import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useChat } from "@/contexts/ChatContext";
import { useSocket } from "@/contexts/SocketContext";
import { Edit2, X } from "lucide-react";
import React, { useRef } from "react";
import { supabase } from "../../../config/db.js";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg", "webm", "svg"];

const EditableImg = ({
  isAdmin,
  currentEditingField,
  setCurrentEditingField,
  setFormError,
  localGroupData,
  setLocalGroupData,
  formError,
  handleFinishEdit,
  currentParticipants,
}) => {
  const { setGroupsData, currentGroupData, setCurrentGroupData, currentGroup } =
    useChat();
  const fileInputRef = useRef(null);
  const displayImage = localGroupData?.group_cover_img
    ? `${localGroupData.group_cover_img}?v=${
        currentGroupData.updated_at || Date.now()
      }`
    : null;
  const { currentSocket } = useSocket();

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
  return (
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
            {localGroupData?.group_cover_img == null ? (
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
                  <Edit2 fill="#ffffff" stroke="#ffffff" size={12} />
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
            Gruppo • {currentGroupData?.partecipanti_gruppo.length} partecipanti
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditableImg;
