import { useUnit } from "effector-react";
import { useEffect } from "react";
import { $gachaponPrice, loadGachaponPrice } from "../stores/gachaponStore";
import GachaponMachine from "./GachaMachine/GachaponMachine";
import { useIsScreenTooSmallForGacha } from "./GachaMachine/useIsScreenTooSmallForGacha";

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

  const isTooSmall = useIsScreenTooSmallForGacha();

  if (!isOpen) return null;

  if (isTooSmall) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/90 text-white text-center text-xl font-bold flex flex-col items-center justify-center p-6 cursor-pointer"
        onClick={closeModal}
      >
        <p className="text-balance max-w-[500px]">
          El gachapón no puede usarse en horizontal si la pantalla es muy
          pequeña. 📵
          <br />
          Gira tu dispositivo a vertical o usa una pantalla más grande.
        </p>
        <div className="text-sm font-normal mt-4 text-white/80">
          (Pulsa para volver atrás)
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
      <div
        className="relative 
    w-[92vw] max-w-[640px] 
    max-h-[95vh] 
    bg-[var(--Background-Overlay)] border-2 border-[var(--Principal)] rounded-2xl 
    px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-6 
    flex flex-col items-center 
    overflow-y-auto"
      >
        {/* Botón cerrar */}
        <img
          src="/svg/close.svg"
          alt="Cerrar"
          className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 cursor-pointer z-[1000]"
          onClick={closeModal}
        />

        {/* Título */}
        <div className="text-[2rem] sm:text-[3rem] text-[var(--Principal)] text-center leading-tight pt-4 font-bold font-['Reddit_Sans'] [text-shadow:1px_1px_2px_rgba(0,0,0,1)]">
          <p>GACHAPÓN</p>
          <p>DE LA SUERTE</p>
        </div>

        {/* Gachapon */}
        <GachaponMachine />

        {/* Precio */}
        <p className="font-bold text-lg sm:text-2xl text-[var(--Principal)] text-center pt-2 sm:pt-4 font-['Reddit_Sans']">
          1 Tirada = {gachaponPrice} Fichas
        </p>
      </div>
    </div>
  );
};

export default ModalGachaComponent;
