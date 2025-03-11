import { useUnit } from "effector-react";
import classes from "./Footer.module.css";

import { useNavigate } from "react-router-dom";
import { $role } from "../../../features/auth/store/authStore";

function Footer() {
  const navigate = useNavigate();
  const GITHUB: string = "https://github.com/The-Enigma-Casino/The-Enigma-Casino";

  const role = useUnit($role);

  return (
    <footer className={classes.footer}>
      <div className={classes.leftFooter}>
        <img
          className={classes.imgFooter}
          src="/img/icono.webp"
          alt="Logo"
          onClick={() => navigate("/")}
        />
        <div className={classes.titleFooter}>
          <h1>The Enigma Casino</h1>
          <p>© 2025 | The Enigma Casino | All rights reserverd</p>
        </div>
        <div className={classes.line}></div>
      </div>
      <div className={classes.rightFooter}>
        <div className={classes.textFooter}>
          <p>Juegos de casino</p>
          <p>Ruleta | Blackjack | Poker</p>
        </div>
        <div className={classes.textFooter}>
          <p>Pagos</p>
          <p>Euros | Ethereum </p>
        </div>
        <div className={classes.textFooter}>
          <button
            className={classes.InvisibilityButton}
            onClick={() => navigate("/")}
          >
            Política de privacidad
          </button>
          <button
            className={classes.InvisibilityButton}
            onClick={() => navigate("/")}
          >
            Acuerdo con el usuario
          </button>
        </div>
        <div className={classes.textFooter}>
          <button
            className={classes.InvisibilityButton}
            onClick={() => navigate("/")}
          >
            Sobre nosotros
          </button>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
        {role?.toLowerCase() === "user" && (
          <div className={classes.autoExpulsion}>
            <button
              className={`${classes.InvisibilityButton} ${classes.autoExpulsion}`}
            >
              AutoExpulsión
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
