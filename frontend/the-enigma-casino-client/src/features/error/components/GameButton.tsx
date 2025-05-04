import styles from "./GameButton.module.css";

type GameButtonProps = {
  onAction: () => void;
  color?: "green" | "red" | "orange";
  label: string;
};

export const GameButton = ({
  onAction,
  color = "green",
  label,
}: GameButtonProps) => {
  return (
    <button
      onPointerDown={onAction}
      className={`${styles["game-button"]} ${styles[color]}`}
    >
      {label}
    </button>
  );
};
