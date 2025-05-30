import React, { useState } from "react";

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
    <div className="relative inline-block w-full max-w-[380px]">
      <button
        className="w-full h-[60px] text-[1.5rem] text-black bg-white border border-gray-300 rounded-[20px] pl-10 pr-4 flex items-center justify-between 
                   max-md:text-[1.2rem] max-md:pl-5 
                   max-sm:h-[50px] max-sm:text-[1rem] max-sm:pl-4"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span>{selected}</span>
        {label && <span className="ml-2 text-sm text-gray-500">{label}</span>}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-[1001] mt-1 w-full max-h-[180px] overflow-y-auto rounded-[20px] bg-white text-black shadow-md border border-gray-300"
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={`px-6 py-3 cursor-pointer border-b border-gray-200 text-[1.5rem] 
                hover:bg-gray-100 rounded-[20px] last:border-none 
                ${option === selected ? "bg-principal font-bold text-black" : ""}`}
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
