import RegisterStep1 from "@/features/RegisterSteps/RegisterStep1";
import RegisterStep2 from "@/features/RegisterSteps/RegisterStep2";
import RegisterStep3 from "@/features/RegisterSteps/RegisterStep3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import appleLogo from "../../../assets/Apple_logo.svg";
import facebookLogo from "../../../assets/Facebook_logo.svg";
import googleLogo from "../../../assets/Google_logo.svg";
import { supabase } from "../../../config/db.js";
import { useAuth } from "../../../contexts/AuthContext.js";
const mesiValidi = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const steps = [
  {
    id: "step 1",
    fields: [
      "nomeCompleto",
      "username",
      "tos",
      "email",
      "password",
      "confermaPassword",
    ],
  },
  {
    id: "step 2",
    fields: ["giorno", "mese", "anno"],
  },
  {
    id: "step 3",
    fields: ["preferenze"],
  },
];
const SignUp = () => {
  const { signUpNewUser, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
    giorno: z.coerce
      .number()
      .min(1, "Il giorno deve essere almeno 1")
      .max(31, "Il giorno deve essere al massimo 31"),
    mese: z.enum(mesiValidi, "Inserisci un mese"),
    anno: z.coerce
      .number()
      .min(1920, "L'anno deve essere almeno 1920")
      .max(new Date().getFullYear(), "L'anno non può essere futuro"),
    preferenze: z.array(z.string()),
  });
  type FormFields = z.infer<typeof schema>;
  const methods = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      preferenze: [],
    },
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
    console.log("inviato");
    const numeroMese = mesiValidi.indexOf(data.mese);
    const dataGiorno = new Date(data.anno, numeroMese, data.giorno);
    const { giorno, mese, anno, confermaPassword, ...datiUtili } = data;
    const finalData = { ...datiUtili, data: dataGiorno };

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
    setIsLoading(true);
    try {
      const { email, password } = finalData;
      const { authData, authError } = await signUpNewUser({ email, password });
      console.log(email, password);
      if (authError) {
        console.log(authError);
        setError("root", {
          message: `Utente già registrato`,
        });
        return;
      }
      const { user: utente } = authData;
      if (!utente) {
        setError("root", {
          message: "Registrazione non riuscita, utente non creato",
        });
        return;
      }
      // const {
      // 	data: { session },
      // 	error: erroreSession,
      // } = await supabase.auth.getSession();
      // if (erroreSession) {
      // 	setError('root', {
      // 		message: 'errore durante la creazione di una sessione',
      // 	});
      // }

      fetch("https://hangie-web.onrender.com/api/auth/register", {
        body: JSON.stringify(finalData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.session.access_token}`,
        },
        method: "POST",
      })
        .then((res) => res.json())
        .then((dati) => {
          if (!dati.success) {
            setError("root", { message: dati.error.message });
          } else {
            navigate("/");
          }
        });
    } catch (error) {
      setError("root", { message: error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = () => {
    switch (currentStep) {
      case 0:
        return <RegisterStep1 />;
      case 1:
        return <RegisterStep2 />;
      case 2:
        return <RegisterStep3 />;
    }
  };
  const validateCustomRules = async () => {
    // Clear previous errors
    clearErrors(["giorno", "confermaPassword"]);

    if (currentStep === 0) {
      const { password, confermaPassword } = getValues();
      if (password && confermaPassword && password !== confermaPassword) {
        setError("confermaPassword", {
          message: "Le password non corrispondono",
        });
        return false;
      }
    }

    if (currentStep === 1) {
      const { giorno, mese, anno } = getValues();

      if (!giorno || !mese || !anno) return true; // Let zod handle required fields

      const numeroMese = mesiValidi.indexOf(mese);
      const data = new Date(anno, numeroMese, giorno);

      // Validate date
      if (
        data.getFullYear() !== Number(anno) ||
        data.getMonth() !== numeroMese ||
        data.getDate() !== Number(giorno)
      ) {
        setError("giorno", { message: "Data non valida" });
        return false;
      }

      // Check if date is not in the future
      if (data > new Date()) {
        setError("giorno", {
          message: "La data non può essere più grande di oggi",
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

    if (currentStep < 2) {
      setCurrentStep((lastStep) => lastStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 2) {
      next();
    }
  };

  return (
    <div className="h-max w-full 2xl:p-5 flex justify-center items-center flex-col relative bg-bg-2">
      {/* 60% - Primary dominance in header */}
      {/* <div className="absolute 2xl:top-5 flex w-full 2xl:h-1/4 justify-center items-center">
        <h1 className="font-bold font-title text-center text-sm 2xl:text-3xl text-primary">
          Benvenuto ad Hangie
        </h1>
      </div> */}

      {/* 30% - Neutral base */}
      <div className="w-full h-max 2xl:w-3/10 flex flex-col items-center gap-8 rounded-lg shadow-lg bg-white p-8 pt-4 2xl:pt-8">
        <h1 className="font-bold font-title text-center text-4xl text-black">
          Registrati
        </h1>

        <div className="flex flex-col gap-2 2xl:gap-6 w-full">
          <FormProvider {...methods}>
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-2 2xl:gap-6 w-full"
            >
              {/* Progress Steps - 60% Primary */}
              <div className="flex w-full flex-col items-center">
                <div className="flex items-center justify-between w-full relative">
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-full px-8">
                    <div className="h-1 rounded-full transition-all duration-300 bg-[#e5e7eb]">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-primary"
                        style={{
                          width: `${(currentStep / 2) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {[1, 2, 3].map((step) => {
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

              {handleStepChange()}

              {/* Login Link - Primary accent */}
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

              {/* Navigation Buttons - 60% Primary dominance */}
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
                    currentStep === 2
                      ? "bg-primary hover:bg-primary/80"
                      : "bg-primary hover:bg-primary/80"
                  }
									text-white`}
                  onClick={next}
                  disabled={isSubmitting}
                >
                  <span className="text-lg">
                    {currentStep !== 2
                      ? "Continua"
                      : isSubmitting
                        ? "Invio in corso..."
                        : "Completa Registrazione"}
                  </span>
                </button>
              </div>
            </form>
          </FormProvider>
          {/* Neutral divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 h-px bg-[#e5e7eb]"></div>
            <span className="font-body text-sm px-4 text-[#6b7280]">
              oppure continua con
            </span>
            <div className="flex-1 h-px bg-[#e5e7eb]"></div>
          </div>

          {/* Social Login - subtle accents */}
          <div className="flex flex-row gap-4 items-center w-full justify-center">
            {[
              { src: googleLogo, alt: "Google" },
              { src: appleLogo, alt: "Apple" },
              { src: facebookLogo, alt: "Facebook" },
            ].map((social, index) => (
              <button
                key={index}
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out border-2 hover:shadow-md bg-white border-[#e5e7eb] hover:border-primary hover:translate-y-[-1px]"
              >
                <img
                  src={social.src}
                  alt={`${social.alt} Logo`}
                  className="w-5 h-5"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
