import React from "react";
import "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  name: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ type, name, id, ...props }) => {
  return <input type={type} name={name} id={id} className="input" {...props} />;
};

export default Input;
