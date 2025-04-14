import { useEffect, useState } from "react";
import styles from "./GachaponMachine.module.css";
import MaskReward from "./MaskReward";
import SwitchSVG from "./GachaSwitchSVG";
import EggSVG from "./EggSVG";
import MachineSVG from "./MachineSVG";
import { useUnit } from "effector-react";
import {
  gachaponPlayResult$,
  playGachaponClicked,
} from "../features/gachapon/stores/gachaponStore";
import { loadCoins } from "../features/coins/store/coinsStore";

const colors = ["#74c410", "#ce2e2e", "#2457c5", "#7b3fa1", "#d65a1f"];

const GachaponMachine = () => {
  const [isMaskActive, setIsMaskActive] = useState(false);
  const [isSwitchActive, setIsSwitchActive] = useState(false);
  const [isEggActive, setIsEggActive] = useState(false);
  const [currentColor, setCurrentColor] = useState(colors[0]);

  const winner = useUnit(gachaponPlayResult$);

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
    playGachaponClicked(); 
  };

  const handleMaskClick = () => {
    setIsMaskActive(false);
    loadCoins();
  };

  useEffect(() => {
    if (isEggActive && winner !== null) {
      if (winner === 1) {
        setCurrentColor("#FFD700");
        setTimeout(() => {
          setIsEggActive(false);
          setIsMaskActive(true);
        }, 800);
      } else {
        setIsEggActive(false);
        setIsMaskActive(true);
      }
    }
  }, [winner]);
  

  console.log("Color recibido en premio:", currentColor);

  return (
    <>
      <div className={styles.container}>
        <MaskReward
          isVisible={isMaskActive}
          onClick={handleMaskClick}
          color={currentColor}
          winner={
            winner !== null
              ? `¡Ganaste ${winner} Ficha${winner === 1 ? "" : "s"}!`
              : "¡Jugando...!"
          }
        />
        <div className={styles.gachapon}>
          <div
            className={`${styles.switch} ${
              isSwitchActive ? styles.active : ""
            }`}
            onClick={handleSwitchClick}
          >
            <SwitchSVG />
          </div>
          <MachineSVG />
          <EggSVG
            isActive={isEggActive}
            onClick={handleEggClick}
            color={currentColor}
          />
        </div>
      </div>
    </>
  );
};

export default GachaponMachine;
