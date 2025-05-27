import { useState } from "react";
import styles from "./Chat.module.css";
import { ChatInput } from "./InputChat";
import { useUnit } from "effector-react";
import { $coins } from "../../../coins/store/coinsStore";
import { ChatMessage } from "./ChatMessage";
import { GameInfoModal } from "../../shared/components/modals/GameInfoModal";
import { $userId } from "../../../auth/store/authStore";
import { $chatMessages, messageSent } from "../stores/chatStore";
import {
  $currentTableId,
  $hasLeftTable,
} from "../../../gameTables/store/tablesStores";
import {
  markLeftTable,
  sendLeaveTableMessage,
} from "../../../gameTables/store/tablesEvents";
import { navigateTo } from "../../shared/router/navigateFx";
import { InviteFriendButton } from "../../../friends/ui/InviteFriendButton";
import {
  inviteFriendFromTable,
  stopGameLoading,
} from "../../../friends/stores/friends.events";
import { $friends } from "../../../friends/stores/friends.store";
import toast from "react-hot-toast";

interface ChatProps {
  gameType: "poker" | "blackjack" | "roulette";
}

export const Chat = ({ gameType }: ChatProps) => {
  const coins = useUnit($coins);
  const userId = useUnit($userId);
  const tableId = useUnit($currentTableId);
  const hasLeft = useUnit($hasLeftTable);

  const chatMessages = useUnit($chatMessages);
  const onlineFriends = useUnit($friends);

  const [showInfo, setShowInfo] = useState(false);

  const handleSend = (text: string) => {
    if (tableId !== null) {
      messageSent({ tableId, text });
    } else {
      toast.error("No hay una mesa activa para enviar mensajes.");
    }
  };
  const handleLogout = () => {
    if (!hasLeft) {
      sendLeaveTableMessage();
      markLeftTable();
    }

    navigateTo("/");
  };

  const isOnlineFriends = onlineFriends.filter((f) => f.isOnline && f.status !== "Playing");

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

          <InviteFriendButton
            className={styles.iconButton}
            onlineFriends={isOnlineFriends}
            onInvite={(friendId) => {
              if (tableId !== null) {
                inviteFriendFromTable({ friendId, tableId });
              } else {
                console.warn(
                  "No hay una mesa activa para enviar la invitación."
                );
              }
            }}
          />

          <button
            className={styles.iconButton}
            onClick={() => {
              handleLogout();
              stopGameLoading();
            }}
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
