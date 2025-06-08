import classes from "./Login.module.css";

import { useUnit } from "effector-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../../../../websocket/store/wsIndex";
import { loginFx } from "../../actions/authActions";
import { $authError, setToken } from "../../store/authStore";
import LoginForm from "../ui/LoginForm";

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

  useEffect(() => {
  const reason = sessionStorage.getItem("logoutReason");
  if (reason) {
    if (reason === "Token expirado") {
      toast("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
    }

    sessionStorage.removeItem("logoutReason");
  }
}, []);

  return (
    <>
      <div className="flex flex-col lg:flex-row w-full h-full lg:h-screen bg-background-page">
        <div className="flex flex-col items-center justify-center w-full flex-grow lg:w-[60%] lg:ml-40 lg:mb-32">
          <LoginForm
            identifier={identifier}
            password={password}
            rememberMe={rememberMe}
            isLoading={isLoading}
            onIdentifierChange={setIdentifier}
            onPasswordChange={setPassword}
            onRememberMeToggle={toggleRememberMe}
            onSubmit={handleLogin}
          />
        </div>

        <div
          className={`${classes.loginRight} hidden lg:flex flex-col items-center justify-center pl-[10%] gap-12`}
        >
          <img
            src="/img/icono.webp"
            alt="Logo Enigma"
            className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[260px] xl:w-[320px]"
          />

          <div className="text-center">
            <p className="text-black text-6xl font-bold">¿No tienes cuenta?</p>
            <button
              onClick={() => navigate("/auth/register")}
              className="text-white text-3xl underline hover:text-principal transition-colors mt-2 font-semibold"
            >
              Regístrate aquí
            </button>
          </div>
        </div>

        {/* FOOTER REGISTRO EN MÓVIL */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[var(--Principal)] text-center text-white py-6 px-6 w-full lg:hidden">
          <p className="text-4xl text-black font-bold">¿No tienes cuenta?</p>
          <button
            onClick={() => navigate("/auth/register")}
            className="text-2xl underline hover:text-principal transition-colors mt-2 font-semibold"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </>
  );
}

export default LoginComponent;
