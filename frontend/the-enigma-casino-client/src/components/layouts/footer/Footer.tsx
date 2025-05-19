import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import {
  $role,
  $token,
  loadRole,
} from "../../../features/auth/store/authStore";
import { openAutoBanModal } from "../../../features/autoBan/stores/autoBan.store";

function Footer() {
  const navigate = useNavigate();
  const GITHUB = "https://github.com/The-Enigma-Casino/The-Enigma-Casino";

  const token = useUnit($token);
  const role = useUnit($role);

  useEffect(() => {
    loadRole();
  }, [token]);

  return (
    <footer className="bg-[var(--Background-Nav)] text-white flex flex-col md:flex-row gap-5 p-5 w-full max-w-full overflow-x-clip">
      {/* Izquierda */}
      <div className="flex w-full md:w-auto items-center justify-center md:justify-start gap-5 flex-row max-sm:flex-col text-center md:text-left">
        <img
          src="/img/icono.webp"
          alt="Logo"
          className="w-20 max-h-20 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">The Enigma Casino</h1>
          <p className="text-sm">
            © 2025 | The Enigma Casino | All rights reserved
          </p>
        </div>
      </div>

      <div className="hidden max-[770px]:block w-full h-[2px] bg-white my-4" />
      <div className="hidden min-[771px]:block w-[2px] h-[50px] bg-white mx-4" />

      {/* Derecha */}
      <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-6 text-left text-lg max-[850px]:text-base max-[770px]:text-sm">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Juegos de casino</p>
          <p>Ruleta | Blackjack | Poker</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-semibold">Pagos</p>
          <p>Euros | Ethereum</p>
        </div>

        <div className="flex flex-col gap-1">
          <a
            href="/policies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Política de privacidad
          </a>

          <a
            href="/policies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Acuerdo con el usuario
          </a>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate("/about")}
            className="text-white hover:underline"
          >
            Sobre nosotros
          </button>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            GitHub
          </a>
        </div>

        {role?.toLowerCase() === "user" && (
          <div>
            <button
              className="text-[var(--Principal)] hover:underline"
              onClick={() => openAutoBanModal()}
            >
              AutoExpulsión
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
