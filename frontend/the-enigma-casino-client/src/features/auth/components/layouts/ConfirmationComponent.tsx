import classes from "./ConfirmationComponent.module.css";

interface ConfirmationProps {
  token: string;
}

function ConfirmationComponent({ token }: ConfirmationProps) {
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Confirmación de Email</h1>
      <img src="/img/jumping-elf.webp" alt="Mascota" className={classes.elf}/>
    </div>
  );
}

export default ConfirmationComponent;
