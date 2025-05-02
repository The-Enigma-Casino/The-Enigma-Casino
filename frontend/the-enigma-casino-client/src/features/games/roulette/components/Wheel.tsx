import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import { RouletteData } from "../../../testing/types/RouletteData.type";
import { WheelNumber } from "../../../testing/types/WheelNumber.type";

import styles from "./Wheel.module.css";

type Props = {
  rouletteData: RouletteData;
  number: WheelNumber;
  animationData?: {
    wheelRotation: number;
    ballRotation: number;
  };
};

const Wheel: React.FC<Props> = ({ rouletteData, number, animationData }) => {
  const [isRotating, setIsRotating] = useState(false);

  const spinWheel = (num: string, animation: { wheelRotation: number; ballRotation: number }) => {
    if (isRotating) return;
  
    setIsRotating(true);
  
    // Reiniciar posiciones
    gsap.set(".roulette-image", { rotation: 0 });
    gsap.set(".ball-container", {
      rotation: 0,
      y: 0,
      transformOrigin: "center 163px", // 🔥 PUNTO CLAVE
    });
    
  
    const tl = gsap.timeline({
      onComplete: () => setIsRotating(false),
    });
  
    // 🌀 Paso 1: la ruleta empieza a girar de inmediato
    tl.to([".layer-2", ".layer-4"], {
      rotation: animation.wheelRotation,
      duration: 5,
      ease: "power4.out",
    }, 0); // empieza en 0s
  
    // 🔴 Paso 2: la bola se retrasa y cae con efecto
    tl.to(".ball-container", {
      rotation: animation.ballRotation,
      duration: 5,
      ease: "power4.out",
    }, 0.4); // empieza con 0.4s de retardo
  
    // 🎾 Paso 3: efecto rebote del eje Y
    tl.to(".ball-container", {
      keyframes: [
        { y: 0, duration: 0.3 },
        { y: 20, duration: 0.3 },
        { y: 25, duration: 0.25 },
        { y: 50, duration: 0.4 },
      ],
      ease: "power2.out",
    }, 0.4); // empieza junto con el giro de la bola
  };
  

  useEffect(() => {
    if (number.next && animationData) {
      spinWheel(number.next, animationData);
    }
  }, [number, animationData]);

  return (
    <div className={styles.rouletteWheel}>
      <img src="/img/roulette/roulette_1.png" className={styles.rouletteImage} />
      <img src="/img/roulette/roulette_2.png" className={`${styles.rouletteImage} layer-2`} />
      <img src="/img/roulette/roulette_3.png" className={styles.rouletteImage} />
      <img src="/img/roulette/roulette_4.png" className={`${styles.rouletteImage} layer-4`} />
      <img
        src="/img/roulette/roulette_5.png"
        alt="Rotating wheel"
        className={`${styles.rouletteImage} roulette-image`}
      />

      <div className={styles.ballContainer}>
        <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg" />
      </div>
    </div>
  );
};

export default Wheel;