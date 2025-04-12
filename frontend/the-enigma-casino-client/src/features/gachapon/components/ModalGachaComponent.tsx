import styles from "./ModalGachaComponent.module.css";
import Button from "../../../components/ui/button/Button";
import MachineComponent from "./MachineComponent";

interface ModalGachaComponentProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ModalGachaComponent: React.FC<ModalGachaComponentProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  return (
<div className={styles.modalOverlay}>
  <div className={styles.modalContainer}>
    <img
      className={styles.closeIcon}
      alt="Cerrar"
      src={"/svg/close.svg"}
      onClick={closeModal}
    />

    <div className={styles.headerText}>
      <p>GACHAPÓN</p>
      <p>DE LA SUERTE</p>
    </div>

    <div className={styles.imageFrame}>
      <MachineComponent />
    </div>

    <p className={styles.priceText}>1 Tirada = 10 Fichas</p>

    <Button
      variant="big"
      color="yellow"
      font="bold"
      onClick={() => {
        console.log("¡Juega ahora!");
        closeModal();
      }}
    >
      ¡JUEGA AHORA!
    </Button>
  </div>
</div>
  );
};

export default ModalGachaComponent;
