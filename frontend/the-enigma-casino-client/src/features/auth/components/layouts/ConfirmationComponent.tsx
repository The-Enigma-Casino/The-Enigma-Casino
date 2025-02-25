import { useEffect } from "react";
import classes from "./ConfirmationComponent.module.css";
import { confirmEmailFx } from "../../actions/authActions";
import { useNavigate } from "react-router-dom";

interface ConfirmationProps {
  token: string;
}

const ConfirmationComponent = ({ token }: ConfirmationProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      confirmEmailFx(token);

      const timer = setTimeout(() => {
        navigate("/auth/login");
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Confirmación de Email</h1>
      <img src="/img/jumping-elf.webp" alt="Mascota" className={classes.elf} />
    </div>
  );
};

export default ConfirmationComponent;
