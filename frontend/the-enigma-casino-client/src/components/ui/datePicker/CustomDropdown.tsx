import React, { useState } from "react";
import styles from "./CustomDropdown.module.css";

interface Props {
  label?: string;
  options: (string | number)[];
  selected: string | number;
  onChange: (value: string | number) => void;
}

const CustomDropdown: React.FC<Props> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string | number) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {selected} {label && <span className={styles.label}>{label}</span>}
      </button>

      {open && (
        <div className={styles.menu}>
          {options.map((option, index) => (
            <div
              key={index}
              className={`${styles.option} ${option === selected ? styles.selected : ""}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;