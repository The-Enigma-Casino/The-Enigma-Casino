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
    if (token) {
      const toastId = toast.loading("Confirmando tu email...");

      confirmEmailFx(token)
        .then(() => {
          toast.success("Email confirmado exitosamente! 🙂", {
            id: toastId,
            className: "text-xl font-bold p-4",
          });

          setIsConfirmed(true);
        })
        .catch(() => {
          toast.error("No se pudo confirmar el email. 😟", {
            id: toastId,
            className: "text-xl font-bold p-4",
          });

          setIsConfirmed(false);
        });
    }
  }, [token]);

  return (
    <div className={`${classes.container} ${isConfirmed ? classes.open : ""}`}>
      <div className={`${classes.door} ${classes.left}`}></div>
      <div className={`${classes.door} ${classes.right}`}></div>

      {isConfirmed && (
        <div className={classes.content}>
          <h1 className={classes.title}>Bienvenido a The Enigma Casino</h1>
          <img src="/img/jumping-elf.webp" alt="Mascota" className={classes.elf} />
        </div>
      )}

      {isConfirmed === false && (
        <div className={classes.errorMessage}>
          <h1>No se pudo confirmar el email</h1>
          <p>Por favor, verifica tu enlace e inténtalo de nuevo.</p>
        </div>
      )}
    </div>
  );
};

export default ConfirmationComponent;
