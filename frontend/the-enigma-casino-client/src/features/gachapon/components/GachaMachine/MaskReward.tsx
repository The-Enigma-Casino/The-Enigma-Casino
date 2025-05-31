import { FC } from "react";

interface MaskRewardProps {
  isVisible: boolean;
  onClick: () => void;
  color: string;
  winner: string;
  benefit?: number | null;
}

const MaskReward: FC<MaskRewardProps> = ({
  isVisible,
  onClick,
  color,
  winner,
  benefit,
}) => {
  if (!isVisible) return null;
  const isSpecial = benefit === 10000;

  const wrapperStyle = `fixed inset-0 z-50 bg-[rgba(138,139,140,0.8)] flex flex-col justify-center items-center animate-fadeIn`;

  const baseWinnerStyle =
    "w-auto max-w-[95vw] sm:max-w-[650px] md:max-w-[800px] lg:max-w-[900px] min-w-[280px] px-6 sm:px-10 py-6 sm:py-8 mb-16 text-xl sm:text-3xl md:text-4xl text-center leading-snug font-[Reddit Sans] rounded-2xl flex justify-center items-center break-words text-balance transition-all duration-500 ease-in-out";


  const normalStyle =
    "bg-white text-[var(--Black-color)] border-[3px] border-[#74c410] shadow-md shadow-[#74c41040]";
  const specialStyle =
    "bg-white text-[var(--Black-color)] font-bold border-[3px] border-[var(--Coins)] shadow-[0_0_6px_var(--Coins),0_0_12px_var(--Coins),0_0_20px_#fff273] animate-glow-soft";

  return (
    <div className={wrapperStyle} onClick={onClick}>
      <div className={`${baseWinnerStyle} ${isSpecial ? specialStyle : normalStyle}`}>
        {winner}
      </div>
      <svg
        viewBox="0 0 439 215"
        xmlns="http://www.w3.org/2000/svg"
        width="180"
        className={color === "#FFD700" ? "filter drop-shadow-[0_0_8px_#FFD700] drop-shadow-[0_0_15px_#ffeb3b]" : ""}
      >
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
          fill="none"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};


export default MaskReward;
