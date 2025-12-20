import { useChat } from "@/contexts/ChatContext.js";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

// Componente Textarea
import { supabase } from "../../config/db.js";
import FormInputCollection from "../CreateEventForm/FormInputCollection.js";
import ChevronLeft from "@/assets/icons/ChevronLeft.js";
import ChevronRight from "@/assets/icons/ChevronRight.js";
import { useScreen } from "@/contexts/ScreenContext.js";
import { useMobileLayoutChat } from "@/contexts/MobileLayoutChatContext.js";

const CreateEventForm = () => {
  const IMAGE_LIMIT = 4;
  const { closeModal } = useModal();
  const { session } = useAuth();
  const { socketRef, setCurrentChatData } = useChat();
  const [images, setImages] = useState([]);
  const schema = z
    .object({
      titolo: z.string().min(1, "il titolo è obbligatorio"),
      descrizione: z
        .string()
        .min(1, "la descrizione è obbligatoria")
        .min(30, "la descrizione deve essere minimo 30 caratteri")
        .max(350, "La descrizione può essere massimo 350 caratteri"),
      data: z
        .string()
        .min(1, "La data di iscrizione è obbligatoria")
        .pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
        .refine((date) => date > new Date(), {
          message: "La data di scadenza deve essere futura.",
        }),
      data_scadenza: z
        .string()
        .min(1, "La data di iscrizione è obbligatoria")
        .pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
        .refine((date) => date > new Date(), {
          message: "La data di scadenza deve essere futura.",
        }),
      indirizzo: z.string().min(1, "l'indirizzo è obbligatorio"),
      costo: z.number().min(0, "il costo non può essere negativo"),
      cap: z
        .string()
        .min(5, "il cap deve essere composto da 5 cifre")
        .max(5, "il cap deve essere composto da 5 numeri"),
      citta: z.string().min(1, "La città e obbligatoria"),
      nome_luogo: z.string().min(1, "è obbligatorio dare un nome al luogo"),
    })
    // 3. REGOLA COMPOSITA: Confronta data evento e scadenza
    .refine((data) => data.data < data.data_scadenza, {
      message:
        "La data dell'evento deve essere successiva alla scadenza iscrizione.",
      // Indica a React Hook Form di associare l'errore al campo 'data'
      path: ["data"],
    });
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
    setError,
  } = methods;
  const { currentGroup, currentGroupData } = useChat();
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayoutChat();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageError, setImageError] = useState(false); // Stato per l'errore
  const sendEvent = (event_id, event_details) => {
    socketRef.current.emit(
      "send_event",
      event_id,
      currentGroupData?.group_id,
      session.access_token
    );

    setCurrentChatData((prevData) => {
      return {
        ...prevData,
        messaggi: [
          ...prevData.messaggi,
          {
            group_id: currentGroupData.group_id,
            user_id: session.user.id,
            sent_at: Date.now(),
            isUser: true,
            event_id,
            event_details,
            type: "event",
          },
        ],
      };
    });
  };
  const onSubmit = async (data) => {
    console.log("session", session);
    console.log(imageError);
    console.log(images.length);
    if (images.length > IMAGE_LIMIT) {
      console.log("troppe");
      setImageError({
        message: `Puoi inserire massimo ${IMAGE_LIMIT} immagini`,
      });
    }
    if (images.length === 0) {
      setImageError({
        message: `Inserire almeno un'immagine`,
      });
      return;
    }

    if (imageError) {
      return;
    }
    try {
      // FASE 1: Creiamo l'evento nel DB (solo dati testuali)
      // Nota: Non inviamo 'images' qui
      console.log("inviato");
      const response = await fetch(
        "http://localhost:3000/api/events/add/create-event",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            data: { ...data, group_id: currentGroup }, // Niente images qui
          }),
        }
      );
      console.log("richiesta");
      const result = await response.json();

      if (!response.ok) {
        console.log("male");
        throw new Error(result.error || "Errore creazione evento");
      }
      console.log(result);
      const newEventId = result.event_id; // Assumi che l'API restituisca l'ID
      console.log("ok");
      console.log("Evento creato, ID:", newEventId);

      // FASE 2: Upload Diretto delle Immagini su Supabase Storage
      const uploadPromises = images.map(async (img, index) => {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${newEventId}/${img.name}.${fileExt}`;
        const filePath = `${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("eventi")
          .upload(filePath, img.file, {
            upsert: true,
            contentType: img.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("eventi")
          .getPublicUrl(uploadData.path);
        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      const cover_url = uploadedUrls[0];
      const { data: coverData, error: coverError } = await supabase
        .from("eventi")
        .update({ cover_img: cover_url })
        .eq("event_id", newEventId);
      if (coverError) throw coverError;
      console.log("Tutte le immagini caricate con successo!");
      const newEventDetails = { ...result.event_details, cover_img: cover_url };
      sendEvent(newEventId, newEventDetails);
      closeModal(); // Chiudi solo se tutto è andato bene
    } catch (error) {
      console.error("Errore durante il processo:", error);
      // Qui puoi gestire l'errore (es. mostrare un toast notification)
    }
  };
  return (
    <div
      className={`w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-bg-1 relative`}
    >
      <form
        className="flex flex-col h-screen"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)();
        }}
      >
        {/* Intestazione */}
        <div className={`2xl:px-8 2xl:pt-8 p-2 2xl:pb-4 border-b border-bg-3`}>
          <div className="flex justify-between items-center">
            <div className="flex flex-row gap-1 items-center">
              {currentScreen == "xs" && (
                <div
                  className="w-6 h-6"
                  onClick={() => {
                    //
                    if (currentStep >= 2) {
                      setCurrentStep((lastStep) => lastStep - 1);
                    } else {
                      setMobileView("chat");
                    }
                  }}
                >
                  <ChevronLeft color="#64748b" />
                </div>
              )}
              <h1
                className={`text-text-1 font-body font-bold text-lg 2xl:text-4xl`}
              >
                Crea Evento
              </h1>
            </div>
            <button
              type="button"
              className={`text-text-2 cursor-pointer transition-colors 2xl:p-1 rounded-full hover:bg-bg-3`}
              onClick={closeModal}
              aria-label="Chiudi Modale"
            >
              {currentScreen !== "xs" && <X width={25} height={25} />}
              {/* {currentScreen == "xs" ? (
                currentStep == 1 ? (
                  <div
                    className=" flex flex-row items-center font-body text-xs text-primary"
                    onClick={async () => {
                      // valida form
                      const result = await trigger(["titolo", "descrizione"]);
                      if (images.length == 0) {
                        setImageError({
                          message: "inserisci almeno un'immagine",
                        });
                      }
                      if (result && !imageError) {
                        setCurrentStep(2);
                      } else {
                        if (errors.titolo) {
                          setError("titolo", {
                            message: errors.titolo.message,
                          });
                        }
                        if (errors.descrizione) {
                          setError("descrizione", {
                            message: errors.descrizione.message,
                          });
                        }
                        if (imageError) {
                          setError("root", {
                            message: imageError,
                          });
                        }
                      }
                    }}
                  >
                    Avanti{" "}
                    <div className="w-6 h-6">
                      <ChevronRight color="#2463eb" />
                    </div>
                  </div>
                ) : (
                  <></>
                )
              ) : (
                <X width={25} height={25} />
              )} */}
            </button>
          </div>
        </div>

        {/* Contenuto del Form (Step 1) */}
        <div className={`${currentScreen == "xs" && "pb-32 overflow-y-auto"}`}>
          <FormInputCollection
            register={register}
            errors={errors}
            imageError={imageError}
            setImageError={setImageError}
            images={images}
            setImages={setImages}
            currentStep={currentStep}
          />
        </div>
        {/* Footer e Pulsante Crea */}
        {currentScreen == "xs" && (
          <div
            className="fixed bottom-5 right-5 flex items-center justify-center  font-body text-xs text-primary bg-primary p-3 rounded-full"
            onClick={async () => {
              //aggiustare layout form nel secondo step magari fare un terzostep e gestire meglio i vari input per rendere il tutto più uniforme
              if (currentStep == 1) {
                const result = await trigger(["titolo", "descrizione"]);
                if (images.length == 0) {
                  setImageError({
                    message: "inserisci almeno un'immagine",
                  });
                }
                if (result && !imageError) {
                  setCurrentStep((lastStep) => lastStep + 1);
                } else {
                  if (errors.titolo) {
                    setError("titolo", {
                      message: errors.titolo.message,
                    });
                  }
                  if (errors.descrizione) {
                    setError("descrizione", {
                      message: errors.descrizione.message,
                    });
                  }
                  if (imageError) {
                    setError("root", {
                      message: imageError,
                    });
                  }
                }
              }

              if (currentStep == 2) {
                const result = await trigger([
                  "data",
                  "data_scadenza",
                  "costo",
                ]);

                if (result) {
                  setCurrentStep((lastStep) => lastStep + 1);
                } else {
                  if (errors.titolo) {
                    setError("titolo", {
                      message: errors.titolo.message,
                    });
                  }
                  if (errors.descrizione) {
                    setError("descrizione", {
                      message: errors.descrizione.message,
                    });
                  }
                  if (imageError) {
                    setError("root", {
                      message: imageError,
                    });
                  }
                }
              }
            }}
          >
            {currentStep <= 2 ? (
              <div className="w-6 h-6">
                <ChevronRight color="#ffffff" />
              </div>
            ) : (
              <button type="submit" className="w-6 h-6">
                <CheckIcon color="#ffffff" />
              </button>
            )}
          </div>
        )}
      </form>
      {currentScreen !== "xs" && (
        <div className={`flex justify-center p-4 bg-bg-2 border-t border-bg-3`}>
          <button
            type="submit" // Uso type="button" e chiamo la funzione che gestisce la validazione e l'invio
            className={`px-9 py-4 bg-primary text-white font-bold rounded-xl 
                hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg cursor-pointer`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creazione..." : "Crea e Pubblica Evento"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateEventForm;
