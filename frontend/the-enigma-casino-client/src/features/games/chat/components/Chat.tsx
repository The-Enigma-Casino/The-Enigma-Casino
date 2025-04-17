import { useState } from "react";
import styles from "./Chat.module.css";
import { ChatInput } from "./InputChat";
import { useUnit } from "effector-react";
import { $coins } from "../../../coins/store/coinsStore";
import { ChatMessage } from "./ChatMessage";
import { GameInfoModal } from "../../shared/components/modals/GameInfoModal";

interface ChatProps {
  gameType: "poker" | "blackjack" | "roulette";
}

export const Chat =  ({ gameType }: ChatProps) => {
  const coins = useUnit($coins);

  const messages = [
    {
      isOwn: false,
      username: "Jugador 2",
      avatarUrl: "/images/profile/user_default.png",
      message: "Hola 😁",
    },
    {
      isOwn: true,
      avatarUrl: "/images/profile/user_default.png",
      message: "¡Ey! ¿Jugamos?",
    },
    {
      isOwn: false,
      username: "Jugador 2",
      avatarUrl: "/images/profile/user_default.png",
      message:
        "AJSODHASJKb ASIJhdjkashdjas dba sduyha shdio aiuwdsiuduahsudb agshuidauisdu s bduiabisoudbuiabs  aushdoiuashduasuigdgauis hduasduiashdu hsuahduashdiuhasdhiuashdiuahsduiashduihsa",
    },
    {
      isOwn: true,
      avatarUrl: "/images/profile/user_default.png",
      message: "Claro que sí, amigo",
    },
    {
      isOwn: false,
      username: "Jugador 2",
      avatarUrl: "/images/profile/user_default.png",
      message:
        "AJSODHASJKb ASIJhdjkashdjas dba sduyha shdio aiuwdsiuduahsudb agshuidauisdu s bduiabisoudbuiabs  aushdoiuashduasuigdgauis hduasduiashdu hsuahduashdiuhasdhiuashdiuahsduiashduihsa",
    },
    {
      isOwn: true,
      avatarUrl: "/images/profile/user_default.png",
      message: "Claro que sí, amigo",
    },
    {
      isOwn: false,
      username: "Jugador 2",
      avatarUrl: "/images/profile/user_default.png",
      message:
        "AJSODHASJKb ASIJhdjkashdjas dba sduyha shdio aiuwdsiuduahsudb agshuidauisdu s bduiabisoudbuiabs  aushdoiuashduasuigdgauis hduasduiashdu hsuahduashdiuhasdhiuashdiuahsduiashduihsa",
    },
    {
      isOwn: true,
      avatarUrl: "/images/profile/user_default.png",
      message: "Claro que sí, amigo",
    },
    {
      isOwn: false,
      username: "Jugador 2",
      avatarUrl: "/images/profile/user_default.png",
      message:
        "AJSODHASJKb ASIJhdjkashdjas dba sduyha shdio aiuwdsiuduahsudb agshuidauisdu s bduiabisoudbuiabs  aushdoiuashduasuigdgauis hduasduiashdu hsuahduashdiuhasdhiuashdiuahsduiashduihsa",
    },
    {
      isOwn: true,
      avatarUrl: "/images/profile/user_default.png",
      message: "Claro que sí, amigo",
    },
  ];

  const [showInfo, setShowInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h3>CHAT</h3>
      </header>

      <div className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                isOwn={msg.isOwn}
                username={msg.username}
                avatarUrl={msg.avatarUrl}
                message={msg.message}
              />
            ))}
          </div>

          <div className={styles.inputWrapper}>
            <ChatInput />
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
        <GameInfoModal
          gameType={gameType}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
};
