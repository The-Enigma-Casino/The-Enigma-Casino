import styles from "./ModalGachaComponent.module.css";
import { $gachaponPrice, loadGachaponPrice } from "../stores/gachaponStore";
import { useUnit } from "effector-react";
import { useEffect } from "react";
import GachaponMachine from "../../../GachaMachine/GachaMachineSVG";





interface ModalGachaComponentProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ModalGachaComponent: React.FC<ModalGachaComponentProps> = ({
  isOpen,
  closeModal,
}) => {
  const gachaponPrice = useUnit($gachaponPrice);

  useEffect(() => {
    if (isOpen) {
      loadGachaponPrice();
    }
  }, [isOpen]);

  console.log(gachaponPrice);

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
  
        <div className={styles.machineWrapper}>
          <GachaponMachine />
        </div>
  
        <p className={styles.priceText}>1 Tirada = {gachaponPrice} Fichas</p>
      </div>
    </div>
  );
};

export default ModalGachaComponent;
