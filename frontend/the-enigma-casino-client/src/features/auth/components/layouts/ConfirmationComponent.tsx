import { useEffect, useState } from "react";
import classes from "./ConfirmationComponent.module.css";
import { confirmEmailFx } from "../../actions/authActions";
import toast from "react-hot-toast";

interface ConfirmationProps {
  token: string;
}

const ConfirmationComponent = ({ token }: ConfirmationProps) => {
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    let closeTimeout: NodeJS.Timeout;

    if (token) {
      const toastId = toast.loading("Confirmando tu email...");

      confirmEmailFx(token)
        .then(() => {
          toast.success("Email confirmado exitosamente! 🙂", {
            id: toastId,
            className: "text-xl font-bold p-4",
          });

          setIsConfirmed(true);

          closeTimeout = setTimeout(() => {
            window.close();
          }, 20000);
        })
        .catch(() => {
          toast.error("No se pudo confirmar el email. 😟", {
            id: toastId,
            className: "text-xl font-bold p-4",
          });

          setIsConfirmed(false);
        });
    }

    return () => {
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, [token]);

  return (
    <section
      className={`${classes.container} ${isConfirmed ? classes.open : ""}`}
    >
      <div className={`${classes.door} ${classes.left}`}></div>
      <div className={`${classes.door} ${classes.right}`}></div>

      {isConfirmed && (
        <div className="relative w-full h-screen min-h-screen overflow-hidden flex justify-center items-center">
          <div
            className={`${classes.elf} absolute inset-x-0 bottom-[5vh] z-[2] flex justify-center pointer-events-none`}
          >
            <img
              src="/img/duende2.png"
              alt="duende"
              className="w-full h-auto object-contain min-w-[600px]
    sm:max-w-[600px]  md:max-w-[900px] lg:max-w-[800px] xl:max-w-[900px]
    md:max-h-[70vh] lg:max-h-[80vh]"
            />
          </div>

          <div className="absolute top-[8vh] w-full flex justify-center z-20 text-center px-4">
            <div className={`${classes.content} max-w-[90vw]`}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl font-bold leading-tight whitespace-normal">
                ¡Bienvenido!
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight whitespace-normal">
                THE ENIGMA CASINO
              </h1>
            </div>
          </div>
        </div>
      )}

      {isConfirmed === false && (
        <div className={classes.errorMessage}>
          <h1>No se pudo confirmar el email</h1>
          <p>Por favor, verifica tu enlace e inténtalo de nuevo.</p>
        </div>
      )}
    </section>
  );
};

export default ConfirmationComponent;
