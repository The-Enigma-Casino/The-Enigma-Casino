import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import { $token, $role, clearToken } from "../../../features/auth/store/authStore";
// import { $coins, loadCoins } from "../../../features/coins/store/coinsStore";

import Button from "../../ui/button/Button";
import classes from "./Header.module.css";
import { clearStorage } from "../../../utils/storageUtils";

function Header() {
  const navigate = useNavigate();

  const role = useUnit($role);
  // const coins = useUnit($coins);
  const coins = 1000;

  const handleLogout = () => {
    clearToken();
    clearStorage();
    navigate("/");
  };

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
          <p className={classes.text}>Gachapón</p>
          <p className={classes.text}>de la suerte</p>
        </div>
        {role && (
          <img
            src={`/svg/notification-bell.svg`}
            alt="Notificaciones"
            onClick={() => navigate("/")}
          />
        )}
      </div>

      <div className={classes.rightHeader}>
        {role?.toLowerCase() === "admin" && (
          <img
            src="/svg/admin.svg"
            alt="Admin"
            onClick={() => navigate("/admin")}
          />
        )}

        {(role?.toLowerCase() === "user" || role?.toLowerCase() === "admin") && (
          <>
            <button
              className={classes.coinsButton}
              onClick={() => navigate("/catalog")}
            >
              {coins} <img src="/svg/coins.svg" alt="Fichas" />
            </button>
            <img
              src="/svg/exit.svg"
              alt="Cerrar sesión"
              onClick={handleLogout}
            />
          </>
        )}

        {!role && (
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
