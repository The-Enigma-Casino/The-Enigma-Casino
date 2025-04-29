import { useEffect, useState } from "react";
import styles from "./Chat.module.css";
import { ChatInput } from "./InputChat";
import { useUnit } from "effector-react";
import { $coins } from "../../../coins/store/coinsStore";
import { ChatMessage } from "./ChatMessage";
import { GameInfoModal } from "../../shared/components/modals/GameInfoModal";
import { $chatMessages, resetMessages } from "../stores/chatStore";
import { $userId } from "../../../auth/store/authStore";
import { messageSent } from "../stores/chatStore";
import { $currentTableId } from "../../../gameTables/store/tablesStores";


interface ChatProps {
  gameType: "poker" | "blackjack" | "roulette";
}

export const Chat = ({ gameType }: ChatProps) => {
  const coins = useUnit($coins);
  const userId = useUnit($userId);
  const tableId = useUnit($currentTableId);

  const chatMessages = useUnit($chatMessages);

  useEffect(() => {
    console.log("[Chat] UseEffect Mensajes recibidos:", chatMessages);
    // return () => {
    //   resetMessages();
    // }
  }, [chatMessages]);

  const [showInfo, setShowInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSend = (text: string) => {
    console.log("[Chat] Mensaje enviado:", text);
    messageSent({ tableId, text });
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h3>CHAT</h3>
      </header>

      <div className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.messages}>
            {chatMessages.map((msg, index) => (
              <ChatMessage
                key={index}
                isOwn={msg.userId.toString() === userId}
                username={msg.nickname}
                avatarUrl={msg.avatarUrl}
                message={msg.text}
              />
            ))}
          </div>

          <div className={styles.inputWrapper}>
          <ChatInput onSend={handleSend} />
          </div>
        </div>

        <div className={styles.coinsDisplay}>
          {coins} <img src="/svg/coins.svg" alt="Fichas" />
        </div>

        <footer className={styles.footer}>
          <button
            className={styles.iconButton}
            onClick={() => setShowInfo(true)}
          >
            <img src="/svg/info_icon.svg" alt="Info" className={styles.icon} />
          </button>

          <button
            className={styles.iconButton}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <img
              src="/svg/logout_icon.svg"
              alt="Salir"
              className={styles.icon}
            />
          </button>
        </footer>
      </div>

      {showInfo && (
        <GameInfoModal gameType={gameType} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
};
