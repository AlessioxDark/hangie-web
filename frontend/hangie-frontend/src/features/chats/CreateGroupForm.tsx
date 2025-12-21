import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FormInput from "../CreateEventForm/FormInput";
import FormTextarea from "../CreateEventForm/FormTextarea";
import { Divide, Plus } from "lucide-react";
import AddParticipantsGroup from "./AddParticipantsGroup";
import FriendCard from "../friends/FriendCard";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg", "webm", "svg"];

const CreateGroupForm = () => {
  const { setMobileView } = useMobileLayoutChat();
  const schema = z.object({
    nome: z.string().min(1, "il nome del gruppo è obbligatorio"),
    descrizione: z
      .string()
      .min(1, "la descrizione è obbligatoria")
      .min(10, "la descrizione deve essere minimo 10 caratteri")
      .max(350, "La descrizione può essere massimo 350 caratteri"),
  });
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });
  const [groupImage, setGroupImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isParticipantsAdd, setIsParticipantsAdd] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    const ext = file.type.split("/")[1];
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setImageError({
        message: `Accettiamo solo ${ACCEPTED_EXTENSIONS.join(", ")}`,
      });
      event.target.value = null;
    }
    const newImage = { ...file, url: URL.createObjectURL(file) };
    setGroupImage(newImage);
  };
  const handleButtonClick = useCallback(() => {
    console.log("cliccato");
    fileInputRef.current.click();
  }, []);

  const handleParticipantsAdd = () => {
    console.log("metto true");
    setIsParticipantsAdd(true);
  };

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
    setError,
  } = methods;
  return (
    <div className="flex flex-col gap-2">
      {/* <div className="flex flex-col gap-2 px-3 pt-4 ">
        <div className="w-full flex items-center flex-col gap-2">
          <input
            type="file"
            style={{ display: "none" }}
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {groupImage == null ? (
            <div
              className={`bg-bg-2 border-2 rounded-full border-text-2 border-dashed
                                    aspect-square minw-[80px] w-30 2xl:min-w-[150px] 2xl:w-40 flex items-center justify-center cursor-pointer 
                                    hover:bg-bg-3 transition-all duration-200 shadow-inner`}
              onClick={handleButtonClick}
              aria-label="Aggiungi Immagine"
            >
              <span
                className={`font-body font-bold text-text-2 text-4xl 2xl:text-6xl`}
              >
                +
              </span>
            </div>
          ) : (
            <div className="w-30" onClick={handleButtonClick}>
              <img
                src={groupImage.url}
                alt=""
                className="w-full h-full aspect-square rounded-full"
              />
            </div>
          )}
          <span className=" text-sm font-body text-primary font-semibold">
            Inserisci un immagine di copertina
          </span>
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
            <div className="overflow-x-auto flex flex-row gap-2">
              <div
                className={`bg-bg-2 border-2 rounded-full border-text-2 border-dashed
                                    aspect-square minw-[80px] w-16 2xl:min-w-[150px] 2xl:w-40 flex items-center justify-center cursor-pointer 
                                    hover:bg-bg-3 transition-all duration-200 shadow-inner`}
                // onClick={handleButtonClick}
                onClick={handleParticipantsAdd}
                aria-label="Aggiungi Immagine"
              >
                <span
                  className={`font-body font-bold text-text-2 text-3xl 2xl:text-6xl`}
                >
                  +
                </span>
              </div>
              {currentParticipants.map((participant) => {
                return <span>{participant.name}</span>;
              })}
            </div>
          </div>
        </div>
      </div> */}

      {isParticipantsAdd ? (
        <AddParticipantsGroup
          setIsParticipantsAdd={setIsParticipantsAdd}
          setCurrentParticipants={setCurrentParticipants}
        />
      ) : (
        // <p>true</p>
        <>
          <div className="w-full  p-2 border-b border-bg-3 items-center">
            <div className="flex flex-row gap-1 items-center">
              <div
                className="w-6 h-6"
                onClick={() => {
                  setMobileView("groups");
                }}
              >
                <ChevronLeft color={"#2463eb"} />
              </div>
              <h1 className="text-lg text-text-1 font-body font-bold">
                Crea un gruppo
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-3 pt-4 ">
            <div className="w-full flex items-center flex-col gap-2">
              <input
                type="file"
                style={{ display: "none" }}
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {groupImage == null ? (
                <div
                  className={`bg-bg-2 border-2 rounded-full border-text-2 border-dashed
                                    aspect-square minw-[80px] w-30 2xl:min-w-[150px] 2xl:w-40 flex items-center justify-center cursor-pointer 
                                    hover:bg-bg-3 transition-all duration-200 shadow-inner`}
                  onClick={handleButtonClick}
                  aria-label="Aggiungi Immagine"
                >
                  <span
                    className={`font-body font-bold text-text-2 text-4xl 2xl:text-6xl`}
                  >
                    +
                  </span>
                </div>
              ) : (
                <div className="w-30" onClick={handleButtonClick}>
                  <img
                    src={groupImage.url}
                    alt=""
                    className="w-full h-full aspect-square rounded-full"
                  />
                </div>
              )}
              <span className=" text-sm font-body text-primary font-semibold">
                Inserisci un immagine di copertina
              </span>
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
                <div className="overflow-x-auto flex flex-row gap-2">
                  <div
                    className={`bg-bg-2 border-2 rounded-full border-text-2 border-dashed
                                    aspect-square minw-[80px] w-16 2xl:min-w-[150px] 2xl:w-40 flex items-center justify-center cursor-pointer 
                                    hover:bg-bg-3 transition-all duration-200 shadow-inner`}
                    // onClick={handleButtonClick}
                    onClick={handleParticipantsAdd}
                    aria-label="Aggiungi Immagine"
                  >
                    <span
                      className={`font-body font-bold text-text-2 text-3xl 2xl:text-6xl`}
                    >
                      +
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {currentParticipants.map((participant) => {
                      return <span>{participant.nome}</span>;
                      // return <FriendCard {...participant} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* nome_gruppo, immagine_gruppo, descrizione_gruppo, partecipanti_guppo */}
    </div>
  );
};

export default CreateGroupForm;
