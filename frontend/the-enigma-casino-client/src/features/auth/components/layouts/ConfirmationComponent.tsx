import classes from "./ConfirmationComponent.module.css";
import { useEffect } from "react";
import { confirmEmailFx } from "../../actions/authActions";
import toast from "react-hot-toast";

interface ConfirmationProps {
  token: string;
}

const ConfirmationComponent = ({ token }: ConfirmationProps) => {
  useEffect(() => {
    if (token) {
      const toastId = toast.loading("Confirmando tu email...");

      confirmEmailFx(token)
        .then((response) => {
          toast.success("Email confirmado exitosamente! 🙂", { id: toastId, className: "text-xl font-bold p-4" } );
          const timer = setTimeout(() => {
            window.close();
          }, 9000);

          return () => clearTimeout(timer);
        })
        .catch((error) => {
          toast.error("No se pudo confirmar el email. 😟", {  id: toastId, className: "text-xl font-bold p-4" });
          const timer = setTimeout(() => {
            window.close();
          }, 9000); 

          return () => clearTimeout(timer);
        });
    }
  }, [token]);

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Confirmación de Email</h1>
      <img src="/img/jumping-elf.webp" alt="Mascota" className={classes.elf} />
    </div>
  );
};

export default ConfirmationComponent;
