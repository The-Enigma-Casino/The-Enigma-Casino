import React from "react";
import clsx from "clsx";

interface Props {
  isActive?: boolean;
  onClick?: () => void;
}

const GachaSwitchSVG: React.FC<Props> = ({ isActive, onClick }) => {
  return (
    <svg
      viewBox="0 0 154 155"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={clsx("transition-transform duration-300 cursor-pointer", {
        "rotate-[-90deg]": isActive,
      })}
      style={{
        width: "100%",
        height: "auto",
        transformOrigin: "center center",
      }}
    >
      <circle
        cx="76.5828"
        cy="77.7004"
        r="43.5"
        transform="rotate(-45 76.5828 77.7004)"
        fill="#C6D2D5"
        stroke="#0f0f0f"
        strokeWidth="10"
      />
      <path
        d="M32.7422 110.934C30.399 108.591 30.399 104.792 32.7422 102.449L101.732 33.4592C104.075 31.1161 107.874 31.1161 110.217 33.4592L120.117 43.3587C122.46 45.7018 122.46 49.5008 120.117 51.844L51.127 120.834C48.7838 123.177 44.9848 123.177 42.6417 120.834L32.7422 110.934Z"
        fill="#C6D2D5"
        stroke="#0f0f0f"
        strokeWidth="10"
      />
    </svg>
  );
};

export default GachaSwitchSVG;
