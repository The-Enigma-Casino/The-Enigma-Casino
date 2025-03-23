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
    path: 'M 62.401119,194.58107 c -14.944827,4e-5 -27.060005,14.96647 -27.060049,33.42852 -1.88e-4,18.46225 12.115058,33.42899 27.060049,33.42904 2.02323,-0.0141 3.96196,-0.0193 6.00886,-0.0176 2.059,0.002 4.00949,0.007 6.04469,0.0176 14.945,-5e-5 27.060251,-14.96679 27.060061,-33.42904 -5e-5,-18.46205 -12.115221,-33.42848 -27.060061,-33.42852 -2.0232,0.0139 -3.962,0.0188 -6.00887,0.017 -2.05897,-0.002 -4.00948,-0.006 -6.04468,-0.017 z'
  });
  // Función para mostrar el confetti
  const launchConfetti = () => {
    let end = Date.now() + 3000;
    let colors = ['#ffcc00', '#f5a623'];
    let animationFrameId: number | null = null;

    if (!isConfettiActive) {
      setIsConfettiActive(true);

      // Código de confetti
      const frame = () => {
        confetti({
          shapes: [coinShape],
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          shapes: [coinShape],
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        if (Date.now() < end) {
          animationFrameId = requestAnimationFrame(frame);
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
      confetti.reset(); // Detener la animación al cambiar de vista
    };
  }, [navigate]);

  return (
    <section className={classes.sectionLanding}>
      <div className={classes.topContainer}>
        <div className={classes.buttonUp}>
          <div className={classes.topTextItem}>PROYECTO EDUCATIVO</div>

        </div>

        <div className={classes.topText}>
          <div className={classes.topTextItem}>Ruleta</div>
          <div className={classes.topTextItem}>BlackJack</div>
          <div className={classes.topTextItem}>Poker</div>
        </div>
      </div>

      <div className={classes.main}>
        <div className={classes.imageContainer}>
          <img src="/img/duende.png" alt="Casino Logo" className={classes.image} />
        </div>
        <div className={classes.content}>
          <h2>THE</h2>
          <h1>ENIGMA</h1>
          <h2>CASINO</h2>
        </div>
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
