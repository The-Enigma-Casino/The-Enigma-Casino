// components/InputChat.tsx
import { useState } from "react";

import styles from "./InputChat.module.css";

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() === "") return;
    onSend?.(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={styles.chatInputWrapper}>
      <input
        type="text"
        placeholder="Escribe aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className={styles.chatInput}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
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
