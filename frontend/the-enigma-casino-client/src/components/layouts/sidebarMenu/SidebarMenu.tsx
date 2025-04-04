import classes from "./SidebarMenu.module.css";
import Button from "../../ui/button/Button";
import { useNavigate } from "react-router-dom";
import {
  $name,
  $token,
  loadName,
} from "../../../features/auth/store/authStore";
import { useEffect } from "react";
import { useUnit } from "effector-react";
import FriendsPanel from "../../../features/friends/components/layouts/friendsPanel";
import { $onlineUsers } from "../../../websocket/store/wsIndex";


function SidebarMenu() {
  // const userLive: number = 777;
  const token = useUnit($token);
  const name = useUnit($name);
  const navigate = useNavigate();
  const userLive = useUnit($onlineUsers);

  useEffect(() => {
    loadName();
  }, [token]);

  return (
    <nav className={classes.sidebarMenu}>
      <div className={classes.container}>
        <div className={classes.profile}>
          <img src="/svg/user.svg" alt="Imagen Perfil" />
          {token ? (
            <>
              <h2>{name}</h2>
              <Button
                color="green"
                variant="small"
                font="bold"
                onClick={() => navigate("/")}
              >
                Perfil
              </Button>
            </>
          ) : (
            <h2>Inicie Sesión</h2>
          )}
        </div>
        <div className={classes.menu}>
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
                onClick={() => navigate("/")}
              >
                Amigos
              </Button>
              <h2 className={classes.titleFriend}>AMIGOS EN LÍNEA</h2>
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
      <div className={classes.totalUser}>
        <img src="/svg/user-live.svg" alt="" />
        <p>{userLive}</p>
      </div>
    </nav>
  );
}

export default SidebarMenu;
