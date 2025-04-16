import React from "react";

interface Props {
  isActive: boolean;
  onClick: () => void;
  color: string;
}

const EggSVG: React.FC<Props> = ({ isActive, onClick, color }) => {
  return (
    <svg
      viewBox="0 0 617 979"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{
        width: "100%",
        height: "100%",
        transform: "translate(-50%, 0)",
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none",
        transition: "opacity 0.4s ease 0.5s, transform 0.4s ease 0.5s, filter 0.8s ease-in-out",
        position: "absolute",
        top: 17,
        left: "50%",
        cursor: isActive ? "pointer" : "default",
        filter: color === "#FFD700"
        ? "drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #ffeb3b)"
        : "none",
      }}
    >
      <g>
        <circle
          cx="313.5"
          cy="885.5"
          r="40.5"
          fill={color}
          stroke="#57172F"
          strokeWidth="10"
          style={{
            transition: "fill 0.8s ease-in-out",
          }}
        />
        <path
          d="M323.599 925.513C291.223 932.027 279.261 908.229 274.125 897.882C326.587 906.466 345.102 886.898 352.345 874.125C357.085 887.153 357.344 918.724 323.599 925.513Z"
          fill="white"
          stroke="#531028"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default EggSVG;
