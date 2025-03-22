import React from "react";
import styles from "./CustomInput.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  name: string;
  id: string;
}

const customInput: React.FC<InputProps> = ({ type, name, id, ...props }) => {
  return <input type={type} name={name} id={id} className={styles.customInput} {...props} />;
};

export default customInput;
