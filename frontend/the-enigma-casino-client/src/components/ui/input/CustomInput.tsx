import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  name: string;
  id: string;
  paddingLeft?: string;
  showToggle?: boolean;
}

const CustomInput: React.FC<InputProps> = ({
  type,
  name,
  id,
  showToggle = false,
  paddingLeft,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const finalType =
    isPasswordType && showToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full max-w-[380px]">
      <input
        type={finalType}
        name={name}
        id={id}
        className="w-full max-w-[380px] h-[60px] bg-white text-black rounded-[20px] border border-black box-border placeholder-light-grey-color focus:outline-none focus:border-grey-color
             pl-10 text-[1.5rem] 
             max-md:pl-5 max-md:text-[1.2rem] 
             max-sm:h-[50px] max-sm:text-[1rem] max-sm:pl-4"
        {...props}
      />

      {isPasswordType && showToggle && (
        <span
          className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          <img
            src={
              showPassword ? "/svg/visibility_off.svg" : "/svg/visibility.svg"
            }
            alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="w-[22px] h-[22px]"
          />
        </span>
      )}
    </div>
  );
};

export default CustomInput;
