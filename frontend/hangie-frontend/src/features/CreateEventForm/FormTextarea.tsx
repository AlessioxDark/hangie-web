import React from "react";

const FormTextarea = ({ id, label, placeholder, register, error }) => {
  return (
    <div className="flex flex-col gap-1.5 2xl:gap-1 w-full">
      <label
        htmlFor={id}
        className="font-body text-text-1 text-sm 2xl:text-base font-medium"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-col gap-0.5">
        <textarea
          id={id}
          placeholder={placeholder}
          rows={4}
          className={`w-full font-body px-2 2xl:px-4 2xl:py-3 py-2 rounded-xl text-sm 2xl:text-base outline-none transition-all duration-200 resize-none min-h-[100px] max-h-[150px]
                          bg-bg-2 text-text-1
     
                          ${
                            error
                              ? "border-red-500 ring-red-300 border-2"
                              : " focus-within:border-primary  focus-within:ring-primary ring-2 ring-gray-200"
                          }`}
          {...register(id)}
        />
        {error && <p className="text-sm text-red-500 ">{error.message}</p>}
      </div>
    </div>
  );
};

export default FormTextarea;
