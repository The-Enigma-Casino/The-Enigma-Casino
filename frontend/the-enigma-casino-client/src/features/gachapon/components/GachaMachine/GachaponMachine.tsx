import { useEffect, useState } from "react";
import styles from "./GachaponMachine.module.css";
import MaskReward from "./MaskReward";
import SwitchSVG from "./GachaSwitchSVG";
import EggSVG from "./EggSVG";
import MachineSVG from "./MachineSVG";
import { useUnit } from "effector-react";
import {
  $gachaponPlayResult,
  playGachaponClicked,
  resetGachapon,
} from "../../stores/gachaponStore";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";
import { $token } from "../../../auth/store/authStore";
import toast from "react-hot-toast";

const colors = ["#74c410", "#ce2e2e", "#2457c5", "#7b3fa1", "#d65a1f"];

const GachaponMachine = () => {
  const [isMaskActive, setIsMaskActive] = useState(false);
  const [isSwitchActive, setIsSwitchActive] = useState(false);
  const [isEggActive, setIsEggActive] = useState(false);
  const [hasEggBeenClicked, setHasEggBeenClicked] = useState(false);
  const [currentColor, setCurrentColor] = useState(colors[0]);

  const token = useUnit($token);
  const coins = useUnit($coins);

  const result = useUnit($gachaponPlayResult);
  const winner = result?.benefit;
  const specialMessage = result?.specialMessage;

  useEffect(() => {
    resetGachapon();
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(randomColor);
    setIsEggActive(false);
    setIsSwitchActive(false);
    setIsMaskActive(false);
    setHasEggBeenClicked(false);
  }, [token]);

  const handleSwitchClick = () => {
    if (!token) {
      toast.error("¡Necesitas iniciar sesión para jugar!", {
        className: "text-xl font-bold p-4",
      });
      return;
    }

    loadCoins();

    if (coins < 10) {
      toast.error("¡No tienes suficientes monedas!", {
        className: "text-xl font-bold p-4",
      });
      return;
    }

    if (isSwitchActive || isEggActive || hasEggBeenClicked) return;

    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(newColor);
    setIsSwitchActive(true);

    setTimeout(() => {
      setIsSwitchActive(false);
      setIsEggActive(true);
    }, 700);
  };

  const handleEggClick = () => {
    setHasEggBeenClicked(true);
    playGachaponClicked();
  };

  const handleMaskClick = () => {
    setIsMaskActive(false);
    loadCoins();
  };

  useEffect(() => {
    if (!hasEggBeenClicked || result === null) return;
  
    const { benefit } = result;
  
    const isGold = benefit === 10000;
  
    if (isGold) {
      setTimeout(() => {
        setCurrentColor("#FFD700");
      }, 200); 
    }
  
    const delay = isGold ? 800 : 0;
  
    const timeout = setTimeout(() => {
      setIsEggActive(false);
      setIsMaskActive(true);
      setHasEggBeenClicked(false);
    }, delay);
  
    return () => clearTimeout(timeout);
  }, [result, hasEggBeenClicked]);
  

  return (
    <>
      <div className={styles.container}>
        <MaskReward
          isVisible={isMaskActive}
          onClick={handleMaskClick}
          color={currentColor}
          benefit={winner}
          winner={
            specialMessage
              ? specialMessage
              : winner !== null
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
