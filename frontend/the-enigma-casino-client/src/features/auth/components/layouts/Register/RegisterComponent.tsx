import { useNavigate } from "react-router-dom";
import RegisterFormSection from "./RegisterFormSection";
import classes from "./Register.module.css"; 

function RegisterComponent() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row w-full h-full lg:h-screen bg-background-page">
      <div
        className={`${classes.registerLeft} hidden lg:flex flex-col items-start justify-center pl-[8%] gap-12`}
      >
        <div className="text-center">
          <p className="text-white text-6xl font-bold">¿Ya tienes cuenta?</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="text-black text-3xl underline hover:text-principal transition-colors mt-2 font-semibold"
          >
            Inicia sesión aquí
          </button>
        </div>

        <img
          src="/img/icono.webp"
          alt="Logo Enigma"
          className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[260px] xl:w-[320px] cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

<div className="flex flex-col items-center justify-center w-full flex-grow lg:w-[60%] lg:mb-32 lg:mr-10">
        <RegisterFormSection />
      </div>

      {/* FOOTER EN MÓVIL */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[var(--Principal)] text-center text-white py-6 px-6 w-full lg:hidden">
        <p className="text-4xl text-black font-bold">¿Ya tienes cuenta?</p>
        <button
          onClick={() => navigate("/auth/login")}
          className="text-2xl underline hover:text-principal transition-colors mt-2 font-semibold"
        >
          Inicia sesión aquí
        </button>
      </div>
    </div>
  );
}

export default RegisterComponent;
