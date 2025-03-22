import classes from "./Register.module.css";
import { useNavigate } from "react-router-dom";
import RegisterFormSection from "./RegisterFormSection";

function RegisterComponent() {
  const navigate = useNavigate();

  return (
    <div className={classes.register}>
      <div className={classes.registerLeft}>
        <h1 className={classes.title}>REGISTRO</h1>

        <div className={classes.registerLogo}>
          <img
            src="/img/icono.webp"
            alt="Logo Enigma"
            onClick={() => navigate("/")}
          />
        </div>

        <a onClick={() => navigate("/auth/login")}>
          <p>¿Tienes cuenta?</p>
        </a>
      </div>

      <div className={classes.registerRight}>
        <RegisterFormSection />
      </div>
    </div>
  );
}

export default RegisterComponent;