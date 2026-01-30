import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FormInput from "../CreateEventForm/FormInput";
import FormTextarea from "../CreateEventForm/FormTextarea";
import { Trash } from "lucide-react";
import AddParticipantsGroup from "./AddParticipantsGroup";
import ParticipantCard from "./ParticipantCard";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../../config/db.js";
import { useSocket } from "@/contexts/SocketContext.js";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg", "webm", "svg"];
const GroupSchema = z.object({
  nome: z
    .string()
    .min(1, "il nome è obbligatorio")
    .min(3, " il nome deve avere minimo 3 caratteri")
    .max(20, "il nome è troppo lungo")
    .regex(
      /^[a-zA-Z0-9\s\u00C0-\u017F!?.()\-@#&]+$/u,
      "Il nome contiene caratteri non validi",
    ),
  descrizione: z
    .string()
    .min(1, "la descrizione è obbligatoria")
    .min(10, "la descrizione deve essere minimo 10 caratteri")
    .max(350, "La descrizione può essere massimo 350 caratteri"),
});
const CreateGroupForm = () => {
  const { setMobileView } = useMobileLayout();

  const methods = useForm({
    resolver: zodResolver(GroupSchema),
    mode: "onSubmit",
  });
  const [groupImage, setGroupImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [participantsError, setParticipantsError] = useState(null);
  const [isParticipantsAdd, setIsParticipantsAdd] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.type.split("/")[1];
    console.log(file.name);
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setImageError({
        message: `Accettiamo solo ${ACCEPTED_EXTENSIONS.join(", ")}`,
      });

      event.target.value = null;
      return;
    } else {
      setImageError(null);
    }
    console.log(file.name.split(".").pop());
    setGroupImage({
      file: file, // <--- Qui salviamo l'oggetto File integro
      type: file.type,
      ext: file.name.split(".").pop(),

      name: "cover",
      url: URL.createObjectURL(file),
    });
    event.target.value = null;
  };
  const handleButtonClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = methods;

  const onSubmit = async (data) => {
    if (currentParticipants.length < 2) {
      setParticipantsError({ message: "Inserisci almeno due partecipanti" });
      return;
    } else {
      setParticipantsError(null);
    }
    try {
      const response = await fetch(
        "http://localhost:3000/api/groups/add/newGroup",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...data,
            participants: currentParticipants,
          }),
        },
      );
      const result = await response.json();
      let finalImgUrl = null;
      if (!response.ok)
        throw new Error(result.error || "Errore creazione evento");
      console.log("Wquesto è il result", result);
      const groupId = result.data.group_id;
      if (groupImage) {
        const fileName = `${groupId}/cover.${groupImage.ext}`;
        const filePath = `${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("group_cover_pics")
          .upload(filePath, groupImage.file, {
            upsert: true,
            contentType: groupImage.type,
            cacheControl: "3600",
          });
        if (uploadError) throw new Error(uploadError);
        const { data: urlData } = supabase.storage
          .from("group_cover_pics")
          .getPublicUrl(uploadData.path);

        const { data: coverData, error: coverError } = await supabase
          .from("gruppi")
          .update({ group_cover_img: urlData.publicUrl })
          .eq("group_id", groupId);
        if (coverError) throw new Error(coverError);
        finalImgUrl = urlData.publicUrl;
      }
      currentSocket.emit(
        "add_new_group",
        groupId,
        result.data.groupData,

        finalImgUrl,
        session.user.id,
      );
      setMobileView("groups");
    } catch (error) {
      setError("root", { message: `errore: ${error}` });
    }
  };
  useEffect(() => {
    if (currentParticipants.length >= 2) {
      setParticipantsError(null);
    }
  }, [currentParticipants]);
  return (
    <div className="flex flex-col gap-2 pb-10">
      {isParticipantsAdd ? (
        <AddParticipantsGroup
          setIsParticipantsAdd={setIsParticipantsAdd}
          setCurrentParticipants={setCurrentParticipants}
          currentParticipants={currentParticipants}
        />
      ) : (
        <>
          <div className="w-full  p-2 border-b border-bg-3 items-center fixed top-0 bg-white">
            <div className="flex flex-row gap-1 items-center">
              <div
                className="w-6 h-6"
                onClick={() => {
                  setMobileView("groups");
                }}
              >
                <ChevronLeft color={"#2463eb"} />
              </div>
              <h1 className="text-lg text-text-1 font-body font-bold ">
                Crea un gruppo
              </h1>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }}
          >
            <div className="flex flex-col gap-2 px-3 pt-14 ">
              <div className="w-full flex items-center flex-col gap-2">
                <input
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="flex flex-col gap-3 items-center w-full">
                  {groupImage == null ? (
                    <>
                      <div
                        className="w-30 h-30"
                        onClick={handleButtonClick}
                        aria-label="Aggiungi Immagine"
                      >
                        <DefaultGroupIcon />
                      </div>
                      <span
                        className=" text-sm font-body text-primary font-semibold leading-3"
                        onClick={handleButtonClick}
                        aria-label="Aggiungi Immagine"
                      >
                        Inserisci un immagine di copertina
                      </span>
                    </>
                  ) : (
                    <div className="w-30 h-30 relative">
                      <img
                        src={groupImage.url}
                        alt=""
                        className="w-full h-full aspect-square rounded-full"
                      />
                      <div
                        className="absolute top-1 -right-3 p-1.5 bg-text-2/40 rounded-full"
                        onClick={() => {
                          setGroupImage(null);
                        }}
                      >
                        <Trash size={14} className="" />
                      </div>
                    </div>
                  )}
                  {imageError && (
                    <p className="text-sm font-body  text-red-500 leading-2 ">
                      {imageError.message}
                    </p>
                  )}
                </div>
              </div>
              <FormInput
                error={errors.nome}
                label={"Nome gruppo"}
                placeholder={"Nome del gruppo"}
                register={register}
                id="nome"
                type={"text"}
              />
              <FormTextarea
                id="descrizione"
                label="Descrizione"
                placeholder="Descrizione del gruppo"
                register={register}
                error={errors.descrizione}
              />
              <div className="flex flex-col gap-1.5">
                <h3 className="text-text-1 font-body text-sm font-medium ">
                  Partecipanti Gruppo
                </h3>
                <div>
                  <div className="overflow-x-auto flex flex-row gap-2 pb-2 items-startP">
                    <div
                      className={`bg-bg-2 border-2 rounded-full ${
                        participantsError
                          ? "border-red-500 ring-4 ring-red-100"
                          : `border-text-2 border-dashed`
                      }  
                                    aspect-square minw-[80px] w-16 min-h-16 max-h-16 2xl:min-w-[150px] 2xl:w-40 flex items-center justify-center cursor-pointer 
                                    hover:bg-bg-3 transition-all duration-200 shadow-inner`}
                      // onClick={handleButtonClick}
                      onClick={() => setIsParticipantsAdd(true)}
                      aria-label="Aggiungi Immagine"
                    >
                      <span
                        className={`font-body font-bold ${
                          participantsError ? "text-red-500" : `text-text-2`
                        }   text-3xl 2xl:text-6xl`}
                      >
                        +
                      </span>
                    </div>
                    <div className="flex flex-row gap-1">
                      {currentParticipants.map((participant) => {
                        return (
                          <ParticipantCard
                            {...participant}
                            setCurrentParticipants={setCurrentParticipants}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {participantsError !== null && (
                    <p className="text-sm font-body  text-red-500 ">
                      {participantsError.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full flex justify-center mt-2.5">
                <button
                  type="submit"
                  className="font-body text-white font-bold bg-primary  rounded-xl px-8 py-3.5  
                hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-base cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creazione..." : "Crea Gruppo"}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateGroupForm;
