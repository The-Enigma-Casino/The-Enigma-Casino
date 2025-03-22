import React from "react";
import classes from "./LandingPage.module.css";
import Button from "../../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={classes.section}>
      <div className={classes.topContainer}>
        <div className={classes.buttonUp}>
          <Button
            variant="large"
            color="yellow"
            font="bold"
            onClick={() => navigate("/auth/register")}
          >
            ¡Registrate Gratis!
          </Button>
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
            onClick={() => navigate("/")}
          >
            ¡Juega ahora!
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
