import { useState } from "react";
import styles from "./InputChat.module.css";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={styles.chatInputWrapper}>
      <input
        type="text"
        placeholder="Escribe aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.chatInput}
        disabled={disabled}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        disabled={disabled}
      >
        <img
          src="/svg/send_icon.svg"
          alt="Enviar"
          className={styles.sendIcon}
        />
      </button>
    </div>
  );
};
