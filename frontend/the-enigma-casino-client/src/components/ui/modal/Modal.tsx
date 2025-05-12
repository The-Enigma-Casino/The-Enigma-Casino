import React from "react";
import ReactDOM from "react-dom";
import classes from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "smallPlus" | "medium" | "large";
  position?: "center" | "top" | "bottom";
}

/**
 * Modal Component
 *
 * Este componente renderiza un modal personalizable con diferentes tamaños, colores y posiciones.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal está abierto.
 * @param {() => void} props.onClose - Función para cerrar el modal.
 * @param {React.ReactNode} props.children - Contenido del modal.
 * @param {string} [props.size] - Tamaño del modal ("small", "smallPlus", "medium", "large").
 * @param {string} [props.color] - Color del modal (ej: "white", "gray", "dark").
 * @param {string} [props.position] - Posición del modal ("center", "top", "bottom").
 *
 * @example
 * <Modal isOpen={true} onClose={() => setOpen(false)} size="medium" color="white" position="center">
 *   <p>Contenido del modal</p>
 * </Modal>
 *
 * @returns {JSX.Element | null} Componente `<Modal />` o `null` si está cerrado.
 */

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = "medium", position = "center" }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={classes.overlay} onClick={onClose}>
      <div className={`${classes.modal} ${classes[size]} ${classes[position]}`} onClick={(e) => e.stopPropagation()}>
        <button className={classes.close} onClick={onClose}><img src="/svg/close.svg" alt="Cerrar" className={classes.closeIcon} /></button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
