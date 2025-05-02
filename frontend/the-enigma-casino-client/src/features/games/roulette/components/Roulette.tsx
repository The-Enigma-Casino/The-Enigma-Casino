import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./Roulette.module.css";
import { useUnit } from "effector-react";
import { spinResult$ } from "../stores/rouletteIndex";

const totalNumbers = 37;
const singleRotationDegree = 360 / totalNumbers;

// Orden antihorario real de la ruleta (bola gira antihorario)
const rouletteNumbers = [
  0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24,
  5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32
];

const Roulette = () => {
  const rouletteRef = useRef<HTMLDivElement>(null);
  const ballContainerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0); // acumulador de ángulo

  const spinResult = useUnit(spinResult$);

  const getRotationFromNumber = (num: number): number => {
    const index = rouletteNumbers.indexOf(num);
    if (index === -1) {
      console.warn("Número no encontrado en la ruleta:", num);
      return 0;
    }
    return index * singleRotationDegree;
  };

  const spinDiskAndBall = (winningNumber: number) => {
    const minSpins = 3;
    const maxSpins = 6;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const extraDegrees = Math.random() * 360;

    const startingAngle = rotationRef.current;
    const diskRotation = startingAngle + spins * 360 + extraDegrees;
    const diskAngle = diskRotation % 360;

    const winningAngle = getRotationFromNumber(winningNumber);
    const correctedAngle = (winningAngle - diskAngle + 360) % 360;

    const ballRotation = -1 * (360 * (spins + 1) + correctedAngle);

    console.log("🎯 Ganador:", winningNumber);
    console.log("🔢 Index:", rouletteNumbers.indexOf(winningNumber));
    console.log("🧭 Winning angle:", winningAngle.toFixed(2));
    console.log("🌀 Disk visual angle:", diskAngle.toFixed(2));
    console.log("🎯 Corrected angle:", correctedAngle.toFixed(2));
    console.log("🎯 Ball rotation:", ballRotation.toFixed(2));

    gsap.set(rouletteRef.current, {
      rotate: startingAngle
    });

    gsap.set(ballContainerRef.current, {
      rotate: 0,
      translateY: -104
    });

    const tl = gsap.timeline();

    tl.to(rouletteRef.current, {
      rotate: diskRotation,
      duration: 6,
      ease: "power4.inOut",
      onComplete: () => {
        rotationRef.current = diskRotation;
      }
    }, -1);

    tl.to(ballContainerRef.current, {
      rotate: ballRotation,
      duration: 5,
      ease: "power4.inOut"
    }, 0);

    tl.to(ballContainerRef.current, {
      translateY: 0,
      duration: 0.7,
      ease: "power2.out"
    }, 0.3);
  };

  // const testSpin = () => {
  //   const testNumbers = [22, 34, 26, 18];

  //   testNumbers.forEach((num, i) => {
  //     setTimeout(() => {
  //       const angle = getRotationFromNumber(num);
  //       console.log(`Verificación ${i + 1}:`, num, "→", angle.toFixed(2));
  //       spinDiskAndBall(num);
  //     }, i * 6000);
  //   });
  // };
  
  useEffect(() => {
    if (spinResult?.number != null) {
      spinDiskAndBall(spinResult.number);
    }
  }, [spinResult]);
  

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <div className={styles.rouletteWheel}>
          <div className={`${styles.layer} ${styles.layer2}`} ref={rouletteRef}></div>
          <div className={`${styles.layer} ${styles.layer3}`}></div>
          <div className={`${styles.layer} ${styles.layer4}`}></div>
          <div className={`${styles.layer} ${styles.layer5}`}></div>
          <div className={styles.ballContainer} ref={ballContainerRef}>
            <div className={styles.ball}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Roulette;