import React, { useState } from "react";
import styles from "./CustomInput.module.css";

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
  paddingLeft,
  showToggle = false,
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
        className={styles.customInput}
        style={{ paddingLeft }}
        {...props}
      />
      {isPasswordType && showToggle && (
        <span
          className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          <img
            src={showPassword ? "/svg/visibility_off.svg" : "/svg/visibility.svg"}
            alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="w-[22px] h-[22px]"
          />
        </span>
      )}
    </div>
  );
};

export default CustomInput;
