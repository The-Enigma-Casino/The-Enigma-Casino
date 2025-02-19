import React from "react";
import "./Input.module.css";
interface InputProps {
    type: string,
    name: string,
    id: string,
    placeholder?: string,
}

const Input: React.FC<InputProps> = ({ type, name, id, placeholder }) => {
    return (
        <input
            type={type}
            name={name}
            id={id}
            placeholder={placeholder}
            className="input"
        />
    );
};

export default Input;