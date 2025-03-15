import React from "react";
import classes from "./ButtonCard.module.css";

interface ButtonCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  selectedPayment?: boolean;
  selectedCard?: boolean;
}

const ButtonCard: React.FC<ButtonCardProps> = ({
  children,
  selectedPayment,
  selectedCard,
  ...props
}) => {
  const isDisabled = !selectedPayment || !selectedCard;

  const buttonClasses = [
    classes.button,
    !isDisabled ? classes.selected : "",
    isDisabled ? classes.disabled : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} disabled={isDisabled} {...props}>
      {children}
    </button>
  );
};

export default ButtonCard;
