import { FC } from "react";
import styles from "../MachineComponent.module.css";

interface GachaSwitchSVGProps {
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const GachaSwitchSVG: FC<GachaSwitchSVGProps> = ({
  isActive = false,
  onClick,
  className = "",
}) => {
  return (
    <svg
      className={`${styles.switch} ${isActive ? styles.active : ""} ${className}`}
      viewBox="0 0 154 155"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <circle
        cx="76.5828"
        cy="77.7004"
        r="43.5"
        transform="rotate(-45 76.5828 77.7004)"
        fill="#C6D2D5"
        stroke="#57162F"
        strokeWidth="10"
      />
      <path
        d="M32.7422 110.934C30.399 108.591 30.399 104.792 32.7422 102.449L101.732 33.4592C104.075 31.1161 107.874 31.1161 110.217 33.4592L120.117 43.3587C122.46 45.7018 122.46 49.5008 120.117 51.844L51.127 120.834C48.7838 123.177 44.9848 123.177 42.6417 120.834L32.7422 110.934Z"
        fill="#C6D2D5"
        stroke="#57162F"
        strokeWidth="10"
      />
    </svg>
  );
};

export default GachaSwitchSVG;