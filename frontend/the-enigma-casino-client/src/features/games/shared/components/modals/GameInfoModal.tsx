import Modal from "../../../../../components/ui/modal/Modal";
import { useMediaQuery } from "../../../../../utils/useMediaQuery";
import styles from "./GameInfoModal.module.css";
import BlackjackDescription from "./infos/BlackjackDescription";
import PokerDescription from "./infos/PokerDescription";
import RouletteDescription from "./infos/RouletteDescription";

interface GameInfoModalProps {
  isOpen: boolean;
  gameType: "poker" | "blackjack" | "roulette";
  onClose: () => void;
}

export const GameInfoModal = ({
  gameType,
  onClose,
  isOpen,
}: GameInfoModalProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      position="center"
      closePosition="top-left"
    >
      <section
        className={`flex flex-col gap-4 px-8 sm:px-12 md:px-16 py-6 text-white max-h-[70vh] overflow-y-auto ${styles.modalScroll}`}
      >
        <h2 className="text-[2.8rem] font-bold text-[var(--Principal)] text-center mb-2">
          {getTitle(gameType)}
        </h2>

        {getDescriptionComponent(gameType, isMobile)}
      </section>
    </Modal>
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
      return "Juego";
  }
};

const getDescriptionComponent = (gameType: string, isMobile: boolean) => {
  switch (gameType) {
    case "poker":
      return <PokerDescription isMobile={isMobile} />;
    case "blackjack":
      return <BlackjackDescription isMobile={isMobile} />;
    case "roulette":
      return <RouletteDescription isMobile={isMobile} />;
    default:
      return <p>Información no disponible.</p>;
  }
};
