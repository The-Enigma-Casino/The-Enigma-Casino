import React from "react";
import styles from "./Checkbox.module.css";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ labelText, checked, onChange, ...props }) => {
  return (
    <div className={styles.checkboxContainer}>
      <input
        type="checkbox"
        id="checkbox"
        checked={checked} 
        onChange={onChange} 
        className={styles.checkbox}
        {...props}
      />
      <label htmlFor="checkbox" className={styles.checkboxLabel}>
        {labelText}
      </label>
    </div>
  );
};

export default Checkbox;
