import { useEffect } from "react";
import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";
import { NavigationInit } from "../features/games/shared/router/NavigationInit";
import styles from "./RootLayout.module.css";
import { Outlet, useLocation } from "react-router-dom";
import { fetchReceivedRequestsFx } from "../features/friends/stores";

function RootLayout() {
  const location = useLocation();
  const isGameRoute = location.pathname.includes("/game/");

    useEffect(() => {
    const interval = setInterval(() => {
      fetchReceivedRequestsFx();
    }, 10000); // cada 10 segundos

    return () => clearInterval(interval);
  }, []);
  
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
