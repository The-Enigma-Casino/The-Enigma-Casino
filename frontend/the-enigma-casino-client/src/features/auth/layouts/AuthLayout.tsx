import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";
import styles from "./AuthLayout.module.css"
import { useEffect } from "react";

function AuthLayout() {

    useEffect(() => {
    const flag = "__hasVisitedEnigma__";
    if (!window.name.includes(flag)) {
      window.name += ` ${flag}`;
    }
  }, []);

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
