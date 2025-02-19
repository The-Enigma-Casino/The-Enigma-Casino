import React, { useState } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
    labelText: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ labelText }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    return (
        <div className={styles.checkboxContainer}>
            <input
                type="checkbox"
                id="checkbox"
                checked={isChecked}
                onChange={handleChange}
                className={styles.checkbox}
            />
            <label htmlFor="checkbox" className={styles.checkboxLabel}>{labelText}</label>
        </div>
    );
};

export default Checkbox;