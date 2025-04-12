import { FC } from "react";

interface EggSVGProps {
  color: string;
  className?: string;
}

const EggSVG: FC<EggSVGProps> = ({ color, className }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    width="80"
    height="80"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50"
      cy="50"
      r="40"
      fill={color}
      stroke="#57172F"
      strokeWidth="10"
    />
    <path
      d="M60 85 C30 90, 20 60, 18 50 C45 55, 70 40, 76 30 C80 45, 82 78, 60 85 Z"
      fill="white"
      stroke="#531028"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EggSVG;