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

  // Función para abrir el modal del Gachapón
  const openGachaponModal = () => {
    setIsGachaponModalOpen(true); // Cambia el estado para abrir el modal del Gachapón
  };

  // Función para cerrar el modal del Gachapón
  const closeGachaponModal = () => {
    setIsGachaponModalOpen(false); // Cierra el modal del Gachapón
  };

  return (
    <>
      <header className={classes.header}>
        {/* Fondo oscuro semi-transparente que cubre toda la pantalla solo cuando el modal está abierto */}
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
              onClick={openGachaponModal} // Abre el modal al hacer clic en el ícono
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
                  onClick={() => setIsLogoutModalOpen(true)} // Abre el modal de logout
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

      {/* El Modal Gachapón es el foco de atención y no se ve afectado por la transparencia */}
      {isGachaponModalOpen && (
        <div className="fixed inset-0 z-30 flex justify-center items-center">
          <ModalGachaComponent
            isOpen={isGachaponModalOpen}
            closeModal={closeGachaponModal} // Cierra el modal cuando se hace clic en la X
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
