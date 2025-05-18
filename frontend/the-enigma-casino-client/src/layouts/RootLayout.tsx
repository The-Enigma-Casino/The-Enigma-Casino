import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";
import { NavigationInit } from "../features/games/shared/router/NavigationInit";
import styles from "./RootLayout.module.css";
import { Outlet, useLocation } from "react-router-dom";


function RootLayout() {
  const location = useLocation();
  const isGameRoute = location.pathname.includes("/game/");

  return (
    <>
      <NavigationInit />
      <div className={styles.rootLayout}>
        {!isGameRoute && <Header />}
        <main className={styles.rootContent}>
          <Outlet />
        </main>
        {!isGameRoute && <Footer />}
      </div>
    </>
  );
}

export default RootLayout;
