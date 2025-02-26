import { useEffect } from "react";
import classes from "./ConfirmationComponent.module.css";
import { confirmEmailFx } from "../../actions/authActions";

interface ConfirmationProps {
  token: string;
}

const ConfirmationComponent = ({ token }: ConfirmationProps) => {

  useEffect(() => {
    if (token) {
      confirmEmailFx(token);

      return () => {};
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
