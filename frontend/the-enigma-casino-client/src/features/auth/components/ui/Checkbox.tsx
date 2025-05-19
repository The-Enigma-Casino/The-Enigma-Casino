import React from "react";
import styles from "./Checkbox.module.css";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText: string;
  linkHref?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  labelText,
  linkHref,
  checked,
  onChange,
  ...props
}) => {
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
      {linkHref ? (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.checkboxLabel} underline hover:text-Principal transition-colors`}
        >
          {labelText}
        </a>
      ) : (
        <label htmlFor="checkbox" className={styles.checkboxLabel}>
          {labelText}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
