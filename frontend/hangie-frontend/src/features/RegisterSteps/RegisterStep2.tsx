import { FormProvider, useForm, useFormContext } from "react-hook-form";

import React, { useState } from "react";
import FormInput from "../CreateEventForm/FormInput";
import { Eye, EyeOff } from "lucide-react";

const RegisterStep2 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div>
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
          <div className="w-full flex flex-col gap-1">
            <label
              htmlFor={"password"}
              className={`font-body text-text-1 text-sm 2xl:text-base font-medium`}
            >
              Password <span className="text-red-500 text-sm">*</span>
            </label>
            <div
              className={`w-full flex items-center
		                         bg-bg-1 rounded-xl
		                         transition-all duration-200
		                         ${
                               errors?.password
                                 ? "border-red-500 border-2"
                                 : "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary border-gray-200 ring-2 ring-gray-200"
                             }
		                         shadow-inner-sm p-0.5`}
            >
              <input
                id={"password"}
                type={isPasswordVisible ? "text" : "password"}
                placeholder={"Password"}
                className={`w-full font-body text-sm 2xl:text-base 2xl:py-3 py-2.5
               rounded-r-xl outline-none appearance-none bg-transparent
		           text-text-1 placeholder-text-3 2xl:px-3 px-2.5
		                             
		                             `}
                // Uso corretto della funzione register
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
          </div>
        </div>

        {errors.password && (
          <span className="px-1.5 text-sm  font-body text-red-500  ">
            {errors.password.message}
          </span>
        )}
      </div>
      <div>
        <div className="w-full flex flex-col gap-1">
          <label
            htmlFor={"confermaPassword"}
            className={`font-body text-text-1 text-sm 2xl:text-base font-medium`}
          >
            Conferma Password <span className="text-red-500 text-sm">*</span>
          </label>
          <div className="relative flex items-center justify-end">
            <div
              className={`w-full flex items-center
		                         bg-bg-1 rounded-xl
		                         transition-all duration-200
		                         ${
                               errors?.password
                                 ? "border-red-500 border-2"
                                 : "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary border-gray-200 ring-2 ring-gray-200"
                             }
		                         shadow-inner-sm p-0.5`}
            >
              <input
                id={"confermaPassword"}
                type={isPasswordVisible ? "text" : "password"}
                placeholder={"Conferma Password"}
                className={`w-full font-body text-sm 2xl:text-base 2xl:py-3 py-2.5
               rounded-r-xl outline-none appearance-none bg-transparent
		           text-text-1 placeholder-text-3 2xl:px-3 px-2.5
		                             
		                             `}
                // Uso corretto della funzione register
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
          </div>
        </div>

        {errors.confermaPassword && (
          <span className="px-1.5 text-sm font-body text-red-500 ">
            {errors.confermaPassword.message}
          </span>
        )}
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

        {errors.root && (
          <span className="px-1.5 text-sm font-body text-red-500 ">
            {errors.root.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default RegisterStep2;
