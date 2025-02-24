import Button from "../../ui/button/Button";
import classes from "./Header.module.css";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const BELL_ICONS: string[] = ["bell", "bell-ringing", "notification-bell"];
  const fichas: number = 1000;
  const roles: "admin" | "user" | null = null;

  return (
    <header className={classes.header}>
      <div className={classes.leftHeader}>
        <img
          className={classes.imgLogo}
          src="/img/icono.webp"
          alt="Logo"
          onClick={() => navigate("/")}
        />
        <div className={classes.gachapon}>
          <img
            src="/svg/gachapon.svg"
            alt="Gacha"
            onClick={() => navigate("/")}
          />
          <p>Gachapón</p>
          <p>de la suerte</p>
        </div>
        {roles !== null && (
          <img
            src={`/svg/${BELL_ICONS[2]}.svg`}
            alt="Notificaciones"
            onClick={() => navigate("/")}
          />
        )}
      </div>

      <div className={classes.rightHeader}>
        {roles === "admin" && (
          <img
            src="/svg/admin.svg"
            alt="Admin"
            onClick={() => navigate("/admin")}
          />
        )}

        {(roles === "user" || roles === "admin") && (
          <>
            <button
              className={classes.coinsButton}
              onClick={() => navigate("/")}
            >
              {fichas} <img src="/svg/coins.svg" alt="Fichas" />
            </button>
            <img
              src="/svg/exit.svg"
              alt="Cerrar sesión"
              onClick={() => navigate("/logout")}
            />
          </>
        )}

        {roles === null && (
          <Button
            variant="large"
            color="green"
            font="bold"
            onClick={() => navigate("/auth/login")}
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;
