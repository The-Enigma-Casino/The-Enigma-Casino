import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import {
  $role,
  $token,
  clearToken,
  loadRole,
} from "../../../features/auth/store/authStore";
import {
  $coins,
  loadCoins,
  resetCoins,
} from "../../../features/coins/store/coinsStore"; // Importamos el store y la acción

import Button from "../../ui/button/Button";
import classes from "./Header.module.css";
import { clearStorage } from "../../../utils/storageUtils";
import Modal from "../../ui/modal/Modal";

function Header() {
  const navigate = useNavigate();

  const token = useUnit($token);
  const role = useUnit($role);
  const coins = useUnit($coins);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    loadCoins();
    loadRole();
  }, [token]);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    clearToken();
    clearStorage();
    resetCoins();
    navigate("/");
  };

  return (
    <>
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

          {(role?.toLowerCase() === "user" ||
            role?.toLowerCase() === "admin") && (
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
                onClick={() => setIsLogoutModalOpen(true)} // Abre el modal al hacer clic
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

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        size="small"
        position="center"
      >
        <div className={classes.modalText}>¿Desea cerrar sesión?</div>
        <div className={classes.modalButtons}>
          <Button
            variant="medium"
            color="red"
            font="bold"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default Header;
