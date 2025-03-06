import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";

import styles from "./RootLayout.module.css";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className={styles.rootLayout}>
        <Header />
        <main className={styles.rootContent}>
          <Outlet />
        </main>
        <Footer />
    </div>
  );
}

export default RootLayout;
