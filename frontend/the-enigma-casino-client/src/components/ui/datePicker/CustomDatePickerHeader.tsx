import React from "react";
import styles from "./CustomDatePickerHeader.module.css";
import CustomDropdown from "./CustomDropdown";

interface Props {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}

const CustomDatePickerHeader: React.FC<Props> = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);

  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  return (
    <div className={styles.customHeader}>
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className={styles.navButton}
        type="button"
      >
        ‹
      </button>

      <CustomDropdown
        options={years}
        selected={date.getFullYear()}
        onChange={(year) => changeYear(Number(year))}
      />

      <CustomDropdown
        options={months}
        selected={months[date.getMonth()]}
        onChange={(monthLabel) => {
          const index = months.indexOf(monthLabel as string);
          if (index !== -1) changeMonth(index);
        }}
      />

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className={styles.navButton}
        type="button"
      >
        ›
      </button>
    </div>
  );
};

export default CustomDatePickerHeader;