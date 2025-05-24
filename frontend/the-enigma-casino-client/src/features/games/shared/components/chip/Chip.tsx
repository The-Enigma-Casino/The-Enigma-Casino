import React from "react";

interface ChipProps {
  value: number | string;
  size?: "xsmall" | "small" | "medium" | "large";
  color?: "red" | "blue" | "green" | "orange" | "yellow";
  mode?: "static" | "button";
  onClick?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  red: "var(--Color-Cancel)",
  blue: "var(--Color-Edit)",
  green: "var(--Chip-Green)",
  orange: "var(--Chip-Orange)",
  yellow: "var(--Chip-Yellow)",
};


const SIZE_MAP: Record<string, number> = {
  small: 40,
  medium: 56,
  large: 72,
  xsmall: 30,
};

export const Chip: React.FC<ChipProps> = ({
  value,
  size = "medium",
  color = "red",
  mode = "static",
  onClick,
}) => {
  const pixelSize = SIZE_MAP[size] || 56;
  const radius = 50;
  const segmentCount = 12;
  const segmentAngle = 360 / segmentCount;

  const baseColor = COLOR_MAP[color] || "#b91c1c";

  const chipSVG = (
    <svg
      viewBox="0 0 100 100"
      width={pixelSize}
      height={pixelSize}
      className={`transition-transform duration-150 ${
        mode === "button" ? "hover:scale-105 cursor-pointer" : ""
      }`}
    >
      <circle cx={radius} cy={radius} r={radius - 1} fill={baseColor} />
      {[...Array(segmentCount)].map((_, i) => {
        const angle = i * segmentAngle;
        const rad = (angle * Math.PI) / 180;
        const x = radius + Math.cos(rad) * 40;
        const y = radius + Math.sin(rad) * 40;
        return (
          <rect
            key={i}
            x={x - 4}
            y={y - 6}
            width="8"
            height="12"
            rx="1"
            ry="1"
            fill="white"
            transform={`rotate(${angle} ${x} ${y})`}
          />
        );
      })}
      <circle cx={radius} cy={radius} r={32} fill={baseColor} />
      <circle
        cx={radius}
        cy={radius}
        r={28}
        fill={baseColor}
        style={{ filter: "brightness(0.7)" }}
        stroke="white"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text
        x={radius}
        y={radius + 7}
        textAnchor="middle"
        fontSize="22"
        fill="white"
        fontFamily="Helvetica"
        fontWeight="bold"
      >
        {value}
      </text>
    </svg>
  );

  if (mode === "button") {
    return (
      <button
        onClick={onClick}
        style={{ padding: 0, border: "none", background: "none" }}
      >
        {chipSVG}
      </button>
    );
  }

  return chipSVG;
};
