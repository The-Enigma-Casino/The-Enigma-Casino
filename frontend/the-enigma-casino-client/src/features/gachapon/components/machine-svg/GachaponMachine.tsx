import { useState } from "react";
import styles from "./MachineComponent.module.css";
import GachaSwitchSVG from "./GachaSwitchSVG";
import RewardSVG from "./RewardSVG";
import GachaMachineSVG from "./GachaMachineSVG";
import EggSVG from "./EggSVG";


const colors = ["#E5A0B9", "#F3D478", "#9DCFE0", "#B9AED4"];

const GachaponMachine = () => {
  const [isMaskActive, setIsMaskActive] = useState(false);
  const [isSwitchActive, setIsSwitchActive] = useState(false);
  const [isEggActive, setIsEggActive] = useState(false);
  const [winner, setWinner] = useState("");
  const [lotteryList, setLotteryList] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState(colors[0]);

  const handleSwitchClick = () => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(newColor);
    setIsSwitchActive(true);

    setTimeout(() => {
      setIsSwitchActive(false);
      setIsEggActive(true);
    }, 700);
  };

  const handleEggClick = () => {
    if (lotteryList.length === 0) {
      setWinner("抽完嚕 (๑•́ ₃ •̀๑)");
    } else {
      const luckyNum = Math.floor(Math.random() * lotteryList.length);
      const selectedWinner = lotteryList[luckyNum];
      setWinner(selectedWinner);
      setLotteryList((prev) => prev.filter((_, i) => i !== luckyNum));
    }

    setIsEggActive(false);
    setIsMaskActive(true);
  };

  const handleMaskClick = () => {
    setIsMaskActive(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.mask} ${isMaskActive ? styles.active : ""}`}
        onClick={handleMaskClick}
      >
        <div className={styles.winner}>{winner}</div>
        <RewardSVG color={currentColor} />
      </div>

      <div className={styles.gachapon}>
        <GachaSwitchSVG
          isActive={isSwitchActive}
          onClick={handleSwitchClick}
        />
        <GachaMachineSVG />
        <div
          className={`${isEggActive ? styles.active : ""}`}
          onClick={handleEggClick}
        >
          <EggSVG color={currentColor} className={styles.egg} />
        </div>
      </div>
    </div>
  );
};

export default GachaponMachine;