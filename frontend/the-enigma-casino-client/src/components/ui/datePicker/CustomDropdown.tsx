import React, { useState } from "react";

interface Props {
  label?: string;
  options: (string | number)[];
  selected: string | number;
  onChange: (value: string | number) => void;
}

const CustomDropdown: React.FC<Props> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string | number) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <div className="relative inline-block w-[80px]">
      <button
        className="w-full h-[36px] px-3 text-[0.9rem] bg-[var(--Background-Nav)] text-white border border-[var(--Principal)] rounded-md cursor-pointer flex items-center justify-between"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span>{selected}</span>
        {label && (
          <span className="ml-2 text-xs text-gray-300">{label}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-[110%] left-0 z-[1001] mt-1 w-full max-h-[180px] overflow-y-auto bg-[var(--Background-Nav)] border border-[var(--Principal)] rounded-md shadow-md scrollbar-thin scrollbar-thumb-[var(--Principal)] scrollbar-track-transparent">
          {options.map((option, index) => (
            <div
              key={index}
              className={`px-3 py-1 text-[0.9rem] text-white cursor-pointer 
                ${option === selected ? "bg-[var(--Principal)] font-bold text-black" : ""}
                hover:bg-[var(--Principal)] hover:text-black`}
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
