import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";

import styles from "./RootLayout.module.css";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className={styles.rootLayout}>
      <main>
        <Header />
        <main className={styles.rootContent}>
          <Outlet />
        </main>
        <Footer />
      </main>
    </div>
  );
}

export default RootLayout;
