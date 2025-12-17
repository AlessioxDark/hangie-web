import React, { useState } from "react";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import ImageInput from "./ImageInput";
import { useScreen } from "@/contexts/ScreenContext";

const FormInputCollection = ({
  register,
  errors,
  imageError,
  setImageError,
  images,
  setImages,
}) => {
  const [currentStep, setCurrentStep] = useState(2);
  const { currentScreen } = useScreen();
  const renderCurrentStep = () => {
    if (currentScreen == "xs") {
      console.log(currentStep);
      switch (currentStep) {
        case 1:
          return (
            <div className="p-4 2xl:p-8 flex flex-col gap-3">
              <ImageInput
                imageError={imageError}
                setImageError={setImageError}
                images={images}
                setImages={setImages}
              />

              {/* Titolo e Descrizione */}
              <div className="flex flex-col gap-3">
                <FormInput
                  id="titolo"
                  label="Titolo Evento"
                  placeholder="Es: Mostra d'Arte Contemporanea"
                  type="text"
                  register={register}
                  error={errors.titolo}
                />
                <FormTextarea
                  id="descrizione"
                  label="Descrizione"
                  placeholder="Descrivi l'evento: cosa, chi, quando e perché."
                  register={register}
                  error={errors.descrizione}
                />
              </div>
            </div>
          );

        case 2:
          return (
            <div className="p-4 2xl:p-8 flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInput
                  id="data"
                  label="Data Evento (Data e Ora)"
                  type="datetime-local"
                  register={register}
                  error={errors.data}
                />
                <FormInput
                  id="data_scadenza"
                  label="Scadenza Iscrizione"
                  type="datetime-local"
                  register={register}
                  error={errors.data_scadenza}
                />
                <FormInput
                  id="costo"
                  label="Costo (€)"
                  placeholder="0.00"
                  type="number" // Lasciamo text per regex e input corretto
                  register={register}
                  error={errors.costo}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row gap-4">
                    <FormInput
                      id="nome_luogo"
                      label="Nome Luogo"
                      placeholder="Casa di Marco"
                      type="text"
                      register={register}
                      error={errors.nome_luogo}
                    />
                    <FormInput
                      id="indirizzo"
                      label="Indirizzo / Luogo"
                      placeholder="Via Roma, 12, 00100 Roma"
                      type="text"
                      register={register}
                      error={errors.indirizzo}
                    />
                  </div>
                  <div className="flex flex-row gap-4">
                    <FormInput
                      id="citta"
                      label="Citta / Provincia"
                      placeholder="Roma"
                      type="text"
                      register={register}
                      error={errors.citta}
                    />
                    <FormInput
                      id="cap"
                      label="CAP"
                      placeholder="00100"
                      type="text"
                      register={register}
                      error={errors.cap}
                    />
                  </div>
                </div>
              </div>
              <div
                className={`flex justify-center p-3 bg-bg-2 border-t border-bg-3`}
              >
                <button
                  type="submit" // Uso type="button" e chiamo la funzione che gestisce la validazione e l'invio
                  className={`px-4 py-3 bg-primary text-white font-bold rounded-xl 
                hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-base cursor-pointer`}
                  // disabled={isSubmitting}
                >
                  {/* {isSubmitting ? "Creazione..." : "Crea e Pubblica Evento"} */}
                  Crea e Pubblica Evento
                </button>
              </div>
            </div>
          );
        default:
          return <p>default {currentStep}</p>;
      }
    } else {
      return (
        <>
          <div className="p-4 2xl:p-8 flex flex-col gap-3">
            <ImageInput
              imageError={imageError}
              setImageError={setImageError}
              images={images}
              setImages={setImages}
            />

            {/* Titolo e Descrizione */}
            <div className="flex flex-col gap-3">
              <FormInput
                id="titolo"
                label="Titolo Evento"
                placeholder="Es: Mostra d'Arte Contemporanea"
                type="text"
                register={register}
                error={errors.titolo}
              />
              <FormTextarea
                id="descrizione"
                label="Descrizione"
                placeholder="Descrivi l'evento: cosa, chi, quando e perché."
                register={register}
                error={errors.descrizione}
              />
            </div>

            {/* Date e Costo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                id="data"
                label="Data Evento (Data e Ora)"
                type="datetime-local"
                register={register}
                error={errors.data}
              />
              <FormInput
                id="data_scadenza"
                label="Scadenza Iscrizione"
                type="datetime-local"
                register={register}
                error={errors.data_scadenza}
              />
              <FormInput
                id="costo"
                label="Costo (€)"
                placeholder="0.00"
                type="number" // Lasciamo text per regex e input corretto
                register={register}
                error={errors.costo}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="font-body text-text-1 text-xl font-medium">
                Dettagli sul Luogo
              </h1>
              <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-4">
                  <FormInput
                    id="nome_luogo"
                    label="Nome Luogo"
                    placeholder="Casa di Marco"
                    type="text"
                    register={register}
                    error={errors.nome_luogo}
                  />
                  <FormInput
                    id="indirizzo"
                    label="Indirizzo / Luogo"
                    placeholder="Via Roma, 12, 00100 Roma"
                    type="text"
                    register={register}
                    error={errors.indirizzo}
                  />
                </div>
                <div className="flex flex-row gap-4">
                  <FormInput
                    id="citta"
                    label="Citta / Provincia"
                    placeholder="Roma"
                    type="text"
                    register={register}
                    error={errors.citta}
                  />
                  <FormInput
                    id="cap"
                    label="CAP"
                    placeholder="00100"
                    type="text"
                    register={register}
                    error={errors.cap}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Indirizzo */}
          <div
            className={`flex justify-center p-4 bg-bg-2 border-t border-bg-3`}
          >
            <button
              type="submit" // Uso type="button" e chiamo la funzione che gestisce la validazione e l'invio
              className={`px-9 py-4 bg-primary text-white font-bold rounded-xl 
                hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg cursor-pointer`}
              // disabled={isSubmitting}
            >
              {/* {isSubmitting ? "Creazione..." : "Crea e Pubblica Evento"} */}
            </button>
          </div>
        </>
      );
    }
  };
  return renderCurrentStep();
};

export default FormInputCollection;
