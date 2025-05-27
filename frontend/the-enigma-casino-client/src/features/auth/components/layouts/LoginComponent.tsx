import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/CustomInput";
import Button from "../../../../components/ui/button/Button";

import classes from "./Login.module.css";

import { loginFx } from "../../actions/authActions";
import { useEffect, useState } from "react";
import { $authError, setToken } from "../../store/authStore";
import { useUnit } from "effector-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { connectSocket } from "../../../../websocket/store/wsIndex";

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
      connectSocket();
    }
  };

  useEffect(() => {
    if (authError) {
      toast.error(authError.message);
    }
  }, [authError]);

  return (
    <>
      <div className="relative flex items-center justify-between w-full min-h-screen bg-background-page">
        <div className="flex flex-col items-center w-full lg:w-[60%] lg:ml-40 lg:mb-32 px-6">
          <h1 className="text-[6rem] text-Principal text-center mb-12">
            LOGIN
          </h1>
          <form
            className="grid grid-cols-1 gap-6 p-10 w-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="text-white text-xl font-bold">
              Correo o nombre de usuario
            </label>
            <div className="col-span-2 flex flex-col">
              <Input
                type="text"
                name="identifier"
                id="identifier"
                placeholder="Correo o nombre"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIdentifier(e.target.value)
                }
              />
            </div>
            <label className="text-white text-xl font-bold">Contraseña</label>
            <div className="col-span-2 flex flex-col gap-4">
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                showToggle
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Checkbox
                labelText="Recuérdame"
                checked={rememberMe}
                onChange={toggleRememberMe}
              />
            </div>
            <div className="flex justify-start font-extrabold text-lg sm:text-xl col-span-2 mt-5">
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

        <div className={`${classes.loginRight} flex flex-col justify-center`}>
          <div className="relative w-full mt-40 h-[200px]">
            <img
              src="/img/icono.webp"
              alt="Logo Enigma"
              className="absolute left-1/2 md:left-[65%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] h-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          <div className="text-center mt-16">
            <p className="text-black text-2xl font-bold">¿No tienes cuenta?</p>
            <button
              onClick={() => navigate("/auth/register")}
              className="text-white text-xl underline hover:text-principal transition-colors mt-2"
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginComponent;
