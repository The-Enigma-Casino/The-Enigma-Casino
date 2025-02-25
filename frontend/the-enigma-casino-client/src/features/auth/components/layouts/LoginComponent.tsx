import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/Input";
import Button from "../../../../components/ui/button/Button";

import classes from "./Login.module.css";

import { loginFx } from "../../actions/authActions";
import { useEffect, useState } from "react";
import { $authError, setToken } from "../../store/authStore";
import { useUnit } from "effector-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function LoginComponent() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [authError, isLoading] = useUnit([$authError, loginFx.pending]);

  const toggleRememberMe = () => {
    setRememberMe((prev) => !prev);
  };

  const handleLogin = async () => {
    const token = await loginFx({ identifier, password });

    if (token) {
      setToken({ token, rememberMe });
      navigate("/");
    }
  };

  useEffect(() => {
    if (authError) {
      toast.error(authError.message);
    }
  }, [authError]);
  

  return (
    <>
      <div className={classes.login}>
        <div className={classes.loginLeft}>
          <h1 className={classes.title}>LOGIN</h1>
          <form
            className={classes.loginForm}
            onSubmit={(e) => e.preventDefault()}
          >
            <label className={classes.label}>Correo o nombre de usuario</label>
            <div className={classes.inputContainer}>
              <Input
                type="text"
                name="identifier"
                id="identifier"
                placeholder="Correo o nombre de usuario"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIdentifier(e.target.value)
                }
              />
            </div>
            <label className={classes.label}>Contraseña</label>
            <div className={classes.inputContainer}>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>
            <div className={classes.checkboxContainer}>
              <Checkbox
                labelText="Recuérdame"
                checked={rememberMe}
                onChange={toggleRememberMe}
              />
            </div>
            
            <div className={classes.buttonLogin}>
              <Button
                onClick={handleLogin}
                variant="outline"
                color="green"
                font="large"
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </div>
          </form>
        </div>

        <div className={classes.loginRight}>
          <div className={classes.loginLogo}>
            <img src="/img/icono.webp" alt="Logo Enigma" />
          </div>
          <a href="#">
            <p>¿No tienes cuenta?</p>
          </a>
        </div>
      </div>
    </>
  );
}

export default LoginComponent;
