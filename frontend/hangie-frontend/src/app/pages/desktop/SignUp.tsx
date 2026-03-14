import RegisterStep1 from "@/features/RegisterSteps/RegisterStep1";
import RegisterStep2 from "@/features/RegisterSteps/RegisterStep2";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";

import { supabase } from "../../../config/db.js";
import { useAuth } from "../../../contexts/AuthContext.js";
import { ApiCalls } from "@/services/api.js";
import { useApi } from "@/contexts/ApiContext.js";
import { useProfile } from "@/contexts/ProfileContext.js";
import RenderLoadingState from "@/features/utils/RenderLoadingState.js";

const steps = [
  {
    id: "step 1",
    fields: ["nomeCompleto", "username"],
  },
  {
    id: "step 2",
    fields: ["password", "email", "confermaPassword", "tos"],
  },
];
const SignUp = () => {
  const { signUpNewUser, session } = useAuth();
  const { executeApiCall, loading } = useApi();
  const { setDefaultHandle } = useProfile();
  const schema = z.object({
    // Definizione dei campi
    nomeCompleto: z.string().min(1, "Il nome completo è obbligatorio"),
    username: z
      .string()
      .min(1, "L'username è obbligatorio")
      .min(3, "L'username deve avere almeno 3 caratteri")
      .max(24, "L'username può essere lungo massimo 24 caratteri")
      .regex(
        /^[A-Za-z0-9_.]+$/,
        "L'username può contenere solo lettere, numeri, punti e underscore.",
      ),
    email: z.string().min(1, "email is required").email("Email non valida"),
    password: z
      .string()
      .min(8, "La password deve contenere almeno 8 caratteri")
      .regex(/(?:[^`!@#$%^&*\-_=+'\/.,]*[`!@#$%^&*\-_=+'\/.,]){2}/, {
        message: "La password deve contenere almeno 2 caratteri speciali",
      })
      .regex(/\d/, {
        message: "La password deve contenere almeno un numero",
      }),

    confermaPassword: z.string().min(1, "Conferma password obbligatoria"),
    tos: z.boolean().refine((val) => val === true, {
      message: "Devi accettare i termini e le condizioni",
    }),
  });
  type FormFields = z.infer<typeof schema>;
  const methods = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
    getValues,
    setError,
    clearErrors,
    watch,
  } = methods;

  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const finalData = data;

    const { data: datiUsername, error: erroreUsername } = await supabase
      .from("utenti")
      .select("handle")
      .eq("handle", finalData.username);

    if (erroreUsername) {
      setError("root", { message: "Errore durante la ricerca per username:" });
      return;
    }
    if (datiUsername.length > 0) {
      setError("root", { message: "L'username è già in uso." });
      return;
    }
    try {
      executeApiCall(
        "auth",
        async () => {
          const { authData, authError } = await signUpNewUser({
            email: finalData.email,
            password: finalData.password,
          });

          if (authError) throw authError;
          if (!authData?.session) throw new Error("Errore creazione sessione");

          await ApiCalls.signUp(authData.session.access_token, finalData);

          return authData;
        },
        (authData) => {
          setDefaultHandle(finalData.username);
          navigate("/");
        },
      );
    } catch (error) {
      setError("root", { message: error });
    }
  };
  useEffect(() => {
    if (errors?.auth) setError("root", { message: `${errors?.auth}` });
  }, [errors?.auth]);
  const handleStepChange = () => {
    switch (currentStep) {
      case 0:
        return <RegisterStep1 />;
      case 1:
        return <RegisterStep2 />;
    }
  };
  const validateCustomRules = async () => {
    // Clear previous errors
    clearErrors(["confermaPassword"]);

    if (currentStep === 1) {
      const { password, confermaPassword } = getValues();
      if (password && confermaPassword && password !== confermaPassword) {
        setError("confermaPassword", {
          message: "Le password non corrispondono",
        });
        return false;
      }
    }

    return true;
  };
  type FieldName = keyof FormFields;
  const next = async () => {
    const { fields } = steps[currentStep];
    const output = await trigger(fields as FieldName[], { shouldFocus: true });
    if (!output) return;

    const customValidationPassed = await validateCustomRules();
    if (!customValidationPassed) return;

    if (currentStep < 1) {
      setCurrentStep((lastStep) => lastStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      next();
    }
  };
  if (loading?.auth) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <RenderLoadingState type={"auth"} />
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full 2xl:p-5 flex justify-center items-center flex-col relative bg-white">
      <div className="w-full h-max 2xl:w-3/10 flex flex-col items-center gap-8 bg-white p-8 pt-4 2xl:pt-8">
        <h1 className="font-bold font-title text-center text-4xl text-black">
          Registrati
        </h1>

        <div className="flex flex-col gap-2 2xl:gap-6 w-full">
          <FormProvider {...methods}>
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-8 2xl:gap-6 w-full"
            >
              <div className="flex w-full flex-col items-center">
                <div className="flex items-center justify-between w-full relative">
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-full px-8">
                    <div className="h-1 rounded-full transition-all duration-300 bg-[#e5e7eb]">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-primary"
                        style={{
                          width: `${currentStep * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {[1, 2].map((step) => {
                    const isCompleted = step < currentStep + 1;
                    const isActive = step === currentStep + 1;
                    return (
                      <div key={step} className="relative z-10">
                        <div
                          className={`rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg transition-all duration-300 font-title ${
                            isActive ? "ring-4 ring-blue-100" : ""
                          } ${
                            isCompleted
                              ? "bg-primary"
                              : isActive
                                ? "bg-primary"
                                : "bg-[#e5e7eb]"
                          }
	                      ${
                          isCompleted || isActive
                            ? "text-white"
                            : "text-[#6b7280]"
                        }
	                    `}
                        >
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {handleStepChange()}

                <div className="w-full text-center text-[#6b7280]">
                  <span className="font-body">
                    Hai già un account?{" "}
                    <Link
                      to="/login"
                      className="font-body font-semibold hover:underline transition-colors duration-200 text-primary"
                    >
                      Accedi qui
                    </Link>
                  </span>
                </div>
              </div>

              <div className="w-full flex justify-center gap-4">
                {currentStep > 0 && (
                  <button
                    type="button"
                    className="px-8 py-3 font-title font-bold rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 bg-transparent border-primary text-primary hover:bg-[#f1f5f9]"
                    onClick={() => {
                      setCurrentStep((lastStep) => lastStep - 1);
                    }}
                  >
                    <span className="text-lg">Indietro</span>
                  </button>
                )}

                <button
                  type="button"
                  className={`px-8 py-3 font-title font-bold rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
									${
                    currentStep === 1
                      ? "bg-primary hover:bg-primary/80"
                      : "bg-primary hover:bg-primary/80"
                  }
									text-white`}
                  onClick={next}
                  disabled={isSubmitting}
                >
                  <span className="text-lg">
                    {currentStep !== 1
                      ? "Continua"
                      : isSubmitting
                        ? "Invio in corso..."
                        : "Registrati"}
                  </span>
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
