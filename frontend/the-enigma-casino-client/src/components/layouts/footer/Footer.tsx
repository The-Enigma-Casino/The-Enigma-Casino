import classes from "./Footer.module.css";

import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

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
    </footer>
  );
}

export default Footer;
