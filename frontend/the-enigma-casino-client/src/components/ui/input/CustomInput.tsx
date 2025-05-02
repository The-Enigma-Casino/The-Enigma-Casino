import React from "react";
import styles from "./CustomInput.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  name: string;
  id: string;
  paddingLeft?: string;
}

const customInput: React.FC<InputProps> = ({ type, name, id, paddingLeft, ...props }) => {
  return <input type={type} name={name} id={id} className={styles.customInput} style={{ paddingLeft }} {...props} />;
};

export default customInput;
