import React, { useEffect, useState } from "react";
import * as anime from "animejs";
import { RouletteData } from "../types/RouletteData.type";
import { WheelNumber } from "../types/WheelNumber.type";

import styles from './Wheel.module.css';

type Props = {
  rouletteData: RouletteData;
  number: WheelNumber;
};

const Wheel: React.FC<Props> = ({ rouletteData, number }) => {
  const [isRotating, setIsRotating] = useState(false);
  const totalNumbers = 37;
  const singleRotationDegree = 360 / totalNumbers;

  const getRotationFromNumber = (num: string) => {
    const index = rouletteData.numbers.indexOf(parseInt(num));
    return singleRotationDegree * index;
  };

  const getRandomEndRotation = (min: number, max: number) => {
    const spins = Math.floor(Math.random() * (max - min + 1)) + min;
    return singleRotationDegree * spins * totalNumbers;
  };

  const getZeroEndRotation = (rotation: number) => {
    return 360 - Math.abs(rotation % 360);
  };

  const getBallEndRotation = (zeroRotation: number, num: string) => {
    return Math.abs(zeroRotation) + getRotationFromNumber(num);
  };

  const getBallSpin = () => Math.floor(Math.random() * 3 + 2) * 360;

  const spinWheel = (num: string) => {
    if (isRotating) return;

    setIsRotating(true);

    const endRotation = -getRandomEndRotation(2, 4);
    const zeroRotation = getZeroEndRotation(endRotation);
    const ballRotation = getBallSpin() + getBallEndRotation(zeroRotation, num);

    const animeFn = (anime as any).default || (anime as any);

    animeFn.set(".roulette-image", { rotate: 0 });
    animeFn.set(".ball-container", { rotate: 0 });

    animeFn({
      targets: [".layer-2", ".layer-4"],
      rotate: endRotation,
      duration: 5000,
      easing: "cubicBezier(0.165, 0.84, 0.44, 1.005)",
    });

    animeFn({
      targets: ".ball-container",
      translateY: [
        { value: 0, duration: 2000 },
        { value: 20, duration: 1000 },
        { value: 25, duration: 900 },
        { value: 50, duration: 1000 },
      ],
      rotate: ballRotation,
      duration: 5000,
      loop: 1,
      easing: "cubicBezier(0.165, 0.84, 0.44, 1.005)",
      complete: () => setIsRotating(false),
    });
  };

  useEffect(() => {
    if (number.next) {
      spinWheel(number.next);
    }
  }, [number]);

  return (
    <div className={styles.rouletteWheel}>

      <img src="/img/roulette/roulette_1.png" className={styles.rouletteImage} />
      <img src="/img/roulette/roulette_2.png" className={styles.rouletteImage} />
      <img src="/img/roulette/roulette_3.png" className={styles.rouletteImage} />
      <img src="/img/roulette/roulette_4.png" className={styles.rouletteImage} />

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
