import Button from "../../ui/button/Button";
import { useNavigate } from "react-router-dom";
import {
  $token,
  loadName,
} from "../../../features/auth/store/authStore";
import { useEffect } from "react";
import { useUnit } from "effector-react";
import { USER_IMAGES } from "../../../config";
import FriendsPanel from "../../../features/friends/components/layouts/FriendsPanel";
import UserLiveCounter from "../../ui/userLive/UserLiveCounter";
import { $userImage, $userProfile } from "../../../features/profile/store/profile/profileStores";
import { getUserImageFx } from "../../../features/profile/store/profile/profileEffects";
import { loadUserProfile } from "../../../features/profile/store/profile/profileEvents";

interface SidebarMenuProps {
  onOpenFriendsModal?: () => void;
}

function SidebarMenu({ onOpenFriendsModal }: SidebarMenuProps) {
  const token = useUnit($token);
  const profile = useUnit($userProfile);
  const name = profile?.nickname;
  const userImage = useUnit($userImage);
  const navigate = useNavigate();

  useEffect(() => {
    loadName();
    getUserImageFx();
    loadUserProfile();
  }, [token]);

  const profileImage =
    token && userImage ? `${USER_IMAGES}/${userImage}?${Date.now()}` : "/svg/user.svg";

  return (
    <nav className="hidden md:flex h-full flex-col justify-between items-center bg-[var(--Background-Nav)] py-12">
      {/* Parte superior: perfil + botones */}
      <div className="flex flex-col items-center w-full gap-4 px-4">
        {/* Perfil */}
        <div className="relative flex flex-col items-center w-[20rem] h-[13rem] gap-4 bg-[var(--Background-Overlay)] rounded-3xl border-2 border-[var(--Green-lines)] pt-16 shadow-md shadow-gray-700">
          <img
            src={profileImage}
            alt="Imagen de Perfil"
            className="absolute top-[-3rem] w-24 h-24 rounded-full bg-transparent hover:border-Principal transform transition-transform duration-300 hover:scale-110"
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
                onClick={onOpenFriendsModal}
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
