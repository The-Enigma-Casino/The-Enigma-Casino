import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import {
  $role,
  $token,
  loadRole,
} from "../../../features/auth/store/authStore";
import { $coins, loadCoins } from "../../../features/coins/stores/coinsStore";

import Button from "../../ui/button/Button";
import classes from "./Header.module.css";
import Modal from "../../ui/modal/Modal";
import { $transactionEnd } from "../../../features/withdraw/store/WithdrawalStore";
import ModalGachaComponent from "../../../features/gachapon/components/ModalGachaComponent";
import { useLogout } from "../../../features/auth/utils/logout";
import { BellWithDropdown } from "../../../features/friends/components/BellWithDropdown";

function Header() {
  const navigate = useNavigate();

  const token = useUnit($token);
  const role = useUnit($role);
  const coins = useUnit($coins);

  const logout = useLogout();

  const transactionEnded = useUnit($transactionEnd);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isGachaponModalOpen, setIsGachaponModalOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    loadCoins();
    loadRole();
  }, [token, transactionEnded]);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const openGachaponModal = () => {
    setIsGachaponModalOpen(true);
  };

  const closeGachaponModal = () => {
    setIsGachaponModalOpen(false);
  };

  return (
    <>
      <header className="w-full max-w-full overflow-x-clip h-[10rem] flex items-center justify-between bg-[var(--Background-Nav)] text-white p-4">
        {isGachaponModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 overflow-x-clip" />
        )}

        <div className="flex flex-wrap items-center justify-center gap-[30px] min-w-0 max-w-full overflow-x-clip">
          <img
            className="w-32 max-h-32 cursor-pointer"
            src="/img/icono.webp"
            alt="Logo"
            onClick={() => navigate("/")}
          />

          <div className="flex flex-col items-center gap-[1px] text-[1.2rem]">
            <img
              src="/svg/gachapon.svg"
              alt="Gacha"
              className="w-16 max-h-16 cursor-pointer"
              onClick={openGachaponModal}
            />
            <p className={classes.text}>Gachapón</p>
            <p className={classes.text}>de la suerte</p>
          </div>

          {role && (
            <div className="absolute top-[3.4rem] left-[22.2rem] z-52">
              <BellWithDropdown direction="desktop" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-[30px] min-w-0 max-w-full overflow-x-clip">
          {role?.toLowerCase() === "admin" && (
            <div className={classes.adminContainer}>
              <img
                src="/svg/admin.svg"
                alt="Admin"
                onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                className={`${classes.adminIcon} ${isAdminMenuOpen ? classes.rotatingOpen : classes.rotatingClose
                  }`}
              />
            </div>
          )}

          {(role?.toLowerCase() === "user" ||
            role?.toLowerCase() === "admin") && (
              <>
                <button
                  className="cursor-pointer text-[var(--Coins)] text-[2.4rem] font-bold inline-flex items-center gap-2 truncate max-w-[12ch]"
                  onClick={() => navigate("/catalog")}
                >
                  {coins} <img src="/svg/coins.svg" alt="Fichas" className={`${classes.coinflip}`} />
                </button>
                <img
                  src="/svg/exit.svg"
                  alt="Cerrar sesión"
                  className="cursor-pointer"
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

      {isAdminMenuOpen && (
        <div className="absolute top-[5.6rem] right-[6.2rem] z-50">
          <div className={classes.adminMenu}>
            <p className={classes.adminTitle}>ADMIN</p>
            <button
              className={classes.adminMenuItem}
              onClick={() => {
                navigate("/admin/users");
                setIsAdminMenuOpen(false);
              }}
            >
              Panel Usuarios
            </button>
            <button
              className={classes.adminMenuItem}
              onClick={() => {
                navigate("/admin/coins");
                setIsAdminMenuOpen(false);
              }}
            >
              Panel Fichas
            </button>
          </div>
        </div>
      )}

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
