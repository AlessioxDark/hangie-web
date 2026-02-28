import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import FormInput from "../CreateEventForm/FormInput";
const RegisterStep1 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-5 w-full h-full">
      <div className="flex flex-col gap-2 2xl:gap-4 w-full">
        <div>
          <FormInput
            error={errors.nomeCompleto}
            label={"Nome Completo"}
            placeholder={"Nome Completo"}
            register={register}
            id={"nomeCompleto"}
            type={"text"}
          />
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
        </div>
      </div>
    </div>
  );
};

export default RegisterStep1;
