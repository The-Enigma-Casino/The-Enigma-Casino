import styles from "./GameInfoModal.module.css";

interface GameInfoModalProps {
  gameType: "poker" | "blackjack" | "roulette";
  onClose: () => void;
}

export const GameInfoModal = ({ gameType, onClose }: GameInfoModalProps) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <img src="/svg/rectangle.svg" alt="Fondo" className={styles.background} />

        <img src="/svg/vector.svg" alt="Cerrar" className={styles.closeIcon} onClick={onClose} />

        <h2 className={styles.title}>{getTitle(gameType)}</h2>
        <p className={styles.description}>{getDescription(gameType)}</p>
      </div>
    </div>
  );
};

const getTitle = (gameType: string) => {
  switch (gameType) {
    case "poker":
      return "Póker clásico";
    case "blackjack":
      return "Blackjack 21";
    case "roulette":
      return "Ruleta europea";
    default:
      return "";
  }
};

const getDescription = (gameType: string) => {
  switch (gameType) {
    case "poker":
      return "Gana al resto con la mejor jugada de cinco cartas. Usa tu ingenio, farolea y apuesta sabiamente.";
    case "blackjack":
      return "Llega a 21 sin pasarte. Pide carta, plántate o dobla tu apuesta según la jugada.";
    case "roulette":
      return "Apuesta al número, color o sección. Haz girar la ruleta y cruza los dedos.";
    default:
      return "";
  }
};