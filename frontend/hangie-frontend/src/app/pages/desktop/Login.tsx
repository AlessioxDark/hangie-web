import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { email, z } from "zod";

import { supabase } from "../../../config/db.js";
import { useAuth } from "../../../contexts/AuthContext.js";
import { useApi } from "@/contexts/ApiContext.js";
import { ApiCalls } from "@/services/api.js";
import { useProfile } from "@/contexts/ProfileContext.js";
import { useFriends } from "@/contexts/FriendsContext.js";
import { useChat } from "@/contexts/ChatContext.js";

const Login = () => {
  const { LoginUser, handleGuestSignIn } = useAuth();
  const { executeApiCall } = useApi();
  const { setProfileData } = useProfile();
  const { getFriendsData } = useFriends();
  const { fetchGroups } = useChat();
  const schema = z.object({
    user_email: z.string().min(1, "il campo è obbligatorio"),
    password: z.string().min(1, "la password è obbligatoria"),
    remember: z.boolean().optional(),
  });
  type FormFields = z.infer<typeof schema>;
  const methods = useForm({
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
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const { user_email, password, remember } = data;
      let realEmail = user_email;
      if (!realEmail.includes("@")) {
        const {
          data: { email: emailFound },
        } = await supabase
          .from("utenti")
          .select("email")
          .eq("handle", user_email)
          .single();
        realEmail = emailFound;
      }

      const { authError } = await LoginUser(realEmail, password, remember);
      if (authError) {
        setError("root", { message: "Credenziali non corrette" });
        return;
      }
      setProfileData({ is_guest: false });
      if (!authError) {
        await getFriendsData();
        await fetchGroups();
      }

      navigate("/");
    } catch (error) {
      setError("root", { message: `errore ${error} ` });
    }
  };
  const onsGuestSignIn: SubmitHandler<FormFields> = async () => {
    try {
      console.log("provo a anonymous");
      const { authError } = await handleGuestSignIn();
      console.log("errore", authError);
      if (authError) throw authError;
      setProfileData({ is_guest: true });
      navigate("/");
    } catch (error) {
      setError("root", { message: `errore ${error} ` });
    }
  };

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <div className=" h-screen w-full 2xl:p-5 flex justify-center items-center flex-col relative bg-bg-2">
      <div className="w-full h-full 2xl:w-3/10 flex flex-col items-center gap-8 rounded-lg shadow-lg bg-white p-8 py-8 pb-8">
        <h1 className="font-bold font-title text-center text-4xl text-black">
          Accedi
        </h1>

        <div className="flex flex-col gap-4 2xl:gap-6 w-full">
          <form className="flex flex-col gap-3 2xl:gap-6 w-full">
            <div className="flex flex-col gap-5 w-full">
              <h2 className="text-2xl font-semibold text-center font-body">
                Inserisci le generalità
              </h2>
              <div className="flex flex-col gap-2 2xl:gap-4 w-full">
                <div>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
                    placeholder="Email o Username"
                    {...register("user_email")}
                  />
                  {errors.user_email && (
                    <span className="px-1.5 text-sm font-semibold font-body text-error ">
                      {errors.user_email.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col ">
                  <div className="relative flex items-center">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
                      placeholder="Password"
                      {...register("password")}
                    />
                    <span
                      className="absolute right-3"
                      onClick={() =>
                        setIsPasswordVisible((lastVisible) => !lastVisible)
                      }
                    >
                      {isPasswordVisible ? <Eye /> : <EyeOff />}
                    </span>
                  </div>

                  {errors.password && (
                    <span className="mt-1 px-1.5 text-sm font-semibold font-body text-error ">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="px-1.5">
                  <div className="w-full flex items-center  gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4  bg-gray-100 rounded border-gray-300   accent-primary"
                      {...register("remember")}
                    />
                    <label
                      htmlFor="remember"
                      className="font-body text-sm text-[#6b7280]"
                    >
                      Ricordati
                    </label>
                  </div>

                  {errors.root && (
                    <span className="text-sm font-semibold font-body text-error ">
                      {errors.root.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full text-center text-[#6b7280]">
              <span className="font-body">
                Sei nuovo qui?{" "}
                <Link
                  to="/signup"
                  className="font-body font-semibold hover:underline transition-colors duration-200 text-primary"
                >
                  Crea un account
                </Link>
              </span>
            </div>

            <div className="space-y-3 pt-2 flex flex-col justify-center">
              <button
                type="button"
                className={`px-8 py-3 font-title rounded-2xl font-bold  cursor-pointer transition-all duration-200 ease-in-out 
                  
											bg-primary hover:bg-primary/80
											
									
                  text-white`}
                onClick={() => {
                  handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
              >
                <span className="text-lg">
                  {isSubmitting ? "Invio in corso..." : "Accedi"}
                </span>
              </button>

              <div className="flex items-center gap-4 my-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-body font-black uppercase tracking-widest text-text-3">
                  oppure
                </span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={onsGuestSignIn}
                className="w-full py-3.5 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <UserCircle size={18} className="text-slate-400" />
                Continua come ospite
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
