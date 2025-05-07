import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import {
  $role,
  $token,
  loadRole,
} from "../../../features/auth/store/authStore";
import { $coins, loadCoins } from "../../../features/coins/store/coinsStore";
import Button from "../../ui/button/Button";
import Modal from "../../ui/modal/Modal";
import ModalGachaComponent from "../../../features/gachapon/components/ModalGachaComponent";
import { useLogout } from "../../../features/auth/utils/logout";

function HeaderMobile() {
  const navigate = useNavigate();
  const token = useUnit($token);
  const role = useUnit($role);
  const coins = useUnit($coins);
  const logout = useLogout();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isGachaponModalOpen, setIsGachaponModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadCoins();
    loadRole();
  }, [token]);

  console.log("🔐 Rol actual:", role);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <header className="relative w-full h-[6rem] bg-[var(--Background-Nav)] px-3 py-2 flex items-center justify-between text-white">
        {/* IZQUIERDA: botón hamburguesa */}
        <div className="z-10">
          <button
            className="text-white text-4xl"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        {/* CENTRO: logo centrado con position absolute */}
        <img
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 cursor-pointer"
          src="/img/icono.webp"
          alt="Logo"
          onClick={() => navigate("/")}
        />

        {/* DERECHA: monedas + campana */}
        {token && (
          <div className="flex items-center gap-4 z-10">
            <button
              className="text-[var(--Coins)] text-4xl font-bold inline-flex items-center gap-2"
              onClick={() => navigate("/catalog")}
            >
              {coins}{" "}
              <img src="/svg/coins.svg" alt="Fichas" className="w-8 h-8" />
            </button>

            <img
              src="/svg/notification-bell.svg"
              alt="Notificaciones"
              className="w-16 h-16 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
        )}
      </header>

      {isMenuOpen && (
        <div className="absolute top-[6rem] left-0 w-1/2 bg-[var(--Background-Nav)] shadow-lg z-50 flex flex-col items-start px-6 py-6 gap-6 text-white text-xl font-medium rounded-r-xl">
          {!token && (
            <Button
              variant="large"
              color="green"
              font="bold"
              onClick={() => {
                navigate("/auth/login");
                setIsMenuOpen(false);
              }}
            >
              Iniciar sesión
            </Button>
          )}

          {token && (
            <>
              {/* Gachapon */}
              <div className="flex items-center gap-4 cursor-pointer">
                <img
                  src="/svg/gachapon.svg"
                  alt="Gachapón"
                  className="w-12 h-12 cursor-pointer"
                  onClick={() => {
                    setIsGachaponModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                />
                <p className="text-xl text-white/80">Gachapón</p>
              </div>

              {/* Perfil */}
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
              >
                <img src="/svg/user.svg" alt="Perfil" className="w-12 h-12" />
                <p className="text-xl text-white/80">Mi Perfil</p>
              </div>

              {/* Fichas */}
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => {
                  navigate("/catalog");
                  setIsMenuOpen(false);
                }}
              >
                <img src="/svg/coins.svg" alt="Fichas" className="w-12 h-12" />
                <p className="text-xl text-white/80">Comprar fichas</p>
              </div>

              {/* Amigos */}
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => {
                  navigate("/friends");
                  setIsMenuOpen(false);
                }}
              >
                <img
                  src="/svg/search-user.svg"
                  alt="Amigos"
                  className="w-12 h-12"
                />
                <p className="text-xl text-white/80">Amigos</p>
              </div>

              <hr className="w-full border-t-2 border-[var(--Principal)] my-2" />

              {/* Admin panel */}
              {role === "Admin" && (
                <>
                  <p className="text-[var(--Principal)] text-base font-bold">
                    ADMIN
                  </p>

                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => {
                      navigate("/admin/users");
                      setIsMenuOpen(false);
                    }}
                  >
                    <img
                      src="/svg/admin.svg"
                      alt="Usuarios"
                      className="w-12 h-12"
                    />
                    <p className="text-xl text-white/80">Panel de usuarios</p>
                  </div>

                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => {
                      navigate("/admin/coins");
                      setIsMenuOpen(false);
                    }}
                  >
                    <img
                      src="/svg/coins.svg"
                      alt="Fichas"
                      className="w-12 h-12"
                    />
                    <p className="text-xl text-white/80">Panel de Fichas</p>
                  </div>
                </>
              )}
              <hr className="w-full border-t-2 border-[var(--Principal)] my-2" />

              {/* Cerrar sesión */}
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => {
                  setIsLogoutModalOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <img
                  src="/svg/exit.svg"
                  alt="Cerrar sesión"
                  className="w-12 h-12"
                />
                <p className="text-xl text-white/80">Cerrar Sesión</p>
              </div>
            </>
          )}
        </div>
      )}

      {isGachaponModalOpen && (
        <div className="fixed inset-0 z-30 flex justify-center items-center">
          <ModalGachaComponent
            isOpen={isGachaponModalOpen}
            closeModal={() => setIsGachaponModalOpen(false)}
          />
        </div>
      )}

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        size="small"
        position="center"
      >
        <div className="text-white text-center text-2xl mb-4">
          ¿Desea cerrar sesión?
        </div>
        <div className="flex justify-center gap-4">
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

export default HeaderMobile;
