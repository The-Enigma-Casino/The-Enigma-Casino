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
} from "../../../features/coins/store/coinsStore";

import Button from "../../ui/button/Button";
import classes from "./Header.module.css";
import { clearStorage } from "../../../utils/storageUtils";
import Modal from "../../ui/modal/Modal";
import { $transactionEnd } from "../../../features/withdraw/store/WithdrawalStore";
import ModalGachaComponent from "../../../features/gachapon/components/ModalGachaComponent";

function Header() {
  const navigate = useNavigate();

  const token = useUnit($token);
  const role = useUnit($role);
  const coins = useUnit($coins);
  const transactionEnded = useUnit($transactionEnd);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isGachaponModalOpen, setIsGachaponModalOpen] = useState(false);

  useEffect(() => {
    loadCoins();
    loadRole();
  }, [token, transactionEnded]);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    clearToken();
    clearStorage();
    resetCoins();
    navigate("/");
  };

  const openGachaponModal = () => {
    setIsGachaponModalOpen(true);
  };

  const closeGachaponModal = () => {
    setIsGachaponModalOpen(false);
  };

  return (
    <>
      <header className={classes.header}>
        {isGachaponModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20" />
        )}

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
              onClick={openGachaponModal}
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
                  onClick={() => setIsLogoutModalOpen(true)}
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

      {isGachaponModalOpen && (
        <div className="fixed inset-0 z-30 flex justify-center items-center">
          <ModalGachaComponent
            isOpen={isGachaponModalOpen}
            closeModal={closeGachaponModal}
          />
        </div>
      )}

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
