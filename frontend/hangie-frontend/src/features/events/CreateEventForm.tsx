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
import { useSocket } from "@/contexts/SocketContext.js";

const EventSchema = z
  .object({
    titolo: z.string().min(1, "il titolo è obbligatorio"),
    descrizione: z
      .string()
      .min(1, "la descrizione è obbligatoria")
      .min(30, "la descrizione deve essere minimo 30 caratteri")
      .max(350, "La descrizione può essere massimo 350 caratteri"),
    data: z
      .string()
      .min(1, "La data dell'evento è obbligatoria")
      .pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
      .refine((date) => date > new Date(), {
        message: "La data dell'evento deve essere futura.",
      }),
    data_scadenza: z
      .string()
      .min(1, "La data di scadenza è obbligatoria")
      .pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
      .refine((date) => date > new Date(), {
        message: "La data di scadenza deve essere futura.",
      }),
    indirizzo: z.string().min(1, "l'indirizzo è obbligatorio"),
    costo: z
      .any() // Accettiamo inizialmente qualsiasi cosa (stringa vuota o numero)
      .refine((val) => val !== "" && val !== undefined && val !== null, {
        message: "Il costo è obbligatorio",
      })
      .transform((val) => Number(val)) // Convertiamo in numero
      .refine((val) => !isNaN(val), {
        message: "Deve essere un numero valido",
      })
      .refine((val) => val >= 0, {
        message: "Non può essere negativo",
      })
      .refine((val) => val === 0 || val >= 1, {
        message: "Minimo 1€ (o 0 per gratis)",
      }),
    cap: z
      .string()
      .min(5, "il cap deve essere composto da 5 cifre")
      .max(5, "il cap deve essere composto da 5 numeri"),
    citta: z.string().min(1, "La città e obbligatoria"),
    nome_luogo: z.string().min(1, "è obbligatorio dare un nome al luogo"),
  })
  // 3. REGOLA COMPOSITA: Confronta data evento e scadenza
  .refine((data) => data.data > data.data_scadenza, {
    message:
      "La data dell'evento deve essere successiva alla scadenza iscrizione.",
    path: ["data"],
  });
const CreateEventForm = () => {
  const IMAGE_LIMIT = 4;
  const { closeModal } = useModal();
  const { session } = useAuth();
  const { setCurrentChatData } = useChat();
  const { currentSocket } = useSocket();
  const [images, setImages] = useState([]);

  const methods = useForm({
    resolver: zodResolver(EventSchema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    setError,
  } = methods;
  const { currentGroup, currentGroupData } = useChat();
  const { currentScreen } = useScreen();
  const { setMobileView } = useMobileLayoutChat();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageError, setImageError] = useState(false); // Stato per l'errore
  const sendEvent = (event_id, event_details, message_details) => {
    currentSocket.emit(
      "send_event",
      event_id,
      currentGroup,
      session.access_token,
      event_details,
      message_details
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
    if (checkImagesError()) return;
    try {
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
      const result = await response.json();

      if (!response.ok)
        throw new Error(result.error || "Errore creazione evento");

      const newEventId = result.event_id;

      const uploadPromises = images.map(async (img) => {
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

      const newEventDetails = { ...result.event_details, cover_img: cover_url };
      const messageDetails = result.messageDetails;
      sendEvent(newEventId, newEventDetails, messageDetails);

      setMobileView("chat");
    } catch (error) {
      setImageError({ message: error.message || "Qualcosa è andato storto" });
    }
  };

  const checkImagesError = () => {
    if (images.length == 0) {
      setImageError({
        message: "inserisci almeno un'immagine",
      });
      return true;
    }
    if (images.length > IMAGE_LIMIT) {
      setImageError({
        message: `Puoi inserire massimo ${IMAGE_LIMIT} immagini`,
      });
      return true;
    }
    setImageError(false);
    return false;
  };

  const handleNextStepMobile = async () => {
    const fieldsByStep = {
      1: ["titolo", "descrizione"],
      2: ["data", "data_scadenza", "costo"],
    };
    if (currentStep == 1) {
      const imageErr = checkImagesError();

      if (imageErr) return;
    }
    const result = await trigger(fieldsByStep[currentStep]);
    if (result) {
      setCurrentStep((lastStep) => lastStep + 1);
    }
  };
  const handleLastStepMobile = () => {
    if (currentStep >= 2) {
      setCurrentStep((lastStep) => lastStep - 1);
    } else {
      setMobileView("chat");
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
        <div className={`2xl:px-8 2xl:pt-8 p-2 2xl:pb-4 border-b border-bg-3`}>
          <div className="flex justify-between items-center">
            <div className="flex flex-row gap-1 items-center">
              {currentScreen == "xs" && (
                <div className="w-6 h-6" onClick={handleLastStepMobile}>
                  <ChevronLeft color="#64748b" />
                </div>
              )}
              <h1
                className={`text-text-1 font-body font-bold text-lg 2xl:text-4xl`}
              >
                Crea Evento
              </h1>
            </div>
            {currentScreen !== "xs" && (
              <button
                type="button"
                className={`text-text-2 cursor-pointer transition-colors 2xl:p-1 rounded-full hover:bg-bg-3`}
                onClick={closeModal}
                aria-label="Chiudi Modale"
              >
                <X width={25} height={25} />
              </button>
            )}
          </div>
        </div>

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
        {currentScreen == "xs" && (
          <div
            className="fixed bottom-5 right-5 flex items-center justify-center  font-body text-xs text-primary bg-primary p-3 rounded-full"
            onClick={handleNextStepMobile}
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
            type="submit"
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
