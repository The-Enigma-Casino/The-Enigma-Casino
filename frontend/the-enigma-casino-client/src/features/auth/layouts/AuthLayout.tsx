import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";
import styles from "./AuthLayout.module.css"

function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <Header />
      <main className={styles.authContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
