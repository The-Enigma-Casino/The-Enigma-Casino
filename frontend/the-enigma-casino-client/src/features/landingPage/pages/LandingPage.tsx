import React, { useState, useEffect } from "react";
import classes from "./LandingPage.module.css";
import Button from "../../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";
import { $token } from "../../auth/store/authStore";
import confetti from "canvas-confetti";
import { useUnit } from "effector-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const token = useUnit($token);

  const coinShape = confetti.shapeFromPath({
    path: "M 62.401119,194.58107 c -14.944827,4e-5 -27.060005,14.96647 -27.060049,33.42852 -1.88e-4,18.46225 12.115058,33.42899 27.060049,33.42904 2.02323,-0.0141 3.96196,-0.0193 6.00886,-0.0176 2.059,0.002 4.00949,0.007 6.04469,0.0176 14.945,-5e-5 27.060251,-14.96679 27.060061,-33.42904 -5e-5,-18.46205 -12.115221,-33.42848 -27.060061,-33.42852 -2.0232,0.0139 -3.962,0.0188 -6.00887,0.017 -2.05897,-0.002 -4.00948,-0.006 -6.04468,-0.017 z",
  });
  const launchConfetti = () => {
    const end = Date.now() + 3000;
    const colors = ["#ffcc00", "#f5a623"];

    if (!isConfettiActive) {
      setIsConfettiActive(true);

      const frame = () => {
        confetti({
          shapes: [coinShape],
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          shapes: [coinShape],
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      setTimeout(() => {
        setIsConfettiActive(false);
        if (token) {
          navigate("/");
        } else {
          navigate("/auth/login");
        }
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      confetti.reset();
    };
  }, [navigate]);

  return (
    <section className="relative w-full h-screen min-h-screen overflow-hidden flex justify-center items-center">
      <div className="absolute inset-x-0 bottom-0 z-[2] flex justify-center pointer-events-none">
        <img
          src="/img/duende.webp"
          alt="duende"
          className="w-full h-auto object-contain
            max-w-[450px] sm:max-w-[500px] md:max-w-[550px] lg:max-w-[600px] xl:max-w-[700px]
            max-h-[70vh] sm:max-h-[75vh] md:max-h-[75vh] lg:max-h-[80vh]"
        />
      </div>

      <header className="fixed top-0 left-0 z-[1000] w-full px-4 sm:px-6 md:px-10 py-4 bg-transparent flex justify-between items-start sm:items-center">
        <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-wide">
          PROYECTO EDUCATIVO
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-6 md:gap-12 text-right sm:text-left">
          {["Ruleta", "BlackJack", "Poker"].map((label) => (
            <div
              key={label}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide"
            >
              {label}
            </div>
          ))}
        </div>
      </header>

      <div className="absolute top-[12vh] sm:top-[10vh] md:top-[10vh] lg:top-[12vh] w-full flex justify-center z-20 px-4 mt-3 text-center">
        <div className={classes.content}>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight break-words">
            THE ENIGMA CASINO
          </h1>
        </div>
      </div>

      <div className="absolute bottom-10 w-full flex justify-center z-30">
        <div className={classes.buttonMid}>
          <Button
            variant="big"
            color="yellow"
            font="bold"
            onClick={launchConfetti}
          >
            ¡JUEGA AHORA!
          </Button>
        </div>
      </div>

      <div className={classes.wave}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </section>
  );
};

export default LandingPage;
