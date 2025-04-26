import { USER_IMAGES } from "../../../../config";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  isOwn?: boolean;
  username?: string;
  message: string;
  avatarUrl: string;
}

export const ChatMessage = ({ isOwn = false, username, message, avatarUrl }: ChatMessageProps) => {
  return (
    <div className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other}`}>
      <div className={styles.bubble}>
        <div className={styles.header}>
          <img src={USER_IMAGES + "/" + avatarUrl} alt="Avatar" className={styles.avatar} />
          {!isOwn && username && <span className={styles.username}>{username}</span>}
        </div>
        <div className={styles.text}>{message}</div>
      </div>
    </div>
  );
};
