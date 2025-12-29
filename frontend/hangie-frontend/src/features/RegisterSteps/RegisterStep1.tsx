import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import FormInput from "../CreateEventForm/FormInput";
const RegisterStep1 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 className="text-2xl font-semibold text-center font-title">
        Inserisci le generalità
      </h2>
      <div className="flex flex-col gap-2 2xl:gap-4 w-full">
        <div>
          {/* <input
            type="text"
            className="w-full p-2 2xl:p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
            placeholder="Nome Completo"
            {...register("nomeCompleto")}
          />
          {errors.nomeCompleto && (
            <span className="px-1.5 text-sm font-semibold font-body text-error ">
              {errors.nomeCompleto.message}
            </span>
          )} */}
          <FormInput
            error={errors.nomeCompleto}
            label={"Nome Completo"}
            placeholder={"Nome Completo"}
            register={register}
            id={"nomeCompleto"}
            type={"text"}
          />

          {/* <FormInput
            error={errors.nomeCompleto}
            label={"Nome Completo"}
            placeholder={"Nome Completo"}
            register={register}
            id={"nomeCompleto"}
            type={"text"}
          />
          <FormInput
            error={errors.nomeCompleto}
            label={"Nome Completo"}
            placeholder={"Nome Completo"}
            register={register}
            id={"nomeCompleto"}
            type={"text"}
          />
          <FormInput
            error={errors.nomeCompleto}
            label={"Nome Completo"}
            placeholder={"Nome Completo"}
            register={register}
            id={"nomeCompleto"}
            type={"text"}
          /> */}
        </div>
        <div>
          <FormInput
            error={errors.username}
            label={"Username"}
            placeholder={"Username"}
            register={register}
            id={"username"}
            type={"text"}
          />
          {/* <input
            type="text"
            className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
            placeholder="Username"
            {...register("username")}
          />
          {errors.username && (
            <span className="px-1.5 text-sm font-semibold font-body text-error ">
              {errors.username.message}
            </span>
          )} */}
        </div>
        <div>
          {/* <input
            type="email"
            className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
            placeholder="Email"
            {...register("email")}
          />
          {errors.email && (
            <span className="px-1.5 text-sm font-semibold font-body text-error ">
              {errors.email.message}
            </span>
          )} */}
          <FormInput
            error={errors.email}
            label={"Email"}
            placeholder={"Email"}
            register={register}
            id={"email"}
            type={"email"}
          />
        </div>
        <div>
          <div className="relative flex items-center justify-end">
            <input
              type={isPasswordVisible ? "text" : "password"}
              className="w-full p-2.5 2xl:p-3  font-body rounded-lg ring ring-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md text-sm 2xl:text-base
			  text-text-1
																	placeholder-text-3
		                        
		                             
		                              "
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
            <span className="px-1.5 text-sm font-semibold font-body text-error ">
              {errors.password.message}
            </span>
          )}
        </div>
        <div>
          <div className="relative flex items-center justify-end">
            <input
              type={isPasswordVisible ? "text" : "password"}
              className="w-full p-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-sm hover:shadow-md"
              placeholder="Conferma Password"
              {...register("confermaPassword")}
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

          {errors.confermaPassword && (
            <span className="px-1.5 text-sm font-semibold font-body text-error ">
              {errors.confermaPassword.message}
            </span>
          )}
        </div>
      </div>
      <div className="px-1.5">
        <div className="w-full flex items-center  gap-2">
          <input
            type="checkbox"
            id="tos"
            className="w-4 h-4  bg-gray-100 rounded border-gray-300   accent-primary"
            {...register("tos")}
          />
          <label htmlFor="tos" className="font-body text-sm text-[#6b7280]">
            Accetta i termini e le condizioni
          </label>
        </div>
        {errors.tos && (
          <span className="text-sm font-semibold font-body text-error ">
            {errors.tos.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default RegisterStep1;
