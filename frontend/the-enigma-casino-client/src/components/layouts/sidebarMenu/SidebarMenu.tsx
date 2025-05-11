import Button from "../../ui/button/Button";
import { useNavigate } from "react-router-dom";
import {
  $name,
  $token,
  loadName,
} from "../../../features/auth/store/authStore";
import { useEffect } from "react";
import { useUnit } from "effector-react";
import { USER_IMAGES } from "../../../config";
import FriendsPanel from "../../../features/friends/components/layouts/FriendsPanel";
import UserLiveCounter from "../../ui/userLive/UserLiveCounter";
import { $userImage } from "../../../features/profile/store/profile/profileStores";
import { getUserImageFx } from "../../../features/profile/store/profile/profileEffects";

function SidebarMenu() {
  const token = useUnit($token);
  const name = useUnit($name);
  const userImage = useUnit($userImage);
  const navigate = useNavigate();

  useEffect(() => {
    loadName();
    getUserImageFx();
  }, [token]);

  const profileImage =
    token && userImage ? `${USER_IMAGES}/${userImage}` : "/svg/user.svg";

  return (
    <nav className="hidden md:flex w-[24rem] h-full flex-col justify-between items-center bg-[var(--Background-Nav)] py-12 px-0">
      {/* Parte superior: perfil + botones */}
      <div className="flex flex-col items-center w-full gap-4 px-4">
        {/* Perfil */}
        <div className="relative flex flex-col items-center w-[20rem] h-[13rem] gap-4 bg-[var(--Background-Overlay)] rounded-3xl border border-[var(--Green-lines)] pt-16">
          <img
            src={profileImage}
            alt="Imagen de Perfil"
            className="absolute top-[-3rem] w-24 h-24 rounded-full bg-white"
          />
          {token ? (
            <>
              <h2 className="text-[1.6rem] text-[var(--Coins)]">{name}</h2>
              <Button
                color="green"
                variant="small"
                font="bold"
                onClick={() => navigate("/profile")}
              >
                Perfil
              </Button>
            </>
          ) : (
            <h2 className="text-[1.6rem] text-[var(--Coins)]">Inicie Sesión</h2>
          )}
        </div>

        {/* Menú */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            color="yellow"
            variant="large"
            font="bold"
            onClick={() => navigate("/catalog")}
          >
            Fichas
          </Button>

          {token ? (
            <>
              <Button
                color="green"
                variant="large"
                font="bold"
                onClick={() => navigate("/friends")}
              >
                Amigos
              </Button>
              <h2 className="text-white text-[1.6rem] pt-4">AMIGOS EN LÍNEA</h2>
              <FriendsPanel />
            </>
          ) : (
            <>
              <Button
                color="green"
                variant="large"
                font="bold"
                onClick={() => navigate("/auth/login")}
              >
                Iniciar sesión
              </Button>
              <Button
                color="green"
                variant="large"
                font="bold"
                onClick={() => navigate("/auth/register")}
              >
                Registro
              </Button>
            </>
          )}
        </div>
      </div>

      <UserLiveCounter />
    </nav>
  );
}

export default SidebarMenu;
