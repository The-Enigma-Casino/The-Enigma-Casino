import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./RouletteWheel.module.css";
import { useUnit } from "effector-react";
import { betsOpenedReceived, spinResult$, wheelRotation$ } from "../stores/rouletteIndex";

const RouletteWheel = () => {
  const rouletteRef = useRef<HTMLDivElement>(null);
  const ballContainerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);

  const spinResult = useUnit(spinResult$);
  const wheelRotation = useUnit(wheelRotation$);

  const [showBall, setShowBall] = useState(false);

  const spinDiskAndBall = (wheelRotation: number, ballRotation: number) => {
    gsap.set(rouletteRef.current, {
      rotate: rotationRef.current,
    });

    gsap.set(ballContainerRef.current, {
      rotate: 0,
      translateY: -104,
    });

    const tl = gsap.timeline();

    tl.to(
      rouletteRef.current,
      {
        rotate: wheelRotation,
        duration: 6,
        ease: "power4.inOut",
        onComplete: () => {
          rotationRef.current = wheelRotation;
        },
      },
      -1
    );

    tl.to(
      ballContainerRef.current,
      {
        rotate: ballRotation,
        duration: 5,
        ease: "power4.inOut",
      },
      0
    );

    tl.to(
      ballContainerRef.current,
      {
        translateY: 0,
        duration: 0.7,
        ease: "power2.out",
      },
      0.3
    );
  };

  const animateBallExit = () => {
    if (!ballContainerRef.current) return;
  
    gsap.to(ballContainerRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        setShowBall(false); 
        gsap.set(ballContainerRef.current, { y: 0, opacity: 1 })
      },
    });
  };
  
  useEffect(() => {
    if (
      rouletteRef.current &&
      typeof wheelRotation === "number" &&
      wheelRotation !== 0
    ) {
      gsap.set(rouletteRef.current, { rotate: wheelRotation });
      rotationRef.current = wheelRotation;
    }
  }, [wheelRotation]);

  useEffect(() => {
    const unsub = betsOpenedReceived.watch(() => {
      animateBallExit();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (spinResult?.wheelRotation != null && spinResult?.ballRotation != null) {
      setShowBall(true);
      spinDiskAndBall(spinResult.wheelRotation, spinResult.ballRotation);
    }
  }, [spinResult]);

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <div className={styles.rouletteWheel}>
          <div
            className={`${styles.layer} ${styles.layer2}`}
            ref={rouletteRef}
          ></div>
          <div className={`${styles.layer} ${styles.layer3}`}></div>
          <div className={`${styles.layer} ${styles.layer4}`}></div>
          <div className={`${styles.layer} ${styles.layer5}`}></div>
          <div className={styles.ballContainer} ref={ballContainerRef}>
            {showBall && <div className={styles.ball}></div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default RouletteWheel;