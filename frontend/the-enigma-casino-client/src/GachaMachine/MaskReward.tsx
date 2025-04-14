import { FC } from "react";
import styles from "./GachaponMachine.module.css";

interface MaskRewardProps {
  isVisible: boolean;
  onClick: () => void;
  color: string;
  winner: string;
}

const MaskReward: FC<MaskRewardProps> = ({ isVisible, onClick, color, winner }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.mask} onClick={onClick}>
      <div className={styles.winner}>{winner}</div>
      <svg viewBox="0 0 439 215" xmlns="http://www.w3.org/2000/svg" width="200">
        <path
          d="M295.5 14.0103C400.3 15.2103 429.167 117.51 430.5 168.51C338.1 208.51 207.667 185.177 154 168.51C157.5 116.51 190.7 12.8103 295.5 14.0103Z"
          fill="white"
          stroke="#531028"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M99.1013 198.787C-10.8987 165.987 1.26801 68.7865 21.1013 24.2865C152.701 -28.5135 247.268 59.6199 278.101 110.287C264.268 153.453 209.101 231.587 99.1013 198.787Z"
          fill={color}
        />
        <path
          d="M21.1013 24.2865C1.26801 68.7865 -10.8987 165.987 99.1013 198.787C209.101 231.587 264.268 153.453 278.101 110.287M21.1013 24.2865C152.701 -28.5135 247.268 59.6199 278.101 110.287M21.1013 24.2865C44.6013 69.2865 128.901 149.487 278.101 110.287"
          stroke="#531028"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default MaskReward;