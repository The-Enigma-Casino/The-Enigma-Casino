import React from "react";
import classes from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: string;
  color?: string;
  font?: string;
  disabled?: boolean;
  selectedPayment?: boolean;
  selectedCard?: boolean;
}

/**
 * Button Component
 *
 * Este componente renderiza un botón personalizado, permitiendo diferentes variantes.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Contenido del botón.
 * @param {string} [props.variant] - Variante del botón (ej: "small", "large").
 * @param {string} [props.color] - Color del botón (ej: "green", "red").
 * @param {string} [props.font] - Tamaño del botón (ej: "medium", "large").
 *
 * @example
 * <Button variant="small" color="green" font="medium" onClick={() => alert("Hola")}>
 *   Soy un botón
 * </Button>
 *
 * @returns {JSX.Element} Componente `<Button />`.
 */

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  color,
  font,
  className,
  disabled,
  selectedPayment,
  selectedCard,
  ...props
}) => {
  // Lógica de clases dinámicas dependiendo de la selección
  const buttonClasses = `${classes[variant || "default"]}
      ${classes[color || "default"]}
      ${classes[font || "default"]}
      ${selectedPayment && selectedCard ? classes.selected : ""}
      ${disabled ? classes.disabled : ""}
      ${className || ""}`.trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled || !(selectedPayment && selectedCard)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
