import classes from "./SidebarMenu.module.css";
import Button from "../../ui/button/Button";
import { useNavigate } from "react-router-dom";
import { $token } from "../../../features/auth/store/authStore";
import { useEffect } from "react";
import { useUnit } from "effector-react";

function SidebarMenu() {
  const userLive = 777;
  const token = useUnit($token);
  const navigate = useNavigate();

  useEffect(() => {}, [token]);

  return (
    <nav className={classes.sidebarMenu}>
      <div className={classes.container}>
        <div className={classes.profile}>
          <img src="/svg/user.svg" alt="Imagen Perfil" />
          <h2>Inicio de sesión.</h2>
        </div>
        <div className={classes.menu}>
          <Button color="yellow" variant="large" font="bold" onClick={() => navigate("/catalog")}>
            Fichas
          </Button>

          {token ? (
            <Button color="green" variant="large" font="bold" onClick={() => navigate("/")}>
              Amigos
            </Button>
          ) : (
            <>
              <Button color="green" variant="large" font="bold" onClick={() => navigate("/auth/login")}>
                Iniciar sesión
              </Button>
              <Button color="green" variant="large" font="bold" onClick={() => navigate("/auth/register")}>
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
