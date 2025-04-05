import styles from "./Chat.module.css";
import { ChatInput } from "./InputChat";

export const Chat = () => {
  return (
    <>
      <header className={styles.header}>
        <h3>CHAT</h3>
      </header>

      <div className={styles.container}>
        <div className={styles.messages}></div>

        <div className={styles.inputWrapper}>
          <ChatInput />
        </div>

        <div className={styles.footer}>
          {/* <IconInfo />
          <FichasUsuario />
          <IconLogout /> */}
        </div>
      </div>
    </>
  );
};
